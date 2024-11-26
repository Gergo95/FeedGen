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
} from "firebase/firestore";
import { useAuth } from "./AuthContext"; // Import your authentication context
import { useParams } from "react-router-dom";

// Create the PostContext
const PostContext = createContext();

// Custom hook to use the PostContext
export const usePosts = () => useContext(PostContext);

// PostProvider Component
const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [friendsPosts, setFriendsPosts] = useState([]);

  const { uid } = useParams();

  const postsRef = collection(db, "Posts");
  const friendshipsRef = collection(db, "Friendships");
  const [userDetails, setUserDetails] = useState({});

  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Get the logged-in user's info

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

  // Fetch all posts along with user details
  const fetchPostsWithUserDetails = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(postsRef);
      const postsWithDetails = await Promise.all(
        querySnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const userDoc = await getDoc(doc(db, "Users", postData.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          console.log(userData);

          return {
            id: postDoc.id, // Auto-generated Document ID
            ...postData,
            user: userData, // Attach user details
          };
        })
      );
      setPosts(postsWithDetails);
      console.log(postsWithDetails);
    } catch (error) {
      console.error("Error fetching posts with user details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for posts with user details
  useEffect(() => {
    const unsubscribe = onSnapshot(postsRef, async (snapshot) => {
      try {
        const postsWithDetails = await Promise.all(
          snapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
              id: postDoc.id, // Auto-generated Document ID
              ...postData,
              user: userData, // Attach user details
            };
          })
        );
        setPosts(postsWithDetails);
      } catch (error) {
        console.error("Error in real-time listener for posts:", error);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

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

  // Function to fetch posts of the user's friends
  const fetchFriendsPosts = async (currentUserUid) => {
    setLoading(true);
    try {
      // Fetch the user's friendships
      console.log(currentUserUid);
      const querySnapshot = await getDocs(
        query(friendshipsRef, where("user1", "==", currentUserUid))
      );

      const friendIds = new Set();

      // Collect friend IDs from friendships
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        friendIds.add(data.user1 === currentUserUid ? data.user2 : data.user1);
      });
      // Log the friend IDs after the loop
      console.log("Friend IDs:", Array.from(friendIds));

      // If no friends, return an empty array
      if (friendIds.size === 0) {
        console.log("No friends found.");
        return [];
      }

      // Query posts of friends
      const friendPostsQuery = query(
        postsRef,
        where("uid", "in", Array.from(friendIds)) // Only fetch posts by friends
      );
      console.log("Friend Posts Query: ", friendPostsQuery);

      if (Array.from(friendIds).length > 0) {
        const friendPostsSnapshot = await getDocs(friendPostsQuery);
        console.log("Friend Posts Snapshot: ", friendPostsSnapshot);

        // Map posts and attach user details
        const friendPostsWithDetails = await Promise.all(
          friendPostsSnapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            const userDoc = await getDoc(doc(db, "Users", postData.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
              id: postDoc.id, // Auto-generated Document ID
              ...postData,
              user: userData, // Attach user details
            };
          })
        );
        console.log(
          "Frinedspostdetails : " + Array.from(friendPostsWithDetails)
        );
        console.log(
          "Friend Posts with Details in POstContext end: ",
          friendPostsWithDetails
        );

        return friendPostsWithDetails;
      }
    } catch (error) {
      console.error("Error fetching friends' posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for friends' posts
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(friendshipsRef, async (snapshot) => {
      const friendIds = new Set();

      // Collect friend IDs from updated friendships
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        friendIds.add(data.user1 === currentUser.uid ? data.user2 : data.user1);
      });

      // If no friends, return an empty array
      if (friendIds.length === 0) {
        console.log("No friends found.");
        return [];
      }

      // Query posts of friends
      const friendPostsQuery = query(
        postsRef,
        where("uid", "in", Array.from(friendIds))
      );

      const friendPostsSnapshot = await getDocs(friendPostsQuery);

      const friendPostsWithDetails = await Promise.all(
        friendPostsSnapshot.docs.map(async (postDoc) => {
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

      setPosts(friendPostsWithDetails);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [currentUser]);

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

  // Provide posts and CRUD functions to the app
  const value = {
    posts,
    myPosts,
    loading,
    createPost,
    updatePost,
    deletePost,
    fetchPostsWithUserDetails,
    fetchFriendsPosts,
    fetchMyPosts,
    fetchUserData,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export default PostProvider;
