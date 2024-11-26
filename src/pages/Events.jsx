import React from "react";
import PostCreator from "../components/Post/PostCreator";
import PostList from "../components/Post/PostList";
import Navbar from "../components/Navbar";
import "../styles/components/Events.css";
import { useEvents } from "../context/EventsContext";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const posts = [
  {
    userName: "Alice Johnson",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "Just now",
    content: "Exploring the beauty of nature 🌿",
    image: "https://via.placeholder.com/600x400",
  },
  {
    userName: "Bob Smith",
    userAvatar: "https://via.placeholder.com/50",
    timestamp: "1 hour ago",
    content: "Had a fantastic day at the park!",
  },
];

function Events() {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const { events, loading, error, fetchEventByEventId, joinEvent, leaveEvent } =
    useEvents();

  useEffect(() => {
    if (eventId) {
      fetchEventByEventId(eventId); // Fetch group when component mounts or groupId changes
    }
  }, [eventId, fetchEventByEventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!events) return <div>Event not found</div>;

  let eventCreator = false;

  if (events.creatorId === currentUser.uid) {
    eventCreator = true;
  }

  const isGoing = (events?.goingId || []).includes(currentUser?.uid);

  const handleJoinButton = async () => {
    if (!eventId || !currentUser.uid) {
      console.error("Event ID or User ID is missing.");
      return;
    }

    try {
      await joinEvent(currentUser.uid, eventId, events.going);
      alert("You have successfully joined the event!");
      // Re-fetch group data and membership status
      //I do this so that after someone joins, the page refreshes itself
      await fetchEventByEventId(eventId);
    } catch (error) {
      console.error("Failed to join event:", error);
      alert("Error: Unable to join the event.");
    }
  };

  const handleLeaveButton = async () => {
    if (!eventId || !currentUser?.uid) {
      console.error("Event ID or User ID is missing.");
      return;
    }

    try {
      await leaveEvent(eventId, currentUser.uid, events.going);
      alert("You have successfully left the event!");
      events.going = events.going - 1;

      // Re-fetch group data or update local state
      await fetchEventByEventId(eventId);
    } catch (error) {
      console.error("Failed to leave event:", error);
      alert("Error: Unable to leave the event.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="group-container">
        {/* Group Header */}
        <div className="group-header">
          <div className="group-banner"></div>
          <div className="group-info">
            <img
              src={events?.photoURL}
              alt="Event Picture"
              className="event-avatar"
            />
            <h2>{events.name}</h2>
            <p>Event · {events.going} coming</p>
            {isGoing ? (
              <button className="leave-btn" onClick={handleLeaveButton}>
                Leave
              </button>
            ) : (
              <button className="action-btn" onClick={handleJoinButton}>
                Going
              </button>
            )}
          </div>
        </div>

        {/* Group Content */}

        {eventCreator ? (
          <button className="edit-btn">Edit Event</button>
        ) : isGoing ? (
          <div className="group-content">
            <div>
              {/* Sidebar */}
              <aside className="group-sidebar">
                <div className="about-section">
                  <h3>About</h3>
                  <p>{events.description}</p>
                </div>
                <div className="stats-section">
                  <div className="stat-item">
                    <strong>{events.going}</strong>
                    <span>Going</span>
                  </div>
                  <div className="stat-item">
                    <strong>45</strong>
                    <span>Posts Today</span>
                  </div>
                </div>
                <div className="members-section">
                  <h3>Going</h3>
                  <div className="member">
                    <img
                      src="https://via.placeholder.com/50"
                      alt="Member 1"
                      className="member-pic"
                    />
                    <p>Jane Smith</p>
                  </div>
                  <div className="member">
                    <img
                      src="https://via.placeholder.com/50"
                      alt="Member 2"
                      className="member-pic"
                    />
                    <p>John Doe</p>
                  </div>
                  <a href="#" className="view-more">
                    View All Members
                  </a>
                </div>
              </aside>
              {/* Main Section */}
              <section className="group-main-section">
                <PostCreator />
                <h3>Posts</h3>
                <PostList posts={posts} />
              </section>
            </div>
          </div>
        ) : (
          <div>
            {/* Sidebar */}
            <aside className="group-sidebar">
              <div className="about-section">
                <h3>About</h3>
                <p>{events.description}</p>
              </div>
              <div className="stats-section">
                <div className="stat-item">
                  <strong>{events.going}</strong>
                  <span>Going</span>
                </div>
                <div className="stat-item">
                  <strong>45</strong>
                  <span>Posts Today</span>
                </div>
              </div>
              <div className="members-section">
                <h3>Going</h3>
                <div className="member">
                  <img
                    src="https://via.placeholder.com/50"
                    alt="Member 1"
                    className="member-pic"
                  />
                  <p>Jane Smith</p>
                </div>
                <div className="member">
                  <img
                    src="https://via.placeholder.com/50"
                    alt="Member 2"
                    className="member-pic"
                  />
                  <p>John Doe</p>
                </div>
                <a href="#" className="view-more">
                  View All Members
                </a>
              </div>
            </aside>
            {/* Main Section */}
            <h3>You have to join the Event to participate</h3>
          </div>
        )}
      </div>
    </>
  );
}

export default Events;
