import React, { createContext, useContext } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const FriendRequestContext = createContext();

export const useFriendRequests = () => {
  return useContext(FriendRequestContext);
};

export const FriendRequestProvider = ({ children }) => {
  // Send a friend request
  const sendFriendRequest = async (fromUid, toUid) => {
    try {
      await addDoc(collection(db, "FriendRequests"), {
        from: fromUid,
        to: toUid,
        status: "pending",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (requestId, fromUid, toUid) => {
    try {
      const friendRequestsRef = doc(db, "FriendRequests", requestId);
      const friendsRef = collection(db, "Friends");

      // Add both users to Friends collection
      await addDoc(friendsRef, { user1: fromUid, user2: toUid });
      await deleteDoc(friendRequestsRef); // Delete the friend request
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Decline a friend request
  const declineFriendRequest = async (requestId) => {
    try {
      const friendRequestsRef = doc(db, "FriendRequests", requestId);
      await deleteDoc(friendRequestsRef); // Remove the friend request
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  // Remove a friend
  const removeFriend = async (uid1, uid2) => {
    try {
      const friendsRef = collection(db, "Friends");
      const q = query(
        friendsRef,
        where("user1", "in", [uid1, uid2]),
        where("user2", "in", [uid1, uid2])
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // Fetch friend requests for a user
  const fetchFriendRequests = async (uid) => {
    try {
      const q = query(collection(db, "FriendRequests"), where("to", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  return (
    <FriendRequestContext.Provider
      value={{
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        fetchFriendRequests,
      }}
    >
      {children}
    </FriendRequestContext.Provider>
  );
};
