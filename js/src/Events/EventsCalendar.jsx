import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import moment from "moment";
import _ from "lodash";

import CalendarMobile from "./components/Calendar.mobile";
import CalendarDesktop from "./components/Calendar.desktop";

import useWindowDimensions from "../hooks/useWindowsDimensions";
import { generateDates } from "../helpers";
import { libcal } from "../services";

const EventsCalendar = () => {
  const { width } = useWindowDimensions();

  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setCalendar] = useState(null);
  const [datesToRender, setDatesToRender] = useState([]);

  const parent = useRef(null);

  const [parentWidth, setParentWidth] = useState(0);
  const isSmallDevice = width < 768 || parentWidth <= 696;

  useEffect(() => {
    fetchCalendars();

    setParentWidth(parent.current.offsetWidth);

    function handleResize() {
      setParentWidth(parent.current.offsetWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCalendar(calendars[0]?.calid);
  }, [calendars]);

  useEffect(() => {
    fetchEvents();
  }, [selectedCalendar]);

  useEffect(() => {
    setDatesToRender(generateDates(undefined, undefined, !isSmallDevice));
  }, [isSmallDevice]);

  const fetchCalendars = async () => {
    const calendars = await libcal.getCalendars();
    setCalendars(calendars);
  };

  const fetchEvents = async () => {
    try {
      if (!selectedCalendar) return;

      let today = moment();

      while (today.format("dd") !== "Su") {
        today.subtract(1, "day");
      }

      const rawEventData = await libcal.getEvents(
        selectedCalendar,
        today.format("YYYY-MM-DD")
      );

      const eventsFromServer = rawEventData.map((event) => ({
        ...event,
        start: moment(event.start),
        end: moment(event.end),
      }));

      const events = [];
      Object.values(_.groupBy(eventsFromServer, "title")).forEach((array) => {
        events.push({
          ...array[0],
          start: array[0].start,
          end: array[array.length - 1].end,
        });
      });

      setEvents(events);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCalendarSelection = (e) => {
    setCalendar(Number(e.target.value));
  };

  return (
    <div ref={parent} className="events-container">
      <select className="form-select mb-3" onChange={handleCalendarSelection}>
        {calendars.map((calendar) => (
          <option key={calendar.calid} value={calendar.calid}>
            {calendar.name}
          </option>
        ))}
      </select>
      {isSmallDevice ? (
        <CalendarMobile
          events={events}
          datesToRender={datesToRender}
        ></CalendarMobile>
      ) : (
        <CalendarDesktop
          events={events}
          datesToRender={datesToRender}
        ></CalendarDesktop>
      )}
    </div>
  );
};

const container = document.getElementById("events-calendar");
const root = createRoot(container);
root.render(<EventsCalendar />);
