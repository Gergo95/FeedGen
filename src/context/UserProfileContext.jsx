import React, { createContext, useContext } from "react";
import {
  getUserData as serviceGetUserData,
  updateUserData as serviceUpdateUserData,
  uploadProfileImage as serviceUploadProfileImage,
  fetchFriends as serviceFetchFriends,
} from "../service/UserProfileService";

const UserProfContext = createContext();

export const useUserProf = () => useContext(UserProfContext);

const UserProfileProvider = ({ children }) => {
  const handleGetUserData = async (uid) => {
    return await serviceGetUserData(uid);
  };

  const handleUpdateUserData = async (uid, userData) => {
    await serviceUpdateUserData(uid, userData);
  };

  const handleUploadProfileImage = async (uid, file) => {
    return await serviceUploadProfileImage(uid, file);
  };

  const handleFetchFriends = async (userId) => {
    return await serviceFetchFriends(userId);
  };

  const value = {
    getUserData: handleGetUserData,
    updateUserData: handleUpdateUserData,
    uploadProfileImage: handleUploadProfileImage,
    fetchFriends: handleFetchFriends,
  };

  return (
    <UserProfContext.Provider value={value}>
      {children}
    </UserProfContext.Provider>
  );
};

export default UserProfileProvider;
