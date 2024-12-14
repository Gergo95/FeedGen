import React, { createContext, useContext, useState } from "react";
import {
  fetchCommentsByPostId as serviceFetchCommentsByPostId,
  createCommentToPost as serviceCreateCommentToPost,
  updateComment as serviceUpdateComment,
  deleteComment as serviceDeleteComment,
} from "../service/CommentService";

const CommentContext = createContext();

export const useComments = () => {
  return useContext(CommentContext);
};

export const CommentProvider = ({ children }) => {
  //comments will be a dictionary { [postId]: Array of comments }
  const [comments, setComments] = useState({});

  const handleFetchCommentsByPostId = async (postId) => {
    try {
      const fetchedComments = await serviceFetchCommentsByPostId(postId);
      setComments((prev) => ({
        ...prev,
        [postId]: fetchedComments,
      }));
      return fetchedComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  };

  const handleCreateCommentToPost = async (postId, userId, content) => {
    try {
      const newComment = await serviceCreateCommentToPost(
        postId,
        userId,
        content
      );
      //Adding the new comment to the array for that postId
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId] ? [...prev[postId], newComment] : [newComment],
      }));
      return newComment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  };

  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      const {
        commentId: cId,
        postId,
        updatedContent: newContent,
      } = await serviceUpdateComment(commentId, updatedContent);
      //Update the comment in the array for that postId
      setComments((prev) => {
        if (!prev[postId]) return prev;
        const updatedComments = prev[postId].map((comment) =>
          comment.id === cId ? { ...comment, content: newContent } : comment
        );
        return { ...prev, [postId]: updatedComments };
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { commentId: cId, postId } = await serviceDeleteComment(commentId);
      //Remove the comment from the array for that postId
      setComments((prev) => {
        if (!prev[postId]) return prev;
        const filteredComments = prev[postId].filter(
          (comment) => comment.id !== cId
        );
        return { ...prev, [postId]: filteredComments };
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        fetchCommentsByPostId: handleFetchCommentsByPostId,
        createCommentToPost: handleCreateCommentToPost,
        updateComment: handleUpdateComment,
        deleteComment: handleDeleteComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};
