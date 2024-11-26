import React, { createContext, useContext, useState, useCallback } from "react";
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

const GroupContext = createContext();

export const useGroups = () => {
  return useContext(GroupContext);
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a new group
  const createGroup = async (newGroup, imageFile, uid) => {
    const groupRef = doc(collection(db, "Groups")); // Reference for a new group

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
      members: [uid].length,
    };

    await setDoc(groupRef, groupData);
  };

  // Fetch all groups
  const fetchGroups = async () => {
    const groupsSnapshot = await getDocs(collection(db, "Groups"));
    const groupList = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGroups(groupList);
  };

  //Join group
  const joinGroup = async (userId, groupId, members) => {
    if (!userId || !groupId) {
      console.lerror("Group ID or User ID is missing!");
      return;
    }

    try {
      const groupRef = doc(db, "Groups", groupId);
      console.log("----------" + groupId);
      await updateDoc(groupRef, {
        memberId: arrayUnion(userId),
        members: members + 1,
      });
      console.log("User added to the group successfully!");
    } catch (error) {
      console.log("Error adding user to group!", error);
    }
  };

  const leaveGroup = async (groupId, userId, member) => {
    if (!groupId || !userId) {
      console.log("Group ID or User ID is missing.");
    }

    try {
      const groupRef = doc(db, "Groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        console.log("Group does not exist.");
      }

      const groupData = groupSnap.data();

      // Remove user ID from the memberId array
      const updatedMemberId = groupData.memberId.filter((id) => id !== userId);

      // Update the group document
      await updateDoc(groupRef, {
        memberId: updatedMemberId,
        members: updatedMemberId.length,
      });

      console.log("User successfully removed from the group.");
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  //Fetch Groups by user
  const fetchGroupsByUser = async (userId) => {
    try {
      const groupRef = collection(db, "Groups");
      const q = query(groupRef, where("createdBy", "==", userId));
      const querySnapshot = await getDocs(q);
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });
      return groups;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  };

  //Fetch Them to display the concrete Group in GroupProfile.
  const fetchGroupByGroupId = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const groupRef = doc(db, "Groups", groupId); // Reference to the group document
      const groupDoc = await getDoc(groupRef); // Fetch the document
      if (groupDoc.exists()) {
        setGroups(groupDoc.data()); // If document exists, set group data
      } else {
        setError("Group not found");
      }
    } catch (err) {
      console.error("Error fetching group:", err);
      setError("Error fetching group");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a group
  const updateGroup = async (groupId, updatedGroup) => {
    const groupRef = doc(db, "Groups", groupId);
    await updateDoc(groupRef, updatedGroup);
  };

  // Delete a group
  const deleteGroup = async (groupId) => {
    const groupRef = doc(db, "Groups", groupId);
    await deleteDoc(groupRef);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        createGroup,
        fetchGroups,
        fetchGroupsByUser,
        updateGroup,
        deleteGroup,
        fetchGroupByGroupId,
        joinGroup,
        leaveGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
