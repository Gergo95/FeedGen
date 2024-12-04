import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Notify on Friend Request
export const notifyOnFriendRequest = onDocumentCreated(
  "FriendRequests/{requestId}",
  async (event) => {
    console.log("Trigger fired for FriendRequests");

    // Log the full event object
    console.log("Full event object:", JSON.stringify(event));

    // Access the document data
    const friendRequestSnapshot = event.data;
    console.log("FriendRequest data:", friendRequestSnapshot);
    if (!friendRequestSnapshot) {
      console.error("No data found in the snapshot.");
      return;
    }
    const friendRequest = friendRequestSnapshot.data();
    console.log("FriendRequest data:", friendRequest);

    const recipientId = friendRequest.receiver;
    const senderId = friendRequest.sender;
    console.log("Recipient ID:", recipientId);
    console.log("Sender ID:", senderId);

    if (!recipientId || !senderId) {
      console.error("receiver or sender is undefined.");
      return;
    }

    try {
      await db.collection("Notifications").add({
        recipientId,
        senderId,
        type: "friend_request",
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });
      logger.info(
        `Notification created for friend request from ${senderId} to ${recipientId}`
      );
    } catch (error) {
      logger.error("Error creating friend request notification:", error);
    }
  }
);

export const notifyOnComment = onDocumentCreated(
  "Comments/{commentId}",
  async (event) => {
    const commentSnapshot = event.data;
    const comment = commentSnapshot.data();
    const { postId, userId: senderId } = comment;

    try {
      const postSnapshot = await db.collection("Posts").doc(postId).get();
      if (!postSnapshot.exists) return;

      const post = postSnapshot.data();
      const recipientId = post.uid;

      if (senderId === recipientId) return;

      await db.collection("Notifications").add({
        recipientId,
        senderId,
        type: "comment",
        postId,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });
      logger.info(`Notification created for comment on post ${postId}`);
    } catch (error) {
      logger.error("Error creating comment notification:", error);
    }
  }
);

export const notifyOnLike = onDocumentUpdated(
  "Posts/{postId}",
  async (event) => {
    console.log("Trigger fired for Post Likes");

    console.log("Full event object:", JSON.stringify(event));

    // Access the before and after snapshots
    const beforeSnapshot = event.data.before;
    const afterSnapshot = event.data.after;

    if (!beforeSnapshot || !afterSnapshot) {
      console.error("Before or After snapshot is missing.");
      return;
    }

    console.log("Before snapshot data:", beforeSnapshot.data());
    console.log("After snapshot data:", afterSnapshot.data());

    const before = beforeSnapshot.data();
    const after = afterSnapshot.data();

    if (!before || !after) {
      console.error("Before or After data is undefined.");
      return;
    }

    const beforeLikes = before.likes || [];
    const afterLikes = after.likes || [];

    // Check if a new like was added
    if (afterLikes.length > beforeLikes.length) {
      const newLikeUserId = afterLikes.find((id) => !beforeLikes.includes(id));
      const postOwnerId = after.uid;

      if (!newLikeUserId || !postOwnerId) {
        console.error("New like user ID or post owner ID is undefined.");
        return;
      }

      if (newLikeUserId === postOwnerId) {
        console.log("New like is from the post owner. Skipping notification.");
        return;
      }

      try {
        // Create the notification
        await db.collection("Notifications").add({
          recipientId: postOwnerId,
          senderId: newLikeUserId,
          type: "like",
          postId: event.params.postId,
          timestamp: FieldValue.serverTimestamp(),
          read: false,
        });
        console.log(
          `Notification created for like on post ${event.params.postId}`
        );
      } catch (error) {
        console.error("Error creating like notification:", error);
      }
    } else {
      console.log("No new like detected.");
    }
  }
);

//Chat
export const notifyOnNewMessage = onDocumentCreated(
  "Messages/{messageId}",
  async (event) => {
    const newMessageSnapshot = event.data;
    console.log("Trigger fired Messages");

    console.log("Full event object:", JSON.stringify(event));
    if (!newMessageSnapshot) {
      console.error("No data found in the snapshot.");

      return;
    }
    const messageRequest = newMessageSnapshot.data();
    const recipientId = messageRequest.receiverId;
    const senderId = messageRequest.senderId;
    console.log("New message data:", newMessageSnapshot);

    if (!recipientId || !senderId) {
      console.error("recipientId or senderId is undefined.");
      return;
    }

    try {
      await db.collection("Notifications").add({
        recipientId,
        senderId,
        type: "new_message",
        timestamp: FieldValue.serverTimestamp(),
        read: false,
      });
    } catch (error) {
      logger.error("Error creating notification for new message: ", error);
    }
  }
);
