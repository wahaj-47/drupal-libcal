import React, { useState, useRef } from "react";

import Slider from "react-slick";
import moment from "moment";

const Calendar = ({ renderDots, renderChild, datesToRender }) => {
  const [selectedDate, setDate] = useState(moment());
  const slick = useRef(null);

  const goToSlide = (direction) => () => {
    switch (direction) {
      case "prev":
        slick.current.slickPrev();
        break;
      case "next":
        slick.current.slickNext();
        break;
      case "today":
        //Commenting for now. Glitchy behaviour
        // slick.current.slickGoTo(todayIndex.current);
        break;
    }
  };

  const handleDateSelection = (date) => () => {
    setDate(date);
  };

  const updateHeader = (index) => {
    setDate(moment(datesToRender[index]));
  };

  return (
    <div className="box">
      <div className="calendar-header">
        <h1>{selectedDate.format("MMMM YYYY")}</h1>
        <div>
          <i
            onClick={goToSlide("prev")}
            className="fa-solid fa-chevron-left"
          ></i>
          <h1 onClick={goToSlide("today")}>Today</h1>
          <i
            onClick={goToSlide("next")}
            className="fa-solid fa-chevron-right"
          ></i>
        </div>
      </div>
      <Slider
        ref={slick}
        slidesToShow={7}
        slidesToScroll={7}
        initialSlide={0}
        infinite={false}
        rows={1}
        arrows={false}
        afterChange={updateHeader}
      >
        {datesToRender.map((date) => (
          <div
            key={date.format("mmDDyyyy")}
            onClick={handleDateSelection(date)}
            className="day-mobile"
          >
            <h1>{date.format("dd")}</h1>
            <h1
              className={
                selectedDate.isSame(date, "day") ? "selectedDay" : undefined
              }
            >
              {date.format("DD")}
              <div className="eventDots">{renderDots(date)}</div>
            </h1>
          </div>
        ))}
      </Slider>
      <div id="listHeader">
        <h2>{selectedDate.format("dddd, MMMM D")}</h2>
      </div>
      <div id="eventList">{renderChild(selectedDate)}</div>
    </div>
  );
};

export default Calendar;
