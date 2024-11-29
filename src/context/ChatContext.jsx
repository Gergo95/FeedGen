import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [openChats, setOpenChats] = useState([]); // Active chat windows
  const [activeFriend, setActiveFriend] = useState(null); // Currently chatting friend

  const openChat = (friend) => {
    setActiveFriend(friend);
    if (!openChats.some((chat) => chat.uid === friend.uid)) {
      setOpenChats((prev) => [...prev, friend]);
    }
  };

  const closeChat = (uid) => {
    setOpenChats((prev) => prev.filter((chat) => chat.uid !== uid));
  };

  return (
    <ChatContext.Provider
      value={{ openChats, activeFriend, openChat, closeChat }}
    >
      {children}
    </ChatContext.Provider>
  );
};
