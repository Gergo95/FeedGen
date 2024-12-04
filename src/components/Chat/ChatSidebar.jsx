import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Avatar, List, ListItemText, Badge, ListItem } from "@mui/material";

const ChatSidebar = ({ currentUser, openChat }) => {
  const [friends, setFriends] = useState([]);
  const dataFetchedRef = useRef(false); // Track fetch status

  const fetchFriends = useCallback(async (currentUserId) => {
    const friendshipsRef = collection(db, "Friendships");

    try {
      // Fetch friendships where the current user is user1 or user2
      const [querySnapshot1, querySnapshot2] = await Promise.all([
        getDocs(query(friendshipsRef, where("user1", "==", currentUserId))),
        getDocs(query(friendshipsRef, where("user2", "==", currentUserId))),
      ]);

      const friendsFromUser1 = querySnapshot1.docs.map((doc) => ({
        ...doc.data(),
        friendId: doc.data().user2,
      }));

      const friendsFromUser2 = querySnapshot2.docs.map((doc) => ({
        ...doc.data(),
        friendId: doc.data().user1,
      }));

      const allFriends = [...friendsFromUser1, ...friendsFromUser2];
      console.log("Combined Friends Data:", allFriends);

      // Fetch full user details
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
  }, []);

  useEffect(() => {
    if (!currentUser || dataFetchedRef.current) return;

    const loadFriends = async () => {
      try {
        console.log("Fetching friends for user:", currentUser.uid);
        const friendsList = await fetchFriends(currentUser.uid);
        setFriends(friendsList);
        console.log("Fetched friends:", friendsList);
        dataFetchedRef.current = true; // Mark data as fetched
      } catch (error) {
        console.error("Error loading friends:", error);
      }
    };

    loadFriends();
  }, [currentUser, fetchFriends]);

  const handleFriendClick = (friend) => {
    console.log("Friend clicked:", friend);
    openChat(friend);
  };

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.sidebarHeader}>Friends</h3>
      <List>
        {friends.map((friend) => (
          <ListItem
            key={friend.uid || Math.random()} // Unique key fallback
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
    backgroundColor: "#fafafa",
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
