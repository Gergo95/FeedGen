import React, { useState, useEffect } from "react";
import "../../styles/components/ChatSidebar.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Avatar, List, ListItem, ListItemText, Badge } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const ChatSidebar = ({ currentUser, openChat }) => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async (currentUserId) => {
    const friendshipsRef = collection(db, "Friendships");

    // Queries to fetch friendships where current user is user1 or user2
    const q1 = query(friendshipsRef, where("user1", "==", currentUserId));
    const q2 = query(friendshipsRef, where("user2", "==", currentUserId));

    try {
      const querySnapshot1 = await getDocs(q1);
      const querySnapshot2 = await getDocs(q2);

      // Extract friend IDs from both queries
      const friendsFromUser1 = querySnapshot1.docs.map((doc) => ({
        ...doc.data(),
        friendId: doc.data().user2, // If current user is user1, friend is user2
      }));
      const friendsFromUser2 = querySnapshot2.docs.map((doc) => ({
        ...doc.data(),
        friendId: doc.data().user1, // If current user is user2, friend is user1
      }));

      const allFriends = [...friendsFromUser1, ...friendsFromUser2];
      console.log("Combined Friends Data:", allFriends);

      // Fetch full user details for each friend
      const userPromises = allFriends.map(async (friend) => {
        const userDoc = await getDoc(doc(db, "Users", friend.friendId));
        return { uid: friend.friendId, ...userDoc.data() };
      });

      const friendsData = await Promise.all(userPromises);
      console.log("Full Friends Data:", friendsData);
      return friendsData;
    } catch (error) {
      console.error("Error fetching friends:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const loadFriends = async () => {
      try {
        console.log("Fetching friends for user:", currentUser.uid);
        const friendsList = await fetchFriends(currentUser.uid);
        console.log("Fetched friends:", friendsList);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error loading friends:", error);
      }
    };

    loadFriends();
  }, [currentUser]);

  const handleFriendClick = (friend) => {
    console.log("Friend clicked:", friend); // Log the friend when it's clicked
    openChat(friend); // Trigger the handleOpenChat function in the parent component
  };

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.sidebarHeader}>Friends</h3>
      <List>
        {friends.map((friend) => (
          <ListItem
            key={friend.uid}
            button
            onClick={() => handleFriendClick(friend)}
            style={styles.listItem}
          >
            <Avatar
              src={friend.photoURL || "/default-avatar.png"}
              style={styles.avatar}
            />
            <ListItemText
              primary={friend.name || "Unknown User"}
              style={styles.listItemText}
            />
            <Badge
              color={friend.isActive ? "success" : "default"}
              variant="dot"
              style={styles.badge}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "300px",
    borderLeft: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#fafafa", // Lighter background for sidebar
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    fontSize: "18px",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  listItem: {
    padding: "10px 15px",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    cursor: "pointer",
  },
  listItemText: {
    fontWeight: "500",
    marginLeft: "10px",
  },
  badge: {
    marginLeft: "auto",
  },
  avatar: {
    width: "40px",
    height: "40px",
  },
};

export default ChatSidebar;
