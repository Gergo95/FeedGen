import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// Create a Context
const CommentContext = createContext();

// Custom Hook to Use Context
export const useComments = () => {
  return useContext(CommentContext);
};

// CommentProvider Component
export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);

  // Fetch all comments for a specific post
  const fetchCommentsByPostId = async (postId) => {
    try {
      const q = query(
        collection(db, "Comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedComments = await Promise.all(
        querySnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          const userRef = doc(db, "Users", commentData.userId); // Assuming user data is in a "Users" collection
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: commentDoc.id,
            ...commentData,
            user: userData, // Attach user details to the comment
          };
        })
      );
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

  // Add a new comment
  const createCommentToPost = async (postId, userId, content) => {
    try {
      const newComment = {
        postId,
        userId,
        content,
        createdAt: serverTimestamp(),
      };
      const commentRef = await addDoc(collection(db, "Comments"), newComment);
      //setComments((prev) => [...prev, { id: commentRef.id, ...newComment }]);
      // Ensure 'prev' is an array and append the new comment
      setComments((prev) =>
        Array.isArray(prev)
          ? [...prev, { id: commentRef.id, ...newComment }]
          : [{ id: commentRef.id, ...newComment }]
      );
      return commentRef;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  };

  // Update a comment
  const updateComment = async (commentId, updatedContent) => {
    try {
      const commentRef = doc(db, "Comments", commentId);
      await updateDoc(commentRef, { content: updatedContent });
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: updatedContent }
            : comment
        )
      );
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, "Comments", commentId);
      await deleteDoc(commentRef);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        fetchCommentsByPostId,
        createCommentToPost,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};
