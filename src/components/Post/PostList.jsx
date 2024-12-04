import React, { useState, useEffect } from "react";
import "../../styles/components/post.css";
import { FiThumbsUp } from "react-icons/fi";
import AddComment from "../Comment/AddComment";
import { usePosts } from "../../context/PostContext";
import { useComments } from "../../context/CommentContext";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const PostList = ({ contextType, contextId, userId, feed }) => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loading, setLoading] = useState(true);
  const { toggleLikePost } = usePosts();
  const { fetchCommentsByPostId } = useComments();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Helper function to chunk arrays
  const chunkArray = (array, size) => {
    const result = [];
    const arrayCopy = [...array];
    while (arrayCopy.length) {
      result.push(arrayCopy.splice(0, size));
    }
    return result;
  };

  // Function to fetch friend IDs
  const getFriendIds = async (uid) => {
    try {
      const friendshipsRef = collection(db, "Friendships");

      // Fetch friendships where currentUserUid is either user1 or user2
      const friendshipsQuery1 = query(
        friendshipsRef,
        where("user1", "==", uid)
      );
      const friendshipsQuery2 = query(
        friendshipsRef,
        where("user2", "==", uid)
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

      // Include current user's UID to display their own posts in feed
      friendIdsSet.add(uid);

      const friendIds = Array.from(friendIdsSet);
      return friendIds;
    } catch (error) {
      console.error("Error fetching friend IDs:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchPosts = async () => {
      let unsubscribeFunctions = [];

      if (feed) {
        console.log("Fetching feed posts for user:", currentUser.uid);
        const friendIds = await getFriendIds(currentUser.uid);

        if (friendIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        const chunks = chunkArray(friendIds, 10);
        let allPostsMap = new Map();

        for (const chunk of chunks) {
          const chunkQuery = query(
            collection(db, "Posts"),
            where("uid", "in", chunk),
            orderBy("createdAt", "desc")
          );

          const unsubscribe = onSnapshot(chunkQuery, async (snapshot) => {
            let postsChanged = false;

            for (const change of snapshot.docChanges()) {
              const postDoc = change.doc;
              const postData = postDoc.data();

              // Exclude context-specific posts to display general feed
              if (postData.contextType) continue;

              const postId = postDoc.id;

              if (change.type === "removed") {
                allPostsMap.delete(postId);
                postsChanged = true;
              } else {
                allPostsMap.set(postId, { id: postId, ...postData });
                postsChanged = true;
              }
            }

            if (postsChanged) {
              // Fetch unique user IDs from posts
              const uniqueUserIds = Array.from(
                new Set(
                  Array.from(allPostsMap.values()).map((post) => post.uid)
                )
              );

              // Fetch user data for all unique user IDs
              const userDocs = await Promise.all(
                uniqueUserIds.map((uid) => getDoc(doc(db, "Users", uid)))
              );

              const userDataMap = new Map();
              userDocs.forEach((docSnap) => {
                if (docSnap.exists()) {
                  userDataMap.set(docSnap.id, docSnap.data());
                }
              });

              // Attach user data to posts
              const allPostsArray = Array.from(allPostsMap.values()).map(
                (post) => ({
                  ...post,
                  user: userDataMap.get(post.uid) || {
                    name: "Unknown User",
                    photoURL: "https://via.placeholder.com/50",
                    uid: post.uid,
                  },
                })
              );

              // Sort posts by createdAt
              allPostsArray.sort(
                (a, b) =>
                  (b.createdAt?.toMillis() || 0) -
                  (a.createdAt?.toMillis() || 0)
              );

              setPosts(allPostsArray);
              setLoading(false);
            }
          });

          unsubscribeFunctions.push(unsubscribe);
        }

        return () => {
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
        };
      } else if (contextType && contextId) {
        console.log(`Fetching posts for ${contextType} with ID: ${contextId}`);

        const postsQuery = query(
          collection(db, "Posts"),
          where("contextType", "==", contextType),
          where("contextId", "==", contextId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
          const fetchedPosts = [];

          for (const docSnapshot of snapshot.docs) {
            const postData = docSnapshot.data();

            // Fetch user data
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            fetchedPosts.push({
              id: docSnapshot.id,
              ...postData,
              user: userData || {
                name: "Unknown User",
                photoURL: "https://via.placeholder.com/50",
                uid: postData.uid,
              },
            });
          }

          // Sort posts by createdAt
          fetchedPosts.sort(
            (a, b) =>
              (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
          );

          setPosts(fetchedPosts);
          setLoading(false);
        });

        unsubscribeFunctions.push(unsubscribe);

        return () => {
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
        };
      } else if (userId) {
        console.log(`Fetching posts for user with ID: ${userId}`);

        const postsQuery = query(
          collection(db, "Posts"),
          where("uid", "==", userId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
          const fetchedPosts = [];

          for (const docSnapshot of snapshot.docs) {
            const postData = docSnapshot.data();

            // Fetch user data
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            fetchedPosts.push({
              id: docSnapshot.id,
              ...postData,
              user: userData || {
                name: "Unknown User",
                photoURL: "https://via.placeholder.com/50",
                uid: postData.uid,
              },
            });
          }

          // Sort posts by createdAt
          fetchedPosts.sort(
            (a, b) =>
              (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
          );

          setPosts(fetchedPosts);
          setLoading(false);
        });

        unsubscribeFunctions.push(unsubscribe);

        return () => {
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
        };
      } else {
        // Default behavior: fetch all posts or handle accordingly
        console.log("Fetching all posts");

        const postsQuery = query(
          collection(db, "Posts"),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
          const fetchedPosts = [];

          for (const docSnapshot of snapshot.docs) {
            const postData = docSnapshot.data();

            // Fetch user data
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            fetchedPosts.push({
              id: docSnapshot.id,
              ...postData,
              user: userData || {
                name: "Unknown User",
                photoURL: "https://via.placeholder.com/50",
                uid: postData.uid,
              },
            });
          }

          // Sort posts by createdAt
          fetchedPosts.sort(
            (a, b) =>
              (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
          );

          setPosts(fetchedPosts);
          setLoading(false);
        });

        unsubscribeFunctions.push(unsubscribe);

        return () => {
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
        };
      }
    };

    fetchPosts().catch((error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });
  }, [currentUser, contextType, contextId, userId, feed]);

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    if (!showComments[postId]) {
      fetchCommentsByPostId(postId)
        .then((postComments) => {
          setComments((prev) => ({
            ...prev,
            [postId]: postComments,
          }));
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
        });
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Posts", postId));
      toast.success("Post deleted successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.", {
        position: "bottom-center",
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Comments", commentId));
      toast.success("Comment deleted successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.", {
        position: "bottom-center",
      });
    }
  };

  const handleCommentAdded = async (postId) => {
    try {
      const updatedComments = await fetchCommentsByPostId(postId);
      setComments((prev) => ({
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="post-list">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            {/* User Info */}
            <div className="post-header">
              <img
                src={post.user?.photoURL || "https://via.placeholder.com/50"}
                alt="User Avatar"
                className="user-avatar"
                onClick={() =>
                  post.user?.uid && navigate(`/user/${post.user.uid}`)
                }
              />
              <div className="user-info">
                <h4
                  onClick={() =>
                    post.user?.uid && navigate(`/user/${post.user.uid}`)
                  }
                  className="post-user-name"
                >
                  {post.user?.name || "Unknown User"}
                </h4>
                <p>
                  {post.createdAt
                    ? post.createdAt.toDate().toLocaleString()
                    : ""}
                </p>
              </div>
              {post.user.uid == currentUser.uid && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(post.id)}
                  aria-label="Delete Post"
                >
                  ×
                </button>
              )}
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
                        onClick={() =>
                          comment.user?.uid &&
                          navigate(`/user/${comment.user.uid}`)
                        }
                      />
                      <strong
                        onClick={() =>
                          comment.user?.uid &&
                          navigate(`/user/${comment.user.uid}`)
                        }
                        className="comment-user-name"
                      >
                        {comment.user?.name || "Anonymous"}:
                      </strong>

                      <div className="comment-content">{comment.content}</div>
                      {comment.user.uid == currentUser.uid && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label="Delete Comment"
                        >
                          ×
                        </button>
                      )}
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
          <p>No posts to show.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;
