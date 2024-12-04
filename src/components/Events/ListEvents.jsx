import React, { useState } from "react";
import { useEvents } from "../../context/EventsContext";
import { useAuth } from "../../context/AuthContext";
import { usePosts } from "../../context/PostContext";
import { useEffect } from "react";
import "../../styles/components/ListEvents.css";
import { Link } from "react-router-dom"; // Import Link for navigation

const ListEvents = () => {
  const { currentUser } = useAuth();
  const { fetchEvents, updateEvent, fetchEventsYouGoing } = useEvents();
  const { createPost, fetchPosts } = usePosts();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [eventPosts, setEventPosts] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEventsYouGoing(currentUser.uid);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    loadEvents();
  }, [fetchEventsYouGoing]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost || !selectedEvent) return;

    try {
      await createPost({
        content: newPost,
        eventId: selectedEvent.id,
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
      });
      setNewPost("");
      loadEventPosts(selectedEvent.id); // Reload posts for the selected event
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const loadEventPosts = async (eventId) => {
    try {
      const posts = await fetchPosts({ eventId });
      setEventPosts(posts);
    } catch (error) {
      console.error("Error fetching event posts:", error);
    }
  };

  return (
    <>
      <div className="events-list">
        {events.map((event) => (
          <div>
            <Link to={`/events/${event.id}`}>
              <div
                className={`event-card ${
                  selectedEvent?.id === event.id ? "active" : ""
                }`}
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  loadEventPosts(event.id);
                }}
              >
                <img
                  src={event?.photoURL}
                  alt={event.name}
                  className="event-image"
                />
                <h2>{event.name}</h2>
                <p>{event.description}</p>
                <p> {event.date}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListEvents;
