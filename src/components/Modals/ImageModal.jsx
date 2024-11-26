import React, { useState } from "react";
import "../../styles/components/ImageModal.css";

const ImageModal = ({ image, onClose, onLike, comments, addComment }) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(newComment);
      setNewComment("");
    }
  };

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div
        className="image-modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent click events from propagating
      >
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="image-container">
          <img
            src={image.url}
            alt={image.alt || "Image"}
            className="modal-image"
          />
        </div>
        <div className="modal-info">
          <div className="modal-header">
            <h2>{image.title || "Image Title"}</h2>
            <button className="like-button" onClick={onLike}>
              ❤️ Like {image.likes || 0}
            </button>
          </div>
          <div className="comments-section">
            <h3>Comments</h3>
            {comments.length > 0 ? (
              <ul className="comments-list">
                {comments.map((comment, index) => (
                  <li key={index} className="comment">
                    {comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
            <div className="comment-input">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
