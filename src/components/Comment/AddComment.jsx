import React, { useState } from "react";
import "../../styles/components/AddComment.css";

const AddComment = ({ onAddComment }) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText("");
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
