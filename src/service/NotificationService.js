import { db } from "../firebase/firebaseConfig";
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

/**
 * Fetch a user's data by their UID.
 * @param {string} uid
 * @returns {Promise<Object|null>} User data or null if not found.
 */
export const fetchUserData = async (uid) => {
  try {
    const userRef = doc(db, "Users", uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

/**
 * Fetch notifications for a given user without enriching them with user data.
 * @param {string} userId
 * @returns {Promise<Array>} Array of notification docs data with IDs.
 */
export const fetchNotificationsForUser = async (userId) => {
  const notificationsRef = collection(db, "Notifications");
  const q = query(
    notificationsRef,
    where("recipientId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(q);

  const notifications = querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return notifications;
};

/**
 * Enrich notifications by fetching sender and recipient user data.
 * @param {Array} notifications Array of notifications without enriched data.
 * @returns {Promise<Array>} Enriched notifications with sender/recipient data.
 */
export const enrichNotificationsWithUserData = async (notifications) => {
  const enriched = await Promise.all(
    notifications.map(async (notification) => {
      const senderData = notification.senderId
        ? await fetchUserData(notification.senderId)
        : null;
      const recipientData = notification.recipientId
        ? await fetchUserData(notification.recipientId)
        : null;

      return {
        ...notification,
        sender: senderData,
        recipient: recipientData,
      };
    })
  );

  return enriched;
};

/**
 * Subscribe to notifications changes in real-time for a user.
 * This sets up an onSnapshot listener that will call `callback` with the enriched notifications.
 * second parameter is  a callback that receives the updated array of enriched notifications.
 * give back the Unsubscribe function
 */
export const subscribeToUserNotifications = (userId, callback) => {
  const notificationsRef = collection(db, "Notifications");
  const q = query(
    notificationsRef,
    where("recipientId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const rawNotifications = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const enriched = await enrichNotificationsWithUserData(rawNotifications);
      callback(enriched);
    },
    (error) => {
      console.error("Error with real-time notifications listener:", error);
    }
  );

  return unsubscribe;
};

export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "Notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
    console.log(`Notification ${notificationId} marked as read.`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

/*
 *  Array of notification IDs to mark as read.
 */
export const markAllAsRead = async (notificationIds) => {
  try {
    const batch = writeBatch(db);
    notificationIds.forEach((notifId) => {
      const notificationRef = doc(db, "Notifications", notifId);
      batch.update(notificationRef, { read: true });
    });
    await batch.commit();
    console.log("All notifications marked as read.");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};
