import { db, storage } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Create a new group
export const createGroup = async (newGroup, imageFile, uid) => {
  const groupRef = doc(collection(db, "Groups"));

  let groupImageUrl = null;

  // If an image is attached, upload it to Firebase Storage
  if (imageFile) {
    const storageRef = ref(storage, `groups/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    groupImageUrl = await getDownloadURL(storageRef);
  }

  const groupData = {
    name: newGroup.name,
    description: newGroup.description,
    createdBy: uid,
    createdAt: serverTimestamp(),
    photoURL: groupImageUrl,
    memberId: [uid],
    members: 1,
  };

  await setDoc(groupRef, groupData);
};

// Update group data
export const updateGroupData = async (groupId, updatedData) => {
  const groupRef = doc(db, "Groups", groupId);
  await updateDoc(groupRef, updatedData);
};

// Upload group image and get download URL
export const uploadGroupImage = async (groupId, file) => {
  const storageRef = ref(storage, `groups/${groupId}/photo`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Fetch all groups
export const fetchGroups = async () => {
  const groupsSnapshot = await getDocs(collection(db, "Groups"));
  return groupsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Join a group
export const joinGroup = async (userId, groupId, members) => {
  if (!userId || !groupId) {
    throw new Error("Group ID or User ID is missing!");
  }

  const groupRef = doc(db, "Groups", groupId);
  await updateDoc(groupRef, {
    memberId: arrayUnion(userId),
    members: members + 1,
  });
};

// Leave a group
export const leaveGroup = async (groupId, userId) => {
  if (!groupId || !userId) {
    throw new Error("Group ID or User ID is missing.");
  }

  const groupRef = doc(db, "Groups", groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) {
    throw new Error("Group does not exist.");
  }

  const groupData = groupSnap.data();
  const updatedMemberId = groupData.memberId.filter((id) => id !== userId);

  await updateDoc(groupRef, {
    memberId: updatedMemberId,
    members: updatedMemberId.length,
  });
};

// Fetch groups where the user is a member
export const fetchGroupsYourMember = async (userId) => {
  const groupRef = collection(db, "Groups");
  const q = query(groupRef, where("memberId", "array-contains", userId));
  const querySnapshot = await getDocs(q);

  const groups = [];
  querySnapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() });
  });

  return groups;
};

// Fetch groups created by a specific user
export const fetchGroupsByUser = async (userId) => {
  const groupRef = collection(db, "Groups");
  const q = query(groupRef, where("createdBy", "==", userId));
  const querySnapshot = await getDocs(q);

  const groups = [];
  querySnapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() });
  });

  return groups;
};

// Fetch a single group by its ID
export const fetchGroupById = async (groupId) => {
  const groupRef = doc(db, "Groups", groupId);
  const groupDoc = await getDoc(groupRef);
  if (groupDoc.exists()) {
    return { id: groupDoc.id, ...groupDoc.data() };
  } else {
    throw new Error("Group not found");
  }
};

// Update a group
export const updateGroup = async (groupId, updatedGroup) => {
  const groupRef = doc(db, "Groups", groupId);
  await updateDoc(groupRef, updatedGroup);
};

// Delete a group
export const deleteGroup = async (groupId) => {
  const groupRef = doc(db, "Groups", groupId);
  await deleteDoc(groupRef);
};
