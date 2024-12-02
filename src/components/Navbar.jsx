import React from "react";
import "../styles/components/navbar.css";
import { FaBell, FaUserCircle, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchResult from "./Listing/SearchResult";
import NotificationList from "./Listing/NotificationList";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { searchDatabase } from "../firebase/firebaseFunctions";
import SearchBar from "./Navbar/SearchBar";
import { auth } from "../firebase/firebaseConfig";
import { useNotifications } from "../context/NotificationContext";

export default function Navbar() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { notifications, markAllAsRead } = useNotifications();
  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const [showDropdown, setShowDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleClick = () => {
    navigate("/feed");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Only mark as read when opening the dropdown
      markAllAsRead();
    }
  };
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length > 0) {
      const results = await searchDatabase(term);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result) => {
    alert(`You selected: ${result.name}`);
    setSearchQuery("");
    setResults([]);
  };

  //LOGOUT
  const { logout } = useAuth();
  const handlingLogout = () => {
    logout();
    navigate("/home");
  };

  //GOTO PROFILE PAGE
  const handleProfile = () => {
    navigate("/user/" + auth.currentUser.uid);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/feedgen-cd500.firebasestorage.app/o/logo.png?alt=media&token=b3d92bb6-0976-42ff-aaf1-31c459d560b1"
          alt="FeedGen Logo"
          onClick={handleClick}
        />
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Icons */}
      <div className="navbar-icons">
        <div className="notification-icon" onClick={handleBellClick}>
          <FaBell />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}
        </div>
        {showDropdown && (
          <div className="notification-dropdown">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    notif.read ? "read" : "unread"
                  }`}
                >
                  {/* Customize notification message based on type */}
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

        <button className="logout-button">
          <FaEnvelope className="icon" title="Messages" />
        </button>
        <button className="logout-button" onClick={handleProfile}>
          <FaUserCircle className="icon" title="Profile" />
        </button>
        <button className="logout-button" onClick={handlingLogout}>
          <FaSignOutAlt className="icon" title="Logout" />
        </button>
      </div>
    </nav>
  );
}
