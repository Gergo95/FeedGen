import React, { useState } from "react";
import "../../styles/components/GroupsPages.css";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ListEvents from "../Events/ListEvents";
import ListGroups from "../Groups/ListGroups";
import ListPages from "../Pages/ListPages";
import MyBigCalendar from "../Calendar/MyBigCalendar";

const GroupsPages = ({ user, groups, pages, events }) => {
  const [activeTab, setActiveTab] = useState("groups");

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/user/${currentUser.uid}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "groups":
        return groups.length > 0 ? (
          <ul className="content-list">
            <ListGroups />
          </ul>
        ) : (
          <p className="empty-message">No groups to display.</p>
        );
      case "pages":
        return pages.length > 0 ? (
          <ul className="content-list">
            <ListPages />
          </ul>
        ) : (
          <p className="empty-message">No pages to display.</p>
        );
      case "events":
        return events.length > 0 ? (
          <ul className="content-list">
            <ListEvents />
            <MyBigCalendar />
          </ul>
        ) : (
          <p className="empty-message">No events to display.</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="groups-pages">
      {/* User Info */}
      <div className="user-info">
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName}
          className="user-avatar"
        />
        <p className="user-name" onClick={handleUserClick}>
          {currentUser.name}
        </p>
      </div>
      <button
        className="create-new-button"
        onClick={() => navigate("/create-new")}
      >
        Create New
      </button>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "groups" ? "active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </button>
        <button
          className={`tab-button ${activeTab === "pages" ? "active" : ""}`}
          onClick={() => setActiveTab("pages")}
        >
          Pages
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
      </div>
      <div></div>
      {/* Content */}
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default GroupsPages;
