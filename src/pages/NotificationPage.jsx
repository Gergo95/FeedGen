import React from "react";
import "../styles/components/NotificationsPage.css";
import Navbar from "../components/Navbar";

const NotificationsPage = () => {
  const allNotifications = [
    { title: "John liked your post", time: "5 mins ago", isRead: false },
    {
      title: "Jane sent you a friend request",
      time: "30 mins ago",
      isRead: false,
    },
    {
      title: "Your group event starts tomorrow",
      time: "1 day ago",
      isRead: true,
    },
    { title: "Anna commented on your post", time: "2 days ago", isRead: true },
  ];

  return (
    <>
      <Navbar />
      <div className="notifications-page">
        <h1>All Notifications</h1>
        <ul className="notifications-list">
          {allNotifications.map((notification, index) => (
            <li
              key={index}
              className={`notification-item ${
                notification.isRead ? "read" : ""
              }`}
            >
              <p className="notification-title">{notification.title}</p>
              <p className="notification-time">{notification.time}</p>
            </li>
          ))}
        </ul>
        <button className="clearButton">Delete All</button>
      </div>
    </>
  );
};

export default NotificationsPage;
