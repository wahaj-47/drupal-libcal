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
    followCursor: true,
  });

  return (
    <Fragment key={event.id + date.format("mmddyyyy")}>
      <div
        ref={setTriggerRef}
        style={{
          backgroundColor: `${event.color}`,
        }}
        className={`event  ${
          date.isSame(event.start, "day") ? "eventStart" : undefined
        } ${date.isSame(event.end, "day") ? "eventEnd" : undefined}`}
      >
        {date.isSame(event.start, "day") ? <p>{event.title}</p> : null}
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: "tooltip-container" })}
        >
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
          <div className="header">
            <h1>{event.title}</h1>
            <p>
              {event.start.format("hh:mmA")} - {event.end.format("hh:mmA")}
            </p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: event.description }}></div>
        </div>
      )}
    </Fragment>
  );
};

export default Event;
