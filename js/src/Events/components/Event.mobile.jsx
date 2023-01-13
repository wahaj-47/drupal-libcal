import React, { useState, useEffect } from "react";

const Event = ({ event, date }) => {
  const [detailsVisible, setVisible] = useState(false);

  const toggleDetails = () => {
    setVisible(!detailsVisible);
  };

  useEffect(() => {
    setVisible(false);
  }, [event]);

  return (
    <div
      key={event.id}
      className={`event event-mobile${
        date.isSame(event.start, "day") ? " eventStart" : ""
      }${date.isSame(event.end, "day") ? " eventEnd" : ""}`}
      onClick={toggleDetails}
    >
      <div className="header">
        <div className="left">
          <div
            style={{ backgroundColor: `${event.color}` }}
            className="colorBar"
          ></div>
          <p className="eventTitle">
            {event.start.format("hh:mmA")} - {event.title}
          </p>
        </div>
        <i
          className={`fa-sharp fa-solid${
            detailsVisible ? " fa-caret-up" : " fa-caret-down"
          }`}
        ></i>
      </div>
      <div
        className={`body${detailsVisible ? " expand" : ""}`}
        dangerouslySetInnerHTML={{
          __html: `<strong><em>${
            event.title
          }</em></strong><div class="description">${
            event.description
          }</div><br><p>${event.start.format("hh:mmA")} - ${event.end.format(
            "hh:mmA"
          )}</p>`,
        }}
      ></div>
    </div>
  );
};

export default Event;
