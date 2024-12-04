import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/components/Calendar.css";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventsContext";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const MyBigCalendar = () => {
  const [events, setEvents] = useState([]);
  const { currentUser } = useAuth();
  const { fetchEventsYouGoing } = useEvents();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      const eventsData = await fetchEventsYouGoing(currentUser.uid);

      const formattedEvents = eventsData.map((event) => ({
        id: event.id,
        title: event.name,
        start: new Date(event.date),
        end: new Date(event.date),
        allDay: true,
      }));
      setEvents(formattedEvents);
    };

    loadEvents();
  }, []);

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={(event) => navigate(`/events/${event.id}`)}
      />
    </div>
  );
};

export default MyBigCalendar;
