import React, { useState } from "react";
import "../../styles/components/AddComment.css";
import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../context/CommentContext";

const AddComment = ({ postId, onAddComment }) => {
  const [commentText, setCommentText] = useState("");
  const { currentUser } = useAuth();
  const { createCommentToPost } = useComments();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createCommentToPost(postId, currentUser.uid, commentText);
      setCommentText(""); // Clear the textarea
      if (onAddComment) onAddComment();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="add-comment">
      <form onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        ></textarea>
        <button type="submit" className="comment-submit">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default AddComment;
