// PostList.jsx

import React, { useState, useEffect } from "react";
import "../../styles/components/post.css";
import { FiThumbsUp } from "react-icons/fi";
import AddComment from "../Comment/AddComment";
import { usePosts } from "../../context/PostContext";
import { useComments } from "../../context/CommentContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const PostList = () => {
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const { toggleLikePost } = usePosts();
  const { fetchCommentsByPostId } = useComments();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeFunctions = [];
    let postsMap = new Map();

    const fetchAndSubscribeToPosts = async () => {
      try {
        const friendshipsRef = collection(db, "Friendships");

        // Fetch friendships where currentUserUid is either user1 or user2
        const friendshipsQuery1 = query(
          friendshipsRef,
          where("user1", "==", currentUser.uid)
        );
        const friendshipsQuery2 = query(
          friendshipsRef,
          where("user2", "==", currentUser.uid)
        );

        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(friendshipsQuery1),
          getDocs(friendshipsQuery2),
        ]);

        const friendIdsSet = new Set();

        // Collect friend UIDs
        snapshot1.forEach((doc) => {
          const data = doc.data();
          friendIdsSet.add(data.user2);
        });
        snapshot2.forEach((doc) => {
          const data = doc.data();
          friendIdsSet.add(data.user1);
        });

        // Include current user's UID
        friendIdsSet.add(currentUser.uid);

        const friendIds = Array.from(friendIdsSet);

        if (friendIds.length === 0) {
          console.log("No friends found.");
          setPosts([]);
          setLoading(false);
          return;
        }

        // Handle Firestore limitation of 10 items in 'in' queries
        const chunks = [];
        const chunkSize = 10;

        for (let i = 0; i < friendIds.length; i += chunkSize) {
          chunks.push(friendIds.slice(i, i + chunkSize));
        }

        chunks.forEach((chunk) => {
          const postsQuery = query(
            collection(db, "Posts"),
            where("uid", "in", chunk),
            orderBy("createdAt", "desc")
          );

          const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
            const changes = snapshot.docChanges();
            let postsChanged = false;

            for (const change of changes) {
              const postDoc = change.doc;
              const postData = postDoc.data();
              const userDoc = await getDoc(doc(db, "Users", postData.uid));
              const userData = userDoc.exists() ? userDoc.data() : null;
              const post = {
                id: postDoc.id,
                ...postData,
                user: userData,
              };

              if (change.type === "added" || change.type === "modified") {
                postsMap.set(post.id, post);
                postsChanged = true;
              } else if (change.type === "removed") {
                postsMap.delete(post.id);
                postsChanged = true;
              }
            }

            if (postsChanged) {
              // Update the posts state
              const allPostsArray = Array.from(postsMap.values());
              // Sort all posts by createdAt in descending order
              allPostsArray.sort((a, b) => b.createdAt - a.createdAt);
              setPosts(allPostsArray);
            }
            setLoading(false);
          });

          unsubscribeFunctions.push(unsubscribe);
        });
      } catch (error) {
        console.error("Error subscribing to posts:", error);
        setLoading(false);
      }
    };

    fetchAndSubscribeToPosts();

    return () => {
      // Clean up the listeners
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // Fetch comments when comments are toggled on
    if (!showComments[postId]) {
      fetchCommentsByPostId(postId)
        .then((postComments) => {
          setComments((prev = {}) => ({
            ...prev,
            [postId]: postComments,
          }));
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
        });
    }
  };

  const handleCommentAdded = async (postId) => {
    try {
      const updatedComments = await fetchCommentsByPostId(postId);
      setComments((prev = {}) => ({
        ...prev,
        [postId]: updatedComments,
      }));
    } catch (error) {
      console.error("Error updating comments after adding:", error);
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!currentUser?.uid) return; // Ensure user is logged in
    await toggleLikePost(postId, currentUser.uid, isLiked, "Posts");
  };

  return (
    <div className="post-list">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            {/* User Info */}
            <div className="post-header">
              <img
                src={post.user?.photoURL || "https://via.placeholder.com/50"}
                alt={"Avatar of the user who created the post."}
                className="user-avatar"
                onClick={() => navigate(`/user/${post.user.uid}`)}
              />
              <div className="user-info">
                <h4
                  onClick={() => navigate(`/user/${post.user.uid}`)}
                  className="post-user-name"
                >
                  {post.user?.name}
                </h4>
                <p>
                  {post.createdAt
                    ? post.createdAt.toDate().toLocaleString()
                    : ""}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="post-content">
              <p>{post.postContent}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="Post visual" />}
            </div>

            {/* Actions */}
            <div className="post-actions">
              <button
                className={`action-button ${
                  post.likes.includes(currentUser?.uid) ? "liked" : ""
                }`}
                onClick={() =>
                  handleLike(post.id, post.likes.includes(currentUser?.uid))
                }
              >
                <FiThumbsUp />
                {post.likes.includes(currentUser?.uid) ? " Unlike" : " Like"}
              </button>
            </div>

            {/* Likes and Comments */}
            <div className="post-footer">
              <div className="likes">
                ❤️ {post.likes.length}{" "}
                {post.likes.length === 1 ? "Like" : "Likes"}
              </div>
              <button
                className="toggle-comments-btn"
                onClick={() => handleToggleComments(post.id)}
              >
                {showComments[post.id]
                  ? "Hide Comments"
                  : `View Comments (${comments[post.id]?.length || 0})`}
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="comments-section">
                {comments[post.id]?.length > 0 ? (
                  comments[post.id].map((comment) => (
                    <div key={comment.id} className="comment">
                      <img
                        src={
                          comment.user?.photoURL ||
                          "https://via.placeholder.com/50"
                        }
                        alt="User Avatar"
                        className="comment-user-avatar"
                        onClick={() => navigate(`/user/${comment.user.uid}`)}
                      />
                      <strong
                        onClick={() => navigate(`/user/${comment.user.uid}`)}
                        className="comment-user-name"
                      >
                        {comment.user?.name || "Anonymous"}:
                      </strong>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            )}

            {/* Add Comment */}
            <AddComment
              postId={post.id}
              onAddComment={() => handleCommentAdded(post.id)}
            />
          </div>
        ))
      ) : (
        <div className="no-posts-message">
          <p>No posts to show from you or your friends.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;
