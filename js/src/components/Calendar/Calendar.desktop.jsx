import React, { useState, useRef, cloneElement, useMemo } from "react";

import Slider from "react-slick";
import moment from "moment";
import classNames from "classnames";

const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({
  children,
  onDateSelected = () => { },
  dates = { start: moment().subtract(45, 'days'), end: moment().add(45, 'days') },
  enabled = { start: moment().subtract(45, 'days'), end: moment().add(45, 'days') },
}) => {
  const [selectedDate, setDate] = useState(moment());
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
    while (!moment(datesToRender[index]).isValid()) {
      nextSlide += 1
      index = nextSlide * 6;
    }
    setDate(moment(datesToRender[index]));
  };

  const datesToRender = useMemo(() => {
    const startMonth = dates.start.startOf("month");
    const endMonth = dates.end.endOf("month");

    let data = [];
    let month = startMonth.clone();

    while (month.isBefore(endMonth) || month.isSame(endMonth, "month")) {
      const monthStart = month.startOf("month").clone();
      const monthEnd = month.endOf("month").clone();

      // Step 1: Pad the start of the month to Sunday
      const startDay = monthStart.day(); // 0 = Sunday
      for (let i = 0; i < startDay; i++) {
        data.push(null);
      }

      // Step 2: Add all days in this month
      let current = monthStart.clone();
      while (current.isBefore(monthEnd) || current.isSame(monthEnd, "day")) {
        data.push(current.clone());
        current = current.add(1, "day");
      }

      // Step 3: Pad the end to Saturday
      const endDay = monthEnd.day(); // 6 = Saturday
      for (let i = endDay + 1; i <= 6; i++) {
        data.push(null);
      }

      // Optional: Add a row of nulls between months (for visual gap)
      // If you prefer no visual gap, you can skip this
      for (let i = 0; i < 7; i++) {
        data.push(null);
      }

      // Move to next month
      month = month.add(1, "month");
    }

    data = _.flatten(
      _.chunk(_.chunk(data, 7), 6).map((chunk) => _.flatten(_.zip(...chunk)))
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
        rows={6}
        arrows={false}
        afterChange={updateHeader}
        className="slider"
      >
        {datesToRender.map((date) => {

          const dayClass = classNames(
            {
              'selected-day': selectedDate.isSame(date, 'day'),
              'selected-month': selectedDate.isSame(date, 'month'),
            }
          )

          if (!moment(date).isValid())
            return <div className="day"></div>

          return (
            <div
              key={date.format("mmDDyyyy")}
              onClick={handleDateSelection(date)}
              className="day"
            >
              {children ? (
                cloneElement(children, {
                  date: date,
                  selected: selectedDate.isSame(date, "day"),
                  disabled: !enabled.start || !enabled.end || date.isBefore(enabled.start, 'day') || date.isAfter(enabled.end, 'day')
                })
              ) :
                <div className={dayClass}>
                  <h1>{date.format("DD")}</h1>
                </div>
              }
            </div>
          )
        })}
      </Slider>
    </div>
  );
};

export default Calendar;
