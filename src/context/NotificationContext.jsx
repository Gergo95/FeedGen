import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchNotificationsForUser,
  subscribeToUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../service/NotificationService";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const rawNotifications = await fetchNotificationsForUser(currentUser.uid);
      // The service's subscription already enriches them, but if you want to manually enrich here,
      // you would import enrichNotificationsWithUserData and call it.
      // const enriched = await enrichNotificationsWithUserData(rawNotifications);
      // setNotifications(enriched);
      // For consistency, let's just call fetchNotificationsForUser and enrich here if needed.

      // If you want to keep enrichment consistent:
      // Since subscribeToUserNotifications handles enrichment,
      // and fetchNotificationsForUser does not, you may want to enrich here.
      // But if you're always relying on the subscription for updates,
      // you might not need this fetch anymore, unless you're calling it elsewhere.
      //
      // For clarity and consistency, let's just leave these as raw and assume subscription handles real-time updates.
      setNotifications(rawNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Set up the real-time listener for notifications
    const unsubscribe = subscribeToUserNotifications(
      currentUser.uid,
      (enrichedNotifications) => {
        setNotifications(enrichedNotifications);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotificationIds = notifications
      .filter((notif) => !notif.read)
      .map((notif) => notif.id);

    if (unreadNotificationIds.length > 0) {
      await markAllAsRead(unreadNotificationIds);

      // Update local state to reflect the changes
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    }
  };

  const value = {
    notifications,
    loading,
    error,
    fetchNotifications: handleFetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
