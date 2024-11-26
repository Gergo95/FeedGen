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

export default function Navbar() {
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleClick = () => {
    navigate("/feed");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }

    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleNotifications = [
    { title: "John liked your post", time: "5 mins ago", isRead: false },
    {
      title: "New friend request from Jane",
      time: "1 hour ago",
      isRead: false,
    },
    { title: "Event reminder: React Meetup", time: "Yesterday", isRead: true },
  ];

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
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
        <img src="img/logo.png" alt="FeedGen Logo" onClick={handleClick} />
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Icons */}
      <div className="navbar-icons">
        <div className="notification-wrapper" ref={notificationRef}>
          <button className="notification-button" onClick={toggleNotifications}>
            <FaBell className="icon" title="Notifications" />
            {sampleNotifications.length > 0 && (
              <span className="badge">{sampleNotifications.length}</span>
            )}
          </button>
          {showNotifications && (
            <NotificationList notifications={sampleNotifications} />
          )}
        </div>

        <FaEnvelope className="icon" title="Messages" />
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
