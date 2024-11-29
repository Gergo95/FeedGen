import React, { useState, useEffect } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { TextField, Button, Typography, Box } from "@mui/material";
import { useChat } from "../../context/ChatContext";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/components/ChatWindow.css";

const ChatWindow = ({ friend, currentUser, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages from Firestore
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Query Firestore for messages between currentUser and friend
        const messagesQuery = query(
          collection(db, "Messages"),
          where("senderId", "in", [currentUser.uid, friend.uid]),
          where("receiverId", "in", [currentUser.uid, friend.uid]),
          orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(messagesQuery);
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched messages:", fetchedMessages); // Debugging log to check if messages are fetched correctly
        setMessages(fetchedMessages); // Update state with fetched messages
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages(); // Fetch messages when component mounts or when friend/currentUser changes
  }, [friend, currentUser]); // Re-fetch messages if friend or currentUser changes
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "Messages"), {
      senderId: currentUser.uid,
      receiverId: friend.uid,
      content: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <Box style={styles.chatWindow}>
      <div style={styles.chatHeader}>
        <Typography variant="h6">{friend.name}</Typography>
        <Button
          onClick={closeChat}
          variant="outlined"
          style={styles.closeButton}
        >
          X
        </Button>
      </div>

      {/* Message Display Section */}
      <Box style={styles.messageContainer}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <Typography
              key={index}
              align={msg.senderId === currentUser.uid ? "right" : "left"}
              style={
                msg.senderId === currentUser.uid
                  ? styles.sentMessage
                  : styles.receivedMessage
              }
            >
              {msg.content}
            </Typography>
          ))
        ) : (
          <Typography>No messages yet</Typography>
        )}
      </Box>

      {/* Message Input Section */}
      <div style={styles.inputContainer}>
        <TextField
          variant="outlined"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button
          onClick={sendMessage}
          variant="contained"
          style={styles.sendButton}
        >
          Send
        </Button>
      </div>
    </Box>
  );
};

const styles = {
  chatWindow: {
    position: "absolute",
    top: "50px",
    right: "30px",
    backgroundColor: "#fff",
    width: "350px",
    height: "500px",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    zIndex: 1000,
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  closeButton: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "14px",
  },
  messageContainer: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "10px",
  },
  sentMessage: {
    backgroundColor: "#dcf8c6",
    borderRadius: "15px",
    padding: "8px 12px",
    marginBottom: "10px",
    maxWidth: "70%",
    marginLeft: "auto",
  },
  receivedMessage: {
    backgroundColor: "#f1f0f0",
    borderRadius: "15px",
    padding: "8px 12px",
    marginBottom: "10px",
    maxWidth: "70%",
    marginRight: "auto",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    width: "85%",
    marginRight: "10px",
  },
  sendButton: {
    padding: "6px 20px",
    fontSize: "14px",
    borderRadius: "20px",
  },
};

export default ChatWindow;
