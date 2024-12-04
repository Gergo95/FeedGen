import React from "react";
import useComments from "./useComments";

const CommentsList = ({ postId }) => {
  const comments = useComments(postId);

  return (
    <div className="comments-section">
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.content}</p>
              <small>By {comment.userId}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentsList;
