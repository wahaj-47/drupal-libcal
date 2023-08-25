import React, { useState, useRef } from "react";

import Slider from "react-slick";
import moment from "moment";

const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({
  renderChild = () => {
    return null;
  },
  onDateSelected = () => { },
  datesToRender,
  showDay = true,
}) => {
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
    }
  };

  const handleDateSelection = (date) => () => {
    setDate(date);
    onDateSelected(date);
  };

  const updateHeader = (slideIndex) => {
    let nextSlide = slideIndex
    let index = nextSlide * 5;
    while (!moment(datesToRender[index]).isValid()) {
      nextSlide += 1
      index = nextSlide * 5;
    }
    setDate(moment(datesToRender[index]));
  };

  return (
    <div className="box">
      <div className="calendar-header">
        <h1>{selectedDate.format("MMMM YYYY")}</h1>
        <div>
          <i
            role="button"
            onClick={goToSlide("prev")}
            className="fas fa-chevron-left"
          ></i>
          <h1 onClick={goToSlide("today")}>{selectedDate.format("Do MMM")}</h1>
          <i
            role="button"
            onClick={goToSlide("next")}
            className="fas fa-chevron-right"
          ></i>
        </div>
      </div>
      <div id="week-header">
        {daysOfTheWeek.map((day) => (
          <div className="dayLetter">
            <h1>{day}</h1>
          </div>
        ))}
      </div>

      <Slider
        ref={slick}
        slidesToShow={7}
        slidesToScroll={7}
        initialSlide={0}
        infinite={false}
        rows={5}
        arrows={false}
        afterChange={updateHeader}
        className="slider"
      >
        {datesToRender.map((date) => {
          if (!moment(date).isValid())
            return <div className="day"></div>

          return (
            <div
              key={date.format("mmDDyyyy")}
              onClick={handleDateSelection(date)}
              className="day"
            >
              {showDay ? (
                <div
                  className={`${selectedDate.isSame(date, "day") ? "selected-day" : ""
                    } ${selectedDate.isSame(date, "month") ? "selected-month" : ""
                    } day-of-month`}
                >
                  <h1>{date.format("DD")}</h1>
                </div>
              ) : null}
              {renderChild(date)}
            </div>
          )
        })}
      </Slider>
    </div>
  );
};

export default Calendar;
