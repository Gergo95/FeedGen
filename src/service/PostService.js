import { db, storage } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  arrayUnion,
  arrayRemove,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Fetch user data by UID
export const fetchUserData = async (userId) => {
  try {
    const userRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.error("No such user exists!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Fetch posts from user and their friends
export const fetchFriendsPosts = async (currentUserUid) => {
  const friendshipsRef = collection(db, "Friendships");
  const postsRef = collection(db, "Posts");

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
      friendIdsSet.add(data.user2);
    });
    snapshot2.forEach((doc) => {
      const data = doc.data();
      friendIdsSet.add(data.user1);
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
  }
};

// Fetch posts for a specific user
export const fetchMyPosts = async (uid) => {
  if (!uid) return [];
  try {
    const postsRef = collection(db, "Posts");
    const q = query(postsRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    return [];
  }
};

// Create a new post
export const createPost = async (newPost, imageFile, currentUser) => {
  if (!currentUser) {
    console.error("User is not logged in");
    return;
  }

  try {
    let imageUrl = null;

    if (imageFile) {
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

    await addDoc(collection(db, "Posts"), {
      ...newPost,
      uid: currentUser.uid,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      likes: [],
      comments: [],
    });
    console.log("Post created successfully!");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
};

// Update a post
export const updatePost = async (postId, updatedPost) => {
  try {
    const postRef = doc(db, "Posts", postId);
    await updateDoc(postRef, updatedPost);
    console.log("Post updated successfully!");
  } catch (error) {
    console.error("Error updating post: ", error);
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "Posts", postId);
    await deleteDoc(postRef);
    console.log("Post deleted successfully!");
  } catch (error) {
    console.error("Error deleting post: ", error);
  }
};

// Toggle like on a post
export const toggleLikePost = async (
  postId,
  userId,
  isLiked,
  type = "Posts"
) => {
  try {
    const postRef = doc(db, type, postId);
    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
      });
    }
    console.log(`Post ${postId} ${isLiked ? "unliked" : "liked"} by ${userId}`);
  } catch (error) {
    console.error("Error updating likes:", error);
  }
};
