import React from "react";
import "../../styles/components/post.css";
import { FiThumbsUp, FiMessageCircle } from "react-icons/fi";
import { useState, useEffect } from "react";
import AddComment from "../Comment/AddComment";
import { usePosts } from "../../context/PostContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDoc, doc } from "firebase/firestore";
import { useComments } from "../../context/CommentContext";
import ImageModal from "../Modals/ImageModal";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

const ListMyPosts = () => {
  const [showComments, setShowComments] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const { fetchCommentsByPostId, createComment } = useComments();
  const { myPosts, fetchMyPosts, fetchUserData } = usePosts();
  const { currentUser } = useAuth(); // Get the logged-in user's info
  const { uid } = useParams();
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const userData = await fetchUserData(uid); // Fetch user data based on userId
      setUserDetails(userData);
      setLoading(false);
    };

    if (uid) {
      loadUserData();
    }
  }, [uid]);

  // Fetch current user's posts on component mount or when user changes
  useEffect(() => {
    if (uid) {
      fetchMyPosts(uid); // Only fetch if uid is defined
    } else {
      console.error("No user ID found in URL");
    }
  }, [uid]); // Trigger the effect when uid changes

  if (loading) return <p>Loading...</p>;

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      await createComment(
        postId,
        newComment,
        currentUser.uid,
        currentUser.fname,
        currentUser.lname,
        currentUser.photoURL
      );
      setNewComment("");
      const updatedComments = await fetchCommentsByPostId(postId);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedComments,
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = () => setShowComments(!showComments);

  return (
    <div className="post-list">
      {myPosts.map((post) => (
        <div key={post.id} className="post-card">
          {/* User Info */}

          <div className="post-header">
            <img
              src={userDetails?.photoURL || "https://via.placeholder.com/50"}
              alt={"Avatar of the user who created the post."}
              className="user-avatar"
            />
            <div className="user-info">
              <h4>{userDetails?.name}</h4>
              <p>{post.timestamp}</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="post-content">
            <p>{post.postContent}</p>
            {post.imageUrl && <img src={post.imageUrl} alt="Post visual" />}
          </div>

          {/* Actions */}
          <div className="post-actions">
            <button className="action-button">
              <FiThumbsUp /> Like
            </button>
            <button className="action-button">
              <FiMessageCircle /> Comment
            </button>
          </div>
          {/* Likes and Comments */}
          <div className="post-footer">
            <div className="likes">
              ❤️ {post.likes} {post.likes === 1 ? "Like" : "Likes"}
            </div>
            <button
              className="toggle-comments-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal opening on button click
                toggleComments();
              }}
            >
              {showComments
                ? "Hide Comments"
                : `View Comments (${post.comments.length})`}
            </button>
          </div>
          {/* Comments Section */}
          {showComments && (
            <div className="comments-section">
              {post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <strong>{comment.userId}:</strong> {comment.content}
                  </div>
                ))
              ) : (
                <p className="no-comments">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
          {<AddComment onAddComment={handleAddComment} />}
        </div>
      ))}
    </div>
  );
};

export default ListMyPosts;
