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

/*
 Send a friend request from one user to another.
 */
export const sendFriendRequest = async (fromUid, toUid) => {
  try {
    await addDoc(collection(db, "FriendRequests"), {
      from: fromUid,
      to: toUid,
      status: "pending",
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

/*
 Accept a friend request and add both users to the "Friends" collection.
 */
export const acceptFriendRequest = async (requestId, fromUid, toUid) => {
  try {
    const friendRequestsRef = doc(db, "FriendRequests", requestId);
    const friendsRef = collection(db, "Friends");

    //Add both users to the Friends collection
    await addDoc(friendsRef, { user1: fromUid, user2: toUid });

    //Delete the friend request after acceptance
    await deleteDoc(friendRequestsRef);
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

/*
 Decline a friend request by deleting it from "FriendRequests".
 */
export const declineFriendRequest = async (requestId) => {
  try {
    const friendRequestsRef = doc(db, "FriendRequests", requestId);
    await deleteDoc(friendRequestsRef);
  } catch (error) {
    console.error("Error declining friend request:", error);
    throw error;
  }
};

/*
 Remove a friend relationship between two users.
 */
export const removeFriend = async (uid1, uid2) => {
  try {
    const friendsRef = collection(db, "Friends");
    const q = query(
      friendsRef,
      where("user1", "in", [uid1, uid2]),
      where("user2", "in", [uid1, uid2])
    );

    const snapshot = await getDocs(q);
    const batchDeletions = [];
    snapshot.forEach((docSnap) => {
      batchDeletions.push(deleteDoc(docSnap.ref));
    });

    await Promise.all(batchDeletions);
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

/*
 Fetch friend requests for a given user by their UID.
 The UID of the user whose friend requests are being fetched
 it returns a {Promise<Array>}, which is an array of friend requests
 */
export const fetchFriendRequests = async (uid) => {
  try {
    const q = query(collection(db, "FriendRequests"), where("to", "==", uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
};
