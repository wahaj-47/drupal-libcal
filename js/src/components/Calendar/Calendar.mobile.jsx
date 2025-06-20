import React, { useState, useRef, useEffect } from "react";

import Slider from "react-slick";
import dayjs from "dayjs";

const Calendar = ({ renderDots, renderChild, datesToRender }) => {
  const [datesInState, setDatesInState] = useState([])
  const [selectedDate, setDate] = useState(dayjs());
  const slick = useRef(null);

  useEffect(() => {
    if (datesToRender) {
      const datesWithoutPadding = datesToRender.filter(date => date)
      setDatesInState(datesWithoutPadding)
    }
  }, [datesToRender])

  useEffect(() => {
    if (datesInState) {
      const todaysIndex = datesInState.findIndex(date => dayjs().isSame(dayjs(date), 'date'))
      if (todaysIndex != -1)
        slick.current.slickGoTo(todaysIndex);
    }
  }, [datesInState])

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
    setDate(dayjs(datesInState[index]));
  };

  return (
    <div className="box">
      <div className="calendar-header">
        <h1>{selectedDate.format("MMMM YYYY")}</h1>
        <div>
          <i
            onClick={goToSlide("prev")}
            className="fas fa-chevron-left"
          ></i>
          <h1 onClick={goToSlide("today")}>Today</h1>
          <i
            onClick={goToSlide("next")}
            className="fas fa-chevron-right"
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
        {datesInState.map((date) => {
          if (dayjs(date).isValid())
            return (
              <div
                key={date.format("mmDDyyyy")}
                onClick={handleDateSelection(date)}
                className="day-mobile"
              >
                <h1>{date.format("dd")}</h1>
                <h1
                  className={
                    selectedDate.isSame(date, "day") ? "selected-day" : undefined
                  }
                >
                  {date.format("DD")}
                  <div className="event-dots">{renderDots(date)}</div>
                </h1>
              </div>
            )
        })}
      </Slider>
      <div id="list-header">
        <h2>{selectedDate.format("dddd, MMMM D")}</h2>
      </div>
      <div id="event-list">{renderChild(selectedDate)}</div>
    </div>
  );
};

export default Calendar;
