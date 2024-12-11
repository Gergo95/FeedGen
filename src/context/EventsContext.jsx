import React, { createContext, useContext, useCallback, useState } from "react";
import {
  createEvent as serviceCreateEvent,
  fetchEventsYouGoing as serviceFetchEventsYouGoing,
  fetchEventsByUser as serviceFetchEventsByUser,
  fetchEventById as serviceFetchEventById,
  fetchEvents as serviceFetchEvents,
  joinEvent as serviceJoinEvent,
  updateEventData as serviceUpdateEventData,
  uploadEventImage as serviceUploadEventImage,
  leaveEvent as serviceLeaveEvent,
} from "../service/EventService";

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCreateEvent = async (eventData) => {
    try {
      return await serviceCreateEvent(eventData);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const handleFetchEventsYouGoing = async (userId) => {
    try {
      return await serviceFetchEventsYouGoing(userId);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  const handleFetchEventsByUser = async (userId) => {
    try {
      return await serviceFetchEventsByUser(userId);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  const handleFetchEventByEventId = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await serviceFetchEventById(eventId);
      if (eventData) {
        setEvents(eventData);
      } else {
        setError("Event not found");
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Error fetching event");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchEvents = async () => {
    try {
      return await serviceFetchEvents();
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  const handleJoinEvent = async (userId, eventId, going) => {
    try {
      await serviceJoinEvent(userId, eventId, going);
    } catch (error) {
      console.log("Error adding user to Event!", error);
    }
  };

  const handleUpdateEventData = async (eventId, updatedData) => {
    try {
      await serviceUpdateEventData(eventId, updatedData);
    } catch (error) {
      console.error("Error updating event data:", error);
      throw error;
    }
  };

  const handleUploadEventImage = async (eventId, file) => {
    try {
      return await serviceUploadEventImage(eventId, file);
    } catch (error) {
      console.error("Error uploading event image:", error);
      throw error;
    }
  };

  const handleLeaveEvent = async (eventId, userId, going) => {
    try {
      await serviceLeaveEvent(eventId, userId, going);
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  const value = {
    events,
    createEvent: handleCreateEvent,
    fetchEventsByUser: handleFetchEventsByUser,
    fetchEvents: handleFetchEvents,
    fetchEventByEventId: handleFetchEventByEventId,
    leaveEvent: handleLeaveEvent,
    joinEvent: handleJoinEvent,
    updateEventData: handleUpdateEventData,
    uploadEventImage: handleUploadEventImage,
    fetchEventsYouGoing: handleFetchEventsYouGoing,
    loading,
    error,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};
