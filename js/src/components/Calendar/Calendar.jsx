import React, { useState, useRef, useMemo } from "react";

import Slider from "react-slick";
import Day from "./Day";
import dayjs from "dayjs";
import { chunk, flatten, zip } from "lodash";

const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({
  onDateSelected = () => { },
  dates = { start: dayjs().subtract(45, 'days'), end: dayjs().add(45, 'days') },
  enabled = { start: dayjs().subtract(45, 'days'), end: dayjs().add(45, 'days') },
  components = { Day: Day }
}) => {
  const { Day } = components;
  const [selectedDate, setDate] = useState(dayjs());
  const slick = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (direction) => () => {
    switch (direction) {
      case "prev":
        if (currentIndex > 0)
          slick.current.slickPrev();
        break;
      case "next":
        if (currentIndex < 14)
          slick.current.slickNext();
        break;
    }
  };

  const handleDateSelection = (date) => () => {
    setDate(date);
    onDateSelected(date);
  };

  const updateHeader = (slideIndex) => {
    setCurrentIndex(slideIndex)

    let nextSlide = slideIndex
    let index = nextSlide * 6;
    while (!dayjs(datesToRender[index]).isValid()) {
      nextSlide += 1
      index = nextSlide * 6;
    }
    setDate(dayjs(datesToRender[index]));
  };

  const datesToRender = useMemo(() => {
    const startMonth = dates.start.startOf("month");
    const endMonth = dates.end.endOf("month");

    let data = [];
    let month = startMonth.clone();

    while (month.isBefore(endMonth) || month.isSame(endMonth, "month")) {
      const monthStart = month.startOf("month").clone();
      const monthEnd = month.endOf("month").clone();

      const startDay = monthStart.day(); // 0 = Sunday
      for (let i = 0; i < startDay; i++) {
        data.push(null);
      }

      let current = monthStart.clone();
      while (current.isBefore(monthEnd) || current.isSame(monthEnd, "day")) {
        data.push(current.clone());
        current = current.add(1, "day");
      }

      const endDay = monthEnd.day(); // 6 = Saturday
      for (let i = endDay + 1; i <= 6; i++) {
        data.push(null);
      }

      const total = 6 + startDay - endDay + month.daysInMonth();

      for (let i = 0; i < 42 - total; i++) {
        data.push(null);
      }

      month = month.add(1, "month");
    }

    data = flatten(
      chunk(chunk(data, 7), 6).map((chunk) => flatten(zip(...chunk)))
    );

    return data;
  }, [dates.start, dates.end]);

  return (
    <div className="box">
      <div className="calendar-header">
        <div>
          <i
            role="button"
            onClick={goToSlide("prev")}
            className="fas fa-chevron-left"
          ></i>
          <h1 onClick={goToSlide("today")}>{selectedDate.format("MMM YYYY")}</h1>
          <i
            role="button"
            onClick={goToSlide("next")}
            className="fas fa-chevron-right"
          ></i>
        </div>
      </div>
      <div id="week-header">
        {daysOfTheWeek.map((day) => (
          <div key={day} className="day-letter">
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
        rows={6}
        arrows={false}
        afterChange={updateHeader}
        className="slider"
      >
        {datesToRender.map((date, index) => {

          if (!dayjs(date).isValid())
            return <div key={index} className="day invalid"></div>

          const disabled = !enabled.start || !enabled.end || date.isBefore(enabled.start, 'day') || date.isAfter(enabled.end, 'day');

          return (
            <Day
              key={date.format("MMDDYYYY")}
              date={date}
              selected={selectedDate.isSame(date, "day")}
              disabled={disabled}
              handleClick={!disabled ? handleDateSelection(date) : undefined}
            >
            </Day>
          )
        })}
      </Slider>
    </div>
  );
};

export default Calendar;
