import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../styles/components/post.css";
import AddComment from "../components/Comment/AddComment";
import { FiThumbsUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import { useComments } from "../context/CommentContext";
import Navbar from "../components/Navbar";

const PostViewer = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "Users", uid));
      return userDoc.exists() ? { uid, ...userDoc.data() } : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const fetchPost = async (postId) => {
    try {
      const postRef = doc(db, "Posts", postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const userData = await fetchUserData(postData.uid);

        setPost({
          id: postId,
          ...postData,
          user: userData || {
            name: "Unknown User",
            photoURL: "https://via.placeholder.com/50",
          },
        });
      } else {
        console.error("Post not found.");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const commentsRef = collection(db, "Comments");
      const commentsQuery = query(
        commentsRef,
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      );
      const commentsSnapshot = await getDocs(commentsQuery);

      const commentsWithUserData = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          const userData = await fetchUserData(commentData.userId);

          return {
            id: commentDoc.id,
            ...commentData,
            user: userData || {
              name: "Anonymous",
              photoURL: "https://via.placeholder.com/50",
            },
          };
        })
      );

      setComments(commentsWithUserData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleLike = async (isLiked) => {
    if (!currentUser?.uid || !post?.id) return;

    try {
      const postRef = doc(db, "Posts", post.id);
      const updateLikes = isLiked
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid);

      await updateDoc(postRef, { likes: updateLikes });

      setPost((prev) => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter((id) => id !== currentUser.uid)
          : [...prev.likes, currentUser.uid],
      }));
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Comments", commentId));

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    if (postId) {
      setLoading(true);
      Promise.all([fetchPost(postId), fetchComments(postId)]).then(() =>
        setLoading(false)
      );
    }
  }, [postId]);

  return (
    <>
      <Navbar />
      <div className="post-list">
        {loading ? (
          <p>Loading post...</p>
        ) : post ? (
          <div className="post-card">
            {/* Post Header */}
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
                  post.likes?.includes(currentUser?.uid) ? "liked" : ""
                }`}
                onClick={() =>
                  handleLike(post.likes?.includes(currentUser?.uid))
                }
              >
                <FiThumbsUp />
                {post.likes?.includes(currentUser?.uid) ? " Unlike" : " Like"}
              </button>
            </div>

            {/* Likes and Comments */}
            <div className="post-footer">
              <div className="likes">
                ❤️ {post.likes?.length || 0}{" "}
                {post.likes?.length === 1 ? "Like" : "Likes"}
              </div>
              <button
                className="toggle-comments-btn"
                onClick={handleToggleComments}
              >
                {showComments
                  ? "Hide Comments"
                  : `View Comments (${comments.length || 0})`}
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="comments-section">
                {comments.length > 0 ? (
                  comments.map((comment) => (
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
                      {comment.user?.uid === currentUser?.uid && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet.</p>
                )}
              </div>
            )}

            {/* Add Comment */}
            <AddComment
              postId={post.id}
              onAddComment={() => fetchComments(post.id)}
            />
          </div>
        ) : (
          <p>Post not found.</p>
        )}
      </div>
    </>
  );
};

export default PostViewer;
