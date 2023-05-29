import React, { Fragment } from "react";

import { usePopperTooltip } from "react-popper-tooltip";

const Event = ({ event, date }) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip({
    placement: "auto",
    followCursor: false,
    interactive: true,
    trigger: "click",
  });

  return (
    <Fragment key={event.id + date.format("mmddyyyy")}>
      <div
        ref={setTriggerRef}
        style={{
          backgroundColor: `${event.color}`,
        }}
        className={`event  ${
          date.isSame(event.start, "day") ? "event-start" : undefined
        } ${date.isSame(event.end, "day") ? "event-end" : undefined}`}
      >
        {date.isSame(event.start, "day") ? <p>{event.title}</p> : null}
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: "tooltip-container" })}
        >
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
          <div
            onClick={() => {
              location.href = event.url.public;
            }}
            className="header"
          >
            <h1>{event.title}</h1>
            <p>
              {event.start.format("hh:mmA")} - {event.end.format("hh:mmA")}
            </p>
          </div>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: event.description }}
          ></div>
        </div>
      )}
    </Fragment>
  );
};

export default Event;
