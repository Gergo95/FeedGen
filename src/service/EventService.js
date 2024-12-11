import { db, storage } from "../firebase/firebaseConfig";
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

/*
 Create a new event 
 eventData - the data of the event to be created.
 returns {Promise<string>} The newly created event ID.
 */
export const createEvent = async (eventData) => {
  const eventRef = collection(db, "Events");
  const docRef = await addDoc(eventRef, eventData);
  console.log("Event created with ID:", docRef.id);
  return docRef.id;
};

/*
 Fetch events that a user is going to.
 returns a {Promise<Array>}, which is a List of events the user is going to.
 */
export const fetchEventsYouGoing = async (userId) => {
  const eventRef = collection(db, "Events");
  const q = query(eventRef, where("goingId", "array-contains", userId));
  const querySnapshot = await getDocs(q);

  const events = [];
  querySnapshot.forEach((docSnap) => {
    events.push({ id: docSnap.id, ...docSnap.data() });
  });

  return events;
};

/*
 Fetch events created by a specific user.
 userId - The creator's user ID.
 returns a {Promise<Array>} :  list of events created by the user.
 */
export const fetchEventsByUser = async (userId) => {
  const eventRef = collection(db, "Events");
  const q = query(eventRef, where("creatorId", "==", userId));
  const querySnapshot = await getDocs(q);

  const events = [];
  querySnapshot.forEach((docSnap) => {
    events.push({ id: docSnap.id, ...docSnap.data() });
  });
  return events;
};

/*
 Fetch a specific event by its ID.
 eventId - The ID of the event to fetch.
 Promise<Object|null> The event data or null if not found.
 */
export const fetchEventById = async (eventId) => {
  const eventRef = doc(db, "Events", eventId);
  const eventDoc = await getDoc(eventRef);
  return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
};

/*
 Fetch all events.
 {Promise<Array>} A list of all events.
 */
export const fetchEvents = async () => {
  const eventsCollection = collection(db, "Events");
  const snapshot = await getDocs(eventsCollection);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/*
 Add a user to the event's going list.
 userId - The user's ID.
 eventId - The event's ID.
 going - Current number of people going.
 */
export const joinEvent = async (userId, eventId, going) => {
  if (!userId || !eventId) {
    console.error("Event ID or User ID is missing!");
    return;
  }

  const eventRef = doc(db, "Events", eventId);
  await updateDoc(eventRef, {
    goingId: arrayUnion(userId),
    going: going + 1,
  });
  console.log("User added to the Event successfully!");
};

/*
 Update event data.
 eventId - The event's ID.
 {Object} updatedData - The updated event data.
 */
export const updateEventData = async (eventId, updatedData) => {
  const eventRef = doc(db, "Events", eventId);
  await updateDoc(eventRef, updatedData);
};

/*
 Upload an image for an event.
 eventId - The event's ID.
 File file - The file to upload.
 {Promise<string>} The download URL of the uploaded image.
 */
export const uploadEventImage = async (eventId, file) => {
  const storageRef = ref(storage, `events/${eventId}/photo`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/*
 Remove a user from the event's going list.
 eventId - The event's ID.
 userId - The user's ID.
 */
export const leaveEvent = async (eventId, userId) => {
  if (!eventId || !userId) {
    console.log("Event ID or User ID is missing.");
    return;
  }

  const eventRef = doc(db, "Events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    console.log("Event does not exist.");
    return;
  }

  const eventData = eventSnap.data();
  const updatedGoingId = eventData.goingId.filter((id) => id !== userId);

  await updateDoc(eventRef, {
    goingId: updatedGoingId,
    going: updatedGoingId.length,
  });

  console.log("User successfully removed from the event.");
};
