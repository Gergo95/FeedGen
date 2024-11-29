import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventsContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../firebase/firebaseConfig";
import "../../styles/components/EventCreator.css";
import { toast } from "react-toastify";

const EventCreator = () => {
  const { currentUser } = useAuth();
  const { createEvent } = useEvents();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !date || !description) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setUploading(true);

      let photoURL = "";
      if (image) {
        const storageRef = ref(
          storage,
          `events/${currentUser.uid}/${Date.now()}-${image.name}`
        );
        await uploadBytes(storageRef, image);
        photoURL = await getDownloadURL(storageRef);
      }

      await createEvent({
        name,
        description,
        date,
        photoURL,
        creatorId: currentUser.uid,
        creatorName: currentUser.name || "Anonymous",
        goingId: [currentUser.uid],
        going: [currentUser.uid].length,
      });

      toast.success("Event created Successfully!!", {
        position: "top-center",
      });
      setName("");
      setDescription("");
      setDate("");
      setImage(null);
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="event-creator" onSubmit={handleSubmit}>
      <h2>Create Event</h2>

      <label>
        Event Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
        />
      </label>

      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
        ></textarea>
      </label>

      <label>
        Date:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label>
        Event Picture:
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      </label>

      <button type="submit" disabled={uploading}>
        {uploading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
};

export default EventCreator;
