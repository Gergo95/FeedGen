import { db, storage } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const getUserData = async (uid) => {
  const userDocRef = doc(db, "Users", uid);
  const docSnapshot = await getDoc(userDocRef);

  if (docSnapshot.exists()) {
    return docSnapshot.data();
  } else {
    throw new Error("User not found");
  }
};

export const updateUserData = async (uid, userData) => {
  const userDocRef = doc(db, "Users", uid);
  await setDoc(userDocRef, userData, { merge: true });
};

export const uploadProfileImage = async (uid, file) => {
  if (!uid) throw new Error("User ID is missing");
  if (!file) throw new Error("No file provided");

  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const fileName = `profile_${timestamp}.${fileExtension}`;

  const storageRef = ref(storage, `profile_images/${uid}/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Uploaded a blob or file!", snapshot);

    const downloadURL = await getDownloadURL(storageRef);
    console.log("File available at", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const fetchFriends = async (userId) => {
  try {
    const friendshipsRef = collection(db, "Friendships");
    const q1 = query(friendshipsRef, where("user1", "==", userId));
    const q2 = query(friendshipsRef, where("user2", "==", userId));

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const friendIds = new Set();
    snapshot1.forEach((doc) => friendIds.add(doc.data().user2));
    snapshot2.forEach((doc) => friendIds.add(doc.data().user1));

    const friendsData = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(db, "Users", friendId));
      if (friendDoc.exists()) {
        friendsData.push({ id: friendDoc.id, ...friendDoc.data() });
      }
    }
    return friendsData;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};
