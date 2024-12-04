import React, { useEffect, useState } from "react";
import PostCreator from "../components/Post/PostCreator";
import PostList from "../components/Post/PostList";
import Navbar from "../components/Navbar";
import "../styles/components/Events.css";
import { useEvents } from "../context/EventsContext";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

function Events() {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { events, loading, error, fetchEventByEventId, joinEvent, leaveEvent } =
    useEvents();

  const [eventMembers, setEventMembers] = useState([]);

  useEffect(() => {
    if (eventId) {
      fetchEventByEventId(eventId);
    }
  }, [eventId, fetchEventByEventId]);

  useEffect(() => {
    // Fetch event members' details
    const fetchEventMembers = async () => {
      if (events?.goingId?.length > 0) {
        const membersData = await Promise.all(
          events.goingId.map(async (memberId) => {
            const userRef = doc(db, "Users", memberId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { id: memberId, ...userSnap.data() };
            }
            return null;
          })
        );
        setEventMembers(membersData.filter((member) => member !== null));
      }
    };

    fetchEventMembers();
  }, [events]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!events) return <div>Event not found</div>;

  const isGoing = (events?.goingId || []).includes(currentUser?.uid);

  const handleJoinButton = async () => {
    if (!eventId || !currentUser.uid) {
      console.error("Event ID or User ID is missing.");
      return;
    }

    try {
      await joinEvent(currentUser.uid, eventId, events.going);
      alert("You have successfully joined the event!");
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
      await fetchEventByEventId(eventId);
    } catch (error) {
      console.error("Failed to leave event:", error);
      alert("Error: Unable to leave the event.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Events", eventId));
      toast.success("event deleted successfully!", {
        position: "top-center",
      });
      navigate("/feed");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event.", {
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="event-container">
        {/* Event Header */}
        <div className="event-header">
          <div className="event-banner">
            <img
              src={events?.photoURL}
              alt="Event Picture"
              className="event-avatar"
            />
          </div>
          <div className="event-info">
            <h2>{events.name}</h2>
            <p>{events.going} Going</p>
            {events.creatorId === currentUser.uid ? (
              <>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-event-profile/${eventId}`)}
                >
                  Edit Event
                </button>
                <button
                  className="leave-btn"
                  onClick={() => handleDeleteEvent(eventId)}
                >
                  Delete Event
                </button>
              </>
            ) : isGoing ? (
              <button className="leave-btn" onClick={handleLeaveButton}>
                Leave Event
              </button>
            ) : (
              <button className="action-btn" onClick={handleJoinButton}>
                Join Event
              </button>
            )}
          </div>
        </div>

        {/* Event Content */}
        <div className="event-content">
          <aside className="event-sidebar">
            <div className="about-section">
              <h3>About</h3>
              <p>{events.description}</p>
              <p>{events.date}</p>
            </div>
            <div className="stats-section">
              <div className="stat-item">
                <strong>Going: {events.going}</strong>
              </div>
            </div>
            <div className="members-section">
              {eventMembers.length > 0 ? (
                eventMembers.map((member) => (
                  <div key={member.id} className="member">
                    <img
                      src={member.photoURL || "https://via.placeholder.com/50"}
                      alt={member.name || "Unknown"}
                      className="member-pic"
                    />
                    <p>{member.name || "Unknown User"}</p>
                  </div>
                ))
              ) : (
                <p>No members to display.</p>
              )}
            </div>
          </aside>

          <section className="event-main-section">
            {isGoing ? (
              <>
                <PostCreator contextType="Event" contextId={eventId} />
                <h3>Posts</h3>
                <PostList contextType="Event" contextId={eventId} />
              </>
            ) : (
              <h3>You have to join the Event to participate</h3>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Events;
