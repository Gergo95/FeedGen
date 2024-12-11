import React, { createContext, useContext } from "react";
import {
  sendFriendRequest as serviceSendFriendRequest,
  acceptFriendRequest as serviceAcceptFriendRequest,
  declineFriendRequest as serviceDeclineFriendRequest,
  removeFriend as serviceRemoveFriend,
  fetchFriendRequests as serviceFetchFriendRequests,
} from "../service/FriendRequestService";

const FriendRequestContext = createContext();

export const useFriendRequests = () => {
  return useContext(FriendRequestContext);
};

export const FriendRequestProvider = ({ children }) => {
  const handleSendFriendRequest = async (fromUid, toUid) => {
    return await serviceSendFriendRequest(fromUid, toUid);
  };

  const handleAcceptFriendRequest = async (requestId, fromUid, toUid) => {
    return await serviceAcceptFriendRequest(requestId, fromUid, toUid);
  };

  const handleDeclineFriendRequest = async (requestId) => {
    return await serviceDeclineFriendRequest(requestId);
  };

  const handleRemoveFriend = async (uid1, uid2) => {
    return await serviceRemoveFriend(uid1, uid2);
  };

  const handleFetchFriendRequests = async (uid) => {
    return await serviceFetchFriendRequests(uid);
  };

  const value = {
    sendFriendRequest: handleSendFriendRequest,
    acceptFriendRequest: handleAcceptFriendRequest,
    declineFriendRequest: handleDeclineFriendRequest,
    removeFriend: handleRemoveFriend,
    fetchFriendRequests: handleFetchFriendRequests,
  };

  return (
    <FriendRequestContext.Provider value={value}>
      {children}
    </FriendRequestContext.Provider>
  );
};
