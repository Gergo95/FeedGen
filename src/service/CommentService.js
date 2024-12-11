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

/*
 Fetch user data by UID.
 uid - The UID of the user.
 Promise<Object|null> The user data or null if not found.
 */
const fetchUserData = async (uid) => {
  const userRef = doc(db, "Users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

/*
 Fetch comments for a specific post, including user data.
 postId - The ID of the post whose comments to fetch.
 Promise<Array> Array of comments with user data attached.
 */
export const fetchCommentsByPostId = async (postId) => {
  const q = query(
    collection(db, "Comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  const fetchedComments = [];

  for (const commentDoc of querySnapshot.docs) {
    const commentData = commentDoc.data();
    const userData = commentData.userId
      ? await fetchUserData(commentData.userId)
      : {};
    fetchedComments.push({
      id: commentDoc.id,
      ...commentData,
      user: userData,
    });
  }

  return fetchedComments;
};

/*
 Create a new comment for a specific post.
 postId - The ID of the post.
 userId - The UID of the user making the comment.
 content - The comment text.
 Promise<Object> The newly created comment (with ID and timestamp).
 */
export const createCommentToPost = async (postId, userId, content) => {
  const newComment = {
    postId,
    userId,
    content,
    createdAt: serverTimestamp(),
  };
  const commentRef = await addDoc(collection(db, "Comments"), newComment);
  return { id: commentRef.id, ...newComment };
};

/*
 Update the content of an existing comment.
 commentId - The ID of the comment to update.
 updatedContent - The new comment content.
 Promise<{commentId: string, postId: string, updatedContent: string}>
 The commentId, the postId it belongs to, and the updatedContent.
 */
export const updateComment = async (commentId, updatedContent) => {
  const commentRef = doc(db, "Comments", commentId);
  const commentSnap = await getDoc(commentRef);
  if (!commentSnap.exists()) {
    throw new Error("Comment not found");
  }

  const commentData = commentSnap.data();
  const postId = commentData.postId;

  await updateDoc(commentRef, { content: updatedContent });

  return { commentId, postId, updatedContent };
};

/*
 Delete a comment.
 commentId - The ID of the comment to delete.
 Promise<{commentId: string, postId: string}> The commentId and postId of the deleted comment.
 */
export const deleteComment = async (commentId) => {
  const commentRef = doc(db, "Comments", commentId);
  const commentSnap = await getDoc(commentRef);
  if (!commentSnap.exists()) {
    throw new Error("Comment not found");
  }

  const commentData = commentSnap.data();
  const postId = commentData.postId;

  await deleteDoc(commentRef);

  return { commentId, postId };
};
