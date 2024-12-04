import React, { useState, useEffect } from "react";
import "../../styles/components/NotificationList.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFriendRequests } from "../../context/FriendRequestContext";

const NotificationList = ({ notifications }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { fetchFriendRequests, acceptFriendRequest, declineFriendRequest } =
    useFriendRequests();
  const { currentUser } = useAuth();
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const requests = await fetchFriendRequests(currentUser.uid);
      setFriendRequests(requests);
    };
    fetchRequests();
  }, [currentUser.uid, fetchFriendRequests]);

  const handleAccept = async (requestId, fromUid) => {
    await acceptFriendRequest(requestId, fromUid, currentUser.uid);
    setFriendRequests((prev) =>
      prev.filter((request) => request.id !== requestId)
    );
  };

  const handleDecline = async (requestId) => {
    await declineFriendRequest(requestId);
    setFriendRequests((prev) =>
      prev.filter((request) => request.id !== requestId)
    );
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleNotificationClick = (notification) => {
    alert(`You clicked on: ${notification.title}`);
  };

  const handleViewAllClick = () => {
    navigate("/notifications");
  };

  return (
    <div className="notification-container">
      <button className="notification-icon" onClick={toggleVisibility}>
        🔔
        {notifications.length > 0 && (
          <span className="badge">{notifications.length}</span>
        )}
      </button>
      {isVisible && (
        <div className="notification-list">
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`notification-item ${
                    notification.isRead ? "read" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="notification-title">{notification.title}</p>
                  <p className="notification-time">{notification.time}</p>
                </li>
              ))}
              {friendRequests.map((request) => (
                <div key={request.id}>
                  <p>{request.from}</p>
                  <button
                    onClick={() => handleAccept(request.id, request.from)}
                  >
                    Accept
                  </button>
                  <button onClick={() => handleDecline(request.id)}>
                    Decline
                  </button>
                </div>
              ))}
            </ul>
          ) : (
            <p className="no-notifications">No new notifications</p>
          )}
          <button className="view-all-button" onClick={handleViewAllClick}>
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
