import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig"; // Adjust path if needed
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

// Create the NotificationContext
const NotificationContext = createContext();

// Custom hook to use the NotificationContext
export const useNotifications = () => useContext(NotificationContext);

// NotificationProvider Component
export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch a user's data by their UID
  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "Users", uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Fetch all notifications for the current user
  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const notificationsRef = collection(db, "Notifications");
      const q = query(
        notificationsRef,
        where("recipientId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);

      const fetchedNotifications = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const notificationData = doc.data();

          // Fetch sender and recipient user data
          const senderData = await fetchUserData(notificationData.senderId);
          const recipientData = await fetchUserData(
            notificationData.recipientId
          );

          return {
            id: doc.id,
            ...notificationData,
            sender: senderData,
            recipient: recipientData,
          };
        })
      );

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for notifications
  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, "Notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const fetchedNotifications = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const notificationData = doc.data();

            // Fetch sender and recipient user data
            const senderData = await fetchUserData(notificationData.senderId);
            const recipientData = await fetchUserData(
              notificationData.recipientId
            );

            return {
              id: doc.id,
              ...notificationData,
              sender: senderData,
              recipient: recipientData,
            };
          })
        );
        setNotifications(fetchedNotifications);
      },
      (error) => {
        console.error("Error with real-time notifications listener:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "Notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log(`Notification ${notificationId} marked as read.`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notif) => !notif.read);

    try {
      const batch = writeBatch(db); // Use writeBatch from Firestore
      unreadNotifications.forEach((notif) => {
        const notificationRef = doc(db, "Notifications", notif.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit(); // Commit the batch operation
      console.log("All notifications marked as read.");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
