import React, { useState, useEffect, Fragment } from "react";
import CalendarComponent from "../../components/Calendar/Calendar.desktop";
import Event from "./Event.desktop";

import { usePopperTooltip } from "react-popper-tooltip";

import { getRandomColor } from "../../helpers";

const EventCollapsed = ({ event, visible }) => {
  const [detailsVisible, setVisible] = useState(false);

  const toggleDetails = () => {
    setVisible(!detailsVisible);
  };

  useEffect(() => {
    if (!visible) setVisible(false);
  }, [visible]);

  return (
    <div className="eventMobile" onClick={toggleDetails}>
      <div className="header">
        <div
          style={{ backgroundColor: `${event.color}` }}
          className="colorBar"
        ></div>
        <h1>{event.title}</h1>
        <p>
          {event.start.format("hh:mmA")} - {event.end.format("hh:mmA")}
        </p>
      </div>
      <div
        className={`body${detailsVisible ? " expand" : ""}`}
        dangerouslySetInnerHTML={{ __html: event.description }}
      ></div>
    </div>
  );
};

const EventsList = ({ collapsed }) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip({
    placement: "auto",
    followCursor: true,
    interactive: true,
  });

  const [color, setColor] = useState(color);

  useEffect(() => { setColor(getRandomColor()) }, [])

  return (
    <Fragment>
      <div
        ref={setTriggerRef}
        className={`event event-collapse event-start event-end`}
        style={{ backgroundColor: color }}
      >
        {collapsed.length} more
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: "tooltip-container" })}
        >
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
          {collapsed.map((event) => (
            <EventCollapsed event={event} visible={visible} />
          ))}
        </div>
      )}
    </Fragment>
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

    let collapsed = [];
    let shouldCollapse = eventsToRender.length > 2;

    if (shouldCollapse) collapsed = eventsToRender.splice(1);
    eventsToRender.forEach((event) => {
      // Generate color for event
      let color = event.color || getRandomColor();
      event.color = color;

      const eventsOnStartDay = events.filter(
        (previousEvent) =>
          event.start.isSameOrAfter(previousEvent.start, "day") &&
          event.start.isSameOrBefore(previousEvent.end, "day")
      );

      let shouldRenderEmptyDiv =
        JSON.stringify(eventsToRender) !== JSON.stringify(eventsOnStartDay) &&
        date.isAfter(event.start, "day") &&
        eventsOnStartDay.some((eventOnStartDay) =>
          eventOnStartDay.start.isBefore(event.start, "hour")
        );

      if (shouldRenderEmptyDiv)
        render.push(
          <div
            style={{
              backgroundColor: `transparent`,
            }}
            className={`event ${date.isSame(event.start, "day") ? "event-start" : undefined
              } ${date.isSame(event.end, "day") ? "event-end" : undefined}`}
          ></div>
        );

      // Render event
      render.push(<Event event={event} date={date} />);
    });

    if (shouldCollapse) render.push(<EventsList collapsed={collapsed} />);

    return render;
  };

  return (
    <CalendarComponent
      renderChild={renderEvents}
      datesToRender={datesToRender}
    ></CalendarComponent>
  );
};

export default Calendar;
