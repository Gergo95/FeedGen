// PostContext.jsx

import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  arrayUnion,
  arrayRemove,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

// Create the PostContext
const PostContext = createContext();

// Custom hook to use the PostContext
export const usePosts = () => useContext(PostContext);

// PostProvider Component
const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Get the logged-in user's info

  const postsRef = collection(db, "Posts");
  const friendshipsRef = collection(db, "Friendships");

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(db, "Users", userId); // Reference to the specific user document
      const userDoc = await getDoc(userRef); // Fetch the document

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() }; // Return the document ID and data
      } else {
        console.error("No such user exists!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Function to fetch posts from the current user and their friends
  const fetchFriendsPosts = async (currentUserUid) => {
    setLoading(true);
    try {
      // Fetch friendships where currentUserUid is either user1 or user2
      const friendshipsQuery1 = query(
        friendshipsRef,
        where("user1", "==", currentUserUid)
      );
      const friendshipsQuery2 = query(
        friendshipsRef,
        where("user2", "==", currentUserUid)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendshipsQuery1),
        getDocs(friendshipsQuery2),
      ]);

      const friendIdsSet = new Set();

      // Collect friend UIDs
      snapshot1.forEach((doc) => {
        const data = doc.data();
        friendIdsSet.add(data.user2); // user1 is currentUserUid, so user2 is the friend
      });
      snapshot2.forEach((doc) => {
        const data = doc.data();
        friendIdsSet.add(data.user1); // user2 is currentUserUid, so user1 is the friend
      });

      // Include current user's UID
      friendIdsSet.add(currentUserUid);

      const friendIds = Array.from(friendIdsSet);

      if (friendIds.length === 0) {
        console.log("No friends found.");
        return [];
      }

      // Handle Firestore limitation of 10 items in 'in' queries
      const chunks = [];
      const chunkSize = 10;

      for (let i = 0; i < friendIds.length; i += chunkSize) {
        chunks.push(friendIds.slice(i, i + chunkSize));
      }

      let allPosts = [];

      for (const chunk of chunks) {
        const postsQuery = query(
          postsRef,
          where("uid", "in", chunk),
          orderBy("createdAt", "desc")
        );

        const postsSnapshot = await getDocs(postsQuery);

        // Map posts and attach user details
        const postsWithDetails = await Promise.all(
          postsSnapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
              id: postDoc.id,
              ...postData,
              user: userData,
            };
          })
        );

        allPosts = allPosts.concat(postsWithDetails);
      }

      // Sort all posts by createdAt in descending order
      allPosts.sort((a, b) => b.createdAt - a.createdAt);

      return allPosts;
    } catch (error) {
      console.error("Error fetching friends' posts:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the current user's posts
  const fetchMyPosts = async (uid) => {
    if (!uid) return; // Ensure user is logged in
    try {
      setLoading(true);
      const postsRef = collection(db, "Posts");
      const q = query(postsRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include the document ID
        ...doc.data(),
      }));
      setMyPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user's posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (newPost, imageFile, currentUser) => {
    if (!currentUser) {
      console.error("User is not logged in");
      return;
    }
    try {
      let imageUrl = null;

      if (imageFile) {
        // Create a reference to the storage location
        const storageRef = ref(
          storage,
          `postImages/${Date.now()}_${imageFile.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // Add the post data to Firestore
      await addDoc(collection(db, "Posts"), {
        ...newPost,
        uid: currentUser.uid, // Include the user's UID
        imageUrl: imageUrl || null, // Store the image URL if available
        createdAt: serverTimestamp(), // Add server timestamp
        likes: [], // Default empty array for likes
        comments: [], // Default empty array for comments
      });
      console.log("Post created successfully!");
    } catch (error) {
      console.error("Error creating post: ", error);
    }
  };

  // Update a post
  const updatePost = async (postId, updatedPost) => {
    try {
      const postRef = doc(db, "Posts", postId);
      await updateDoc(postRef, updatedPost);
      console.log("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post: ", error);
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      const postRef = doc(db, "Posts", postId);
      await deleteDoc(postRef);
      console.log("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  // Function to like/unlike a post
  const toggleLikePost = async (postId, userId, isLiked, type = "Posts") => {
    try {
      const postRef = doc(db, type, postId); // Change to "PagePosts" for page posts
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId), // Remove userId from likes array
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId), // Add userId to likes array
        });
      }
      console.log(
        `Post ${postId} ${isLiked ? "unliked" : "liked"} by ${userId}`
      );
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  // Provide posts and CRUD functions to the app
  const value = {
    posts,
    myPosts,
    loading,
    createPost,
    updatePost,
    deletePost,
    fetchFriendsPosts,
    fetchMyPosts,
    fetchUserData,
    toggleLikePost,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export default PostProvider;
