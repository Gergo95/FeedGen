import React, { createContext, useContext, useCallback, useState } from "react";
import { auth, db, storage } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./AuthContext";

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createEvent = async (eventData) => {
    try {
      const eventRef = collection(db, "Events");
      const docRef = await addDoc(eventRef, eventData);
      console.log("Event created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  //Fetch events by current user
  const fetchEventsByUser = async (userId) => {
    try {
      const eventRef = collection(db, "Events");
      const q = query(eventRef, where("creatorId", "==", userId));
      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  //Fetch Them to display the concrete Event in EventProfile.
  const fetchEventByEventId = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const eventRef = doc(db, "Events", eventId); // Reference to the group document
      const eventDoc = await getDoc(eventRef); // Fetch the document
      if (eventDoc.exists()) {
        setEvents(eventDoc.data()); // If document exists, set group data
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

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, "Events");
      const snapshot = await getDocs(eventsCollection);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  //Join group
  const joinEvent = async (userId, eventId, going) => {
    if (!userId || !eventId) {
      console.lerror("Event ID or User ID is missing!");
      return;
    }

    try {
      const eventRef = doc(db, "Events", eventId);
      await updateDoc(eventRef, {
        goingId: arrayUnion(userId),
        going: going + 1,
      });
      console.log("User added to the Event successfully!");
    } catch (error) {
      console.log("Error adding user to Event!", error);
    }
  };

  const leaveEvent = async (eventId, userId, going) => {
    if (!eventId || !userId) {
      console.log("Event ID or User ID is missing.");
    }

    try {
      const eventRef = doc(db, "Events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        console.log("Event does not exist.");
      }

      const eventData = eventSnap.data();

      // Remove user ID from the memberId array
      const updatedGoingId = eventData.goingId.filter((id) => id !== userId);

      // Update the group document
      await updateDoc(eventRef, {
        goingId: updatedGoingId,
        going: updatedGoingId.length,
      });

      console.log("User successfully removed from the event.");
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        createEvent,
        fetchEventsByUser,
        fetchEvents,
        fetchEventByEventId,
        leaveEvent,
        joinEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
