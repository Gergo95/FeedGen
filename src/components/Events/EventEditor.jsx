import React, { useState, useEffect, useCallback } from "react";
import "../../styles/components/EventEditor.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { useEvents } from "../../context/EventsContext";

const EventEditor = () => {
  const navigate = useNavigate();
  const { fetchEventByEventId, updateEventData, uploadEventImage } =
    useEvents();
  const { eventId } = useParams();

  const [event, setEvent] = useState({
    name: "",
    description: "",
    photoURL: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = await fetchEventByEventId(eventId);
        setEvent(data);
      } catch (err) {
        setError("Failed to load event data");
      }
    };
    fetchEventData();
  }, [eventId, fetchEventByEventId]);

  const handleInputChange = useCallback((field, value) => {
    setEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const downloadURL = await uploadEventImage(eventId, file);
        handleInputChange("photoURL", downloadURL);

        setLoading(false);
        setSuccess("Image uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image");
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateEventData(eventId, event);
      setLoading(false);
      setSuccess("Event updated successfully!");
      navigate(`/events/${eventId}`);
    } catch (err) {
      setError("Failed to update event");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="event-editor">
        <h2 className="event-editor-title">Edit Event</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="event-form">
          <div className="photo-upload">
            <img
              src={event?.photoURL || "https://via.placeholder.com/150"}
              alt="Event"
              className="event-photo"
            />
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
              disabled={loading}
              accept="image/*"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Event Name"
              value={event?.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <textarea
              placeholder="Event Description"
              value={event?.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="date"
              value={event?.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="save-button">
            <button
              onClick={handleSave}
              className="btn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventEditor;
