import React from "react";
import "../../styles/components/ChatSidebar.css";

const ChatSidebar = ({ contacts, onSelectChat }) => {
  return (
    <div className="chat-sidebar">
      <h3 className="chat-sidebar-title">Chats</h3>
      <ul className="chat-list">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="chat-list-item"
            onClick={() => onSelectChat(contact)}
          >
            <img
              src={contact.avatar}
              alt={contact.name}
              className="chat-avatar"
            />
            <div className="chat-info">
              <p className="chat-name">{contact.name}</p>
              <p className="chat-last-message">
                {contact.lastMessage ? contact.lastMessage : "Say hi!"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;
