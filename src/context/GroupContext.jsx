import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createGroup,
  fetchGroups,
  fetchGroupsByUser,
  updateGroup,
  deleteGroup,
  fetchGroupById,
  joinGroup,
  leaveGroup,
  fetchGroupsYourMember,
  updateGroupData,
  uploadGroupImage,
} from "../service/GroupService";

const GroupContext = createContext();

export const useGroups = () => {
  return useContext(GroupContext);
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCreateGroup = async (newGroup, imageFile, uid) => {
    try {
      await createGroup(newGroup, imageFile, uid);
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Error creating group.");
    }
  };

  const handleFetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupList = await fetchGroups();
      setGroups(groupList);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Error fetching groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGroupsByUser = async (userId) => {
    try {
      return await fetchGroupsByUser(userId);
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  };

  const handleFetchGroupByGroupId = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const groupData = await fetchGroupById(groupId);
      // If you want to store just one group, you can do that by setting
      // `setGroups([groupData])` or storing it in a separate state variable.
      // Here, we'll replace `groups` state with a single object for simplicity:
      setGroups(groupData);
    } catch (err) {
      console.error("Error fetching group:", err);
      setError("Error fetching group");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinGroup = async (userId, groupId, members) => {
    try {
      await joinGroup(userId, groupId, members);
      console.log("User added to the group successfully!");
    } catch (error) {
      console.log("Error adding user to group!", error);
      setError("Error adding user to group.");
    }
  };

  const handleLeaveGroup = async (groupId, userId) => {
    try {
      await leaveGroup(groupId, userId);
      console.log("User successfully removed from the group.");
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Error leaving group.");
    }
  };

  const handleFetchGroupsYourMember = async (userId) => {
    try {
      return await fetchGroupsYourMember(userId);
    } catch (error) {
      console.error("Error fetching groups you're a member of:", error);
      throw error;
    }
  };

  const handleUpdateGroupData = async (groupId, updatedData) => {
    try {
      await updateGroupData(groupId, updatedData);
    } catch (error) {
      console.error("Error updating group data:", error);
      setError("Error updating group data.");
    }
  };

  const handleUploadGroupImage = async (groupId, file) => {
    try {
      return await uploadGroupImage(groupId, file);
    } catch (error) {
      console.error("Error uploading group image:", error);
      setError("Error uploading group image.");
    }
  };

  const handleUpdateGroup = async (groupId, updatedGroupData) => {
    try {
      await updateGroup(groupId, updatedGroupData);
    } catch (error) {
      console.error("Error updating group:", error);
      setError("Error updating group.");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Error deleting group.");
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        createGroup: handleCreateGroup,
        fetchGroups: handleFetchGroups,
        fetchGroupsByUser: handleFetchGroupsByUser,
        updateGroup: handleUpdateGroup,
        deleteGroup: handleDeleteGroup,
        fetchGroupByGroupId: handleFetchGroupByGroupId,
        joinGroup: handleJoinGroup,
        leaveGroup: handleLeaveGroup,
        fetchGroupsYourMember: handleFetchGroupsYourMember,
        updateGroupData: handleUpdateGroupData,
        uploadGroupImage: handleUploadGroupImage,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
