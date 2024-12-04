import { db, storage } from "../firebase/firebaseConfig";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
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
  setDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";

const UserProfContext = createContext();

export const useUserProf = () => useContext(UserProfContext);

const UserProfileProvider = ({ children }) => {
  // Fetch user data by UID from Firestore
  const getUserData = async (uid) => {
    const userDocRef = doc(db, "Users", uid);
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      throw new Error("User not found");
    }
  };

  // Update user data in Firestore
  const updateUserData = async (uid, userData) => {
    const userDocRef = doc(db, "Users", uid);
    await setDoc(userDocRef, userData, { merge: true });
  };

  // Upload profile image to Firebase Storage
  const uploadProfileImage = async (uid, file) => {
    if (!uid) throw new Error("User ID is missing");
    if (!file) throw new Error("No file provided");

    // Generate a unique file name to prevent overwriting
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile_${timestamp}.${fileExtension}`;

    // Create a storage reference including the file name
    const storageRef = ref(storage, `profile_images/${uid}/${fileName}`);

    try {
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Uploaded a blob or file!", snapshot);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File available at", downloadURL);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const fetchFriends = async (userId) => {
    try {
      // Query friendships where the user is either user1 or user2
      const friendshipsRef = collection(db, "Friendships");
      const q1 = query(friendshipsRef, where("user1", "==", userId));
      const q2 = query(friendshipsRef, where("user2", "==", userId));

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      const friendIds = new Set();
      snapshot1.forEach((doc) => friendIds.add(doc.data().user2));
      snapshot2.forEach((doc) => friendIds.add(doc.data().user1));

      // Fetch friend details from the "Users" collection
      const friendsData = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, "Users", friendId));
        if (friendDoc.exists()) {
          friendsData.push({ id: friendDoc.id, ...friendDoc.data() });
        }
      }
      return friendsData;
    } catch (error) {
      console.error("Error fetching friends:", error);
      return [];
    }
  };

  const value = {
    getUserData,
    updateUserData,
    uploadProfileImage,
    fetchFriends,
  };

  return (
    <UserProfContext.Provider value={value}>
      {children}
    </UserProfContext.Provider>
  );
};

export default UserProfileProvider;
