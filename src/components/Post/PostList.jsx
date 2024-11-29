import React from "react";
import "../../styles/components/post.css";
import { FiThumbsUp, FiMessageCircle } from "react-icons/fi";
import { useState, useEffect } from "react";
import AddComment from "../Comment/AddComment";
import { usePosts } from "../../context/PostContext";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDoc,
  doc,
  getDocs,
  orderBy,
  where,
  query,
} from "firebase/firestore";
import { useComments } from "../../context/CommentContext";
import ImageModal from "../Modals/ImageModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PostList = () => {
  const [showComments, setShowComments] = useState({});
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [comments, setComments] = useState({});
  const { fetchFriendsPosts, loading } = usePosts();
  const { fetchCommentsByPostId } = useComments();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFriendsPostsAndComments = async () => {
      if (!currentUser) return;

      try {
        // Fetch posts
        const posts = await fetchFriendsPosts(currentUser.uid);
        setFriendsPosts(posts);

        // Fetch comments for each post
        const commentsByPost = {};
        await Promise.all(
          posts.map(async (post) => {
            const postComments = await fetchCommentsByPostId(post.id);
            commentsByPost[post.id] = postComments;
          })
        );

        setComments(commentsByPost); // Set all comments in state
      } catch (error) {
        console.error("Error loading posts and comments:", error);
      }
    };

    loadFriendsPostsAndComments();
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentAdded = async (postId) => {
    try {
      const updatedComments = await fetchCommentsByPostId(postId);
      // Safely update the state, ensuring prev is always an object
      setComments((prev = {}) => ({
        ...prev, // Spread the previous state to maintain other post comments
        [postId]: updatedComments, // Update the comments for the specific postId
      }));
    } catch (error) {
      console.error("Error updating comments after adding:", error);
    }
  };

  return (
    <div className="post-list">
      {friendsPosts.length > 0 ? (
        friendsPosts.map((post) => (
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
              <button
                className="action-button"
                onClick={() => handleToggleComments(post.id)}
              >
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
                      </strong>{" "}
                      <div className="comment-content"> {comment.content}</div>
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
          <p>No posts to show from your friends.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;
