import React from "react";

import CalendarComponent from "../../components/Calendar/Calendar.mobile";
import Event from "./Event.mobile";

import { getRandomColor } from "../../helpers";

const Dot = ({ event }) => {
  return (
    <div
      key={event.id}
      style={{ backgroundColor: `${event.color}` }}
      className="dot"
    ></div>
  );
};

const Calendar = ({ events, datesToRender }) => {
  const renderEvents = (date) => {
    const render = [];

    let eventsToRender = events.filter(
      (event) =>
        date.isSameOrAfter(event.start, "day") &&
        date.isSameOrBefore(event.end, "day")
    );

    eventsToRender.forEach((event) => {
      // Generate color for event
      let color = event.color || getRandomColor();
      event.color = color;

      // Render event
      render.push(<Event event={event} date={date} />);
    });

    return render;
  };

  const renderDots = (date) => {
    let eventsToRender = events.filter(
      (event) =>
        date.isSameOrAfter(event.start, "day") &&
        date.isSameOrBefore(event.end, "day")
    );

    let dots = [];

    eventsToRender.forEach((event) => {
      let color = event.color || getRandomColor();
      event.color = color;

      dots.push(<Dot event={event} />);
    });

    return dots;
  };

  return (
    <CalendarComponent
      renderDots={renderDots}
      renderChild={renderEvents}
      datesToRender={datesToRender}
    ></CalendarComponent>
  );
};

export default Calendar;
