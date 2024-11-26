import React, { useState, useEffect } from "react";
import { useFriendRequests } from "../../context/FriendRequestContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const FriendButton = ({ currentUserUid, profileUserUid }) => {
  const [friendStatus, setFriendStatus] = useState("");
  const { sendFriendRequest, removeFriend } = useFriendRequests();

  useEffect(() => {
    const checkFriendStatus = async () => {
      try {
        // Check if already friends
        const friendsRef = collection(db, "Friends");
        const q = query(
          friendsRef,
          where("user1", "in", [currentUserUid, profileUserUid]),
          where("user2", "in", [currentUserUid, profileUserUid])
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setFriendStatus("friends");
          return;
        }

        // Check if friend request sent
        const friendRequestsRef = collection(db, "FriendRequests");
        const q2 = query(
          friendRequestsRef,
          where("from", "==", currentUserUid),
          where("to", "==", profileUserUid)
        );
        const snapshot2 = await getDocs(q2);

        if (!snapshot2.empty) {
          setFriendStatus("requestSent");
          return;
        }

        setFriendStatus("notFriends");
      } catch (error) {
        console.error("Error checking friend status:", error);
      }
    };

    checkFriendStatus();
  }, [currentUserUid, profileUserUid]);

  const handleAddFriend = async () => {
    await sendFriendRequest(currentUserUid, profileUserUid);
    setFriendStatus("requestSent");
  };

  const handleRemoveFriend = async () => {
    await removeFriend(currentUserUid, profileUserUid);
    setFriendStatus("notFriends");
  };

  return (
    <div>
      {friendStatus === "friends" && (
        <button onClick={handleRemoveFriend}>Remove Friend</button>
      )}
      {friendStatus === "requestSent" && <button disabled>Request Sent</button>}
      {friendStatus === "notFriends" && (
        <button onClick={handleAddFriend}>Add Friend</button>
      )}
    </div>
  );
};

export default FriendButton;
