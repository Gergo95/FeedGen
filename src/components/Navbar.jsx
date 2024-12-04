import React, { useState, useRef } from "react";
import "../styles/components/navbar.css";
import { FaBell, FaUserCircle, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";
import { useNotifications } from "../context/NotificationContext";
import ChatWindow from "../components/Chat/ChatWindow";
import SearchBar from "./Navbar/SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const [activeChatUser, setActiveChatUser] = useState(null); // Active chat user
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);

  const { logout } = useAuth();

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) markAllAsRead();
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);

    if (notif.type === "new_message" && notif.sender) {
      setActiveChatUser(notif.sender);
    } else if (notif.type === "friend_request" && notif.sender?.id) {
      navigate(`/user/${notif.sender.id}`);
    } else if (
      (notif.type === "like" || notif.type === "comment") &&
      notif.postId
    ) {
      navigate(`/posts/${notif.postId}`);
    } else {
      console.warn("Unhandled notification type or missing data:", notif);
    }
  };

  const handleProfile = () => {
    navigate(`/user/${auth.currentUser.uid}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate("/feed")}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/feedgen-cd500.firebasestorage.app/o/logo.png?alt=media&token=b3d92bb6-0976-42ff-aaf1-31c459d560b1"
          alt="FeedGen Logo"
        />
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Icons */}
      <div className="navbar-icons">
        {/* Notifications Icon */}
        <div className="notification-icon" onClick={handleBellClick}>
          <FaBell />
          {notifications.filter(
            (notif) => notif.type !== "new_message" && !notif.read
          ).length > 0 && (
            <span className="notification-count">
              {
                notifications.filter(
                  (notif) => notif.type !== "new_message" && !notif.read
                ).length
              }
            </span>
          )}
        </div>
        {showDropdown && (
          <div className="notification-dropdown">
            {notifications.filter((notif) => notif.type !== "new_message")
              .length > 0 ? (
              notifications
                .filter((notif) => notif.type !== "new_message")
                .map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${
                      notif.read ? "read" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    {notif.type === "friend_request" && (
                      <p>
                        <strong>{notif.sender?.name || "Someone"}</strong> sent
                        you a friend request.
                      </p>
                    )}
                    {notif.type === "comment" && (
                      <p>
                        <strong>{notif.sender?.name || "Someone"}</strong>{" "}
                        commented on your post.
                      </p>
                    )}
                    {notif.type === "like" && (
                      <p>
                        <strong>{notif.sender?.name || "Someone"}</strong> liked
                        your post.
                      </p>
                    )}
                    <p className="timestamp">
                      {notif.timestamp?.toDate().toLocaleString() ||
                        "Unknown time"}
                    </p>
                  </div>
                ))
            ) : (
              <p>No notifications</p>
            )}
          </div>
        )}

        {/* Messages Icon */}
        <div
          className="notification-icon"
          onClick={() => setShowMessageDropdown(!showMessageDropdown)}
        >
          <FaEnvelope className="icon" title="Messages" />
          {notifications.filter(
            (notif) => notif.type === "new_message" && !notif.read
          ).length > 0 && (
            <span className="notification-count">
              {
                notifications.filter(
                  (notif) => notif.type === "new_message" && !notif.read
                ).length
              }
            </span>
          )}
        </div>
        {showMessageDropdown && (
          <div className="notification-dropdown">
            {notifications.filter((notif) => notif.type === "new_message")
              .length > 0 ? (
              notifications
                .filter((notif) => notif.type === "new_message")
                .map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${
                      notif.read ? "read" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <p>
                      <strong>{notif.sender?.name || "Someone"}</strong> sent
                      you a message.
                    </p>
                    <p className="timestamp">
                      {notif.timestamp?.toDate().toLocaleString() ||
                        "Unknown time"}
                    </p>
                  </div>
                ))
            ) : (
              <p>No new messages</p>
            )}
          </div>
        )}

        {/* Chat Window */}
        {activeChatUser && (
          <ChatWindow
            friend={activeChatUser}
            currentUser={auth.currentUser}
            closeChat={() => setActiveChatUser(null)}
          />
        )}

        {/* Profile and Logout Icons */}
        <button className="logout-button" onClick={handleProfile}>
          <FaUserCircle className="icon" title="Profile" />
        </button>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="icon" title="Logout" />
        </button>
      </div>
    </nav>
  );
}
