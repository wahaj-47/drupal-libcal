import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import queryString from "query-string";

import Calendar from "./components/Calendar/Calendar.desktop";

import { generateDates } from "./helpers";

import axios from "axios";
import moment from "moment";

import { motion, AnimatePresence } from "framer-motion";

const status = Object.freeze({
  processing: Symbol("processing"),
  successful: Symbol("successful"),
  failed: Symbol("failed"),
});

const ReserveSpace = () => {
  const [room, setRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [hasSelectedSlots, setHasSelectedSlots] = useState(false);
  const [formFields, setFormFields] = useState({
    fname: "",
    lname: "",
    email: "",
  });
  const [isReserving, setIsReserving] = useState(status.processing);

  const resetState = () => {
    setSelectedSlots([]);
    setHasSelectedSlots(false);
    setFormFields({
      fname: "",
      lname: "",
      email: "",
    });
  };

  useEffect(() => {
    fetchAvailibility();
  }, []);

  const fetchAvailibility = async () => {
    try {
      const spaceId = queryString.parse(location.search).id;
      const response = await axios.get(
        `http://lwt3test.lsu.edu/api/libcal/space/item/${spaceId}?availability=${moment()
          .subtract(1, "day")
          .format("YYYY-MM-DD")},${moment()
          .add(70, "days")
          .format("YYYY-MM-DD")}`
      );

      const room = { ...response.data.message[0] };
      const availability = room.availability;
      setRoom({
        ...room,
        availability: availability.map((slot) => ({
          id: slot.from,
          from: moment(slot.from),
          to: moment(slot.to),
        })),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderIndicator = (date) => {
    let isAvailable = false;

    for (let index = 0; index < room.availability.length; index++) {
      const slot = room.availability[index];
      if (slot.from.isSame(date, "day")) {
        isAvailable = true;
        break;
      }
    }

    return (
      <div
        className={`indicator ${
          isAvailable && selectedDate.isSame(date, "day") ? "selected" : ""
        }`}
      >
        <h1 className={`${isAvailable ? "available" : ""}`}>
          {date.format("D MMM")}
        </h1>
      </div>
    );
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setHasSelectedSlots(false);
  };

  const renderSlots = () => {
    const slots = room.availability.filter((slot) =>
      slot.from.isSame(selectedDate, "day")
    );

    if (slots.length < 1)
      return (
        <motion.div
          initial={{ opacity: 0, translateY: 200 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -200 }}
          key="no-slots"
          className="slot"
        >
          <h4>Space unavailable for {selectedDate.format("DD MMM YYYY")}</h4>
        </motion.div>
      );

    const sorted = selectedSlots
      .map((from) => moment(from))
      .sort((a, b) => a.diff(b));

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const next = moment(last).add(60, "minutes");
    const max = moment(first).add(120, "minutes");

    const render = [];

    slots.forEach((slot) => {
      let isValidForSelection = true;
      if (first)
        isValidForSelection =
          slot.from.isSameOrAfter(first, "minutes") &&
          slot.to.isSameOrBefore(next, "minutes") &&
          slot.to.isSameOrBefore(max, "minutes");

      render.push(
        <div
          key={slot.id}
          className={`slot ${
            selectedSlots.includes(slot.id) ? "slot-selected" : ""
          } ${
            !selectedSlots.includes(slot.id) && !isValidForSelection
              ? "disabled"
              : ""
          }`}
          onClick={
            selectedSlots.includes(slot.id) || isValidForSelection
              ? handleSlotSelection(slot.id)
              : null
          }
        >
          <h4>
            {slot.from.format("hh:mma")} to {slot.to.format("hh:mma")}
          </h4>
        </div>
      );
    });

    return (
      <motion.div
        initial={{ opacity: 0, translateY: 200 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -200 }}
        key="slots"
        layout
      >
        <h4>What time works best for you?</h4>
        <p>You can select upto 4 slots</p>
        <div className="slot-list">{render}</div>
        <div className="d-flex mt-3">
          <button
            onClick={() => {
              setHasSelectedSlots(true);
            }}
            disabled={selectedSlots.length < 1}
            className="ms-auto btn btn-outline-primary px-4"
          >
            Next <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </motion.div>
    );
  };

  const renderForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, translateY: 200 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -200 }}
        key="form"
        layout
      >
        <form onSubmit={handleSubmit}>
          <p
            role="button"
            className="my-3"
            onClick={() => {
              setHasSelectedSlots(false);
            }}
          >
            <i class="fa-solid fa-chevron-left"></i> Back
          </p>
          <h4>Confirm reservation</h4>
          <div class="input-group mt-3 mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="First Name"
              value={formFields.fname}
              onChange={updateFormFields("fname")}
              required
            />
            <input
              type="text"
              class="form-control"
              placeholder="Last Name"
              value={formFields.lname}
              onChange={updateFormFields("lname")}
              required
            />
          </div>
          <div class="input-group mb-3">
            <input
              type="email"
              class="form-control"
              placeholder="Email"
              value={formFields.email}
              onChange={updateFormFields("email")}
              required
            />
          </div>
          <div className="d-flex">
            <button
              className="ms-auto btn btn-outline-primary px-4"
              type="submit"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
            >
              Submit <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  const handleSlotSelection = (slotId) => () => {
    setSelectedSlots(_.xor(selectedSlots, [slotId]));
  };

  const updateFormFields = (field) => (e) => {
    setFormFields({ ...formFields, [field]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reserve a space
    // API Authentication: Requires write access
    // The LibCal Resource plugin currently does not handle POST requests
    const slots = room.availability.filter((slot) =>
      selectedSlots.includes(slot.id)
    );
    const payload = {
      ...formFields,
      start: selectedSlots[0],
      bookings: slots.map((slot) => ({
        id: room.id,
        to: slot.to.format(),
      })),
      test: 0,
    };

    try {
      setIsReserving(status.processing);

      const response = await axios.post(
        "http://lwt3test.lsu.edu/api/libcal/space/reserve",
        payload
      );

      if (response.data.message.hasOwnProperty("booking_id")) {
        setIsReserving(status.successful);
      } else {
        setIsReserving(status.failed);
      }

      fetchAvailibility();
    } catch (error) {
      console.log(error);
    }
  };

  if (!room) return null;

  return (
    <div className="d-flex flex-wrap">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="column blurredElement"
        >
          <Calendar
            onDateSelected={handleDateSelection}
            renderChild={renderIndicator}
            showDay={false}
            datesToRender={generateDates(undefined, undefined, true)}
          ></Calendar>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="column blurredElement"
        >
          <div className="box">
            <h3>{room.name}</h3>
            <h4>Date selected: {selectedDate.format("DD MMM YYYY")}</h4>
            <AnimatePresence>
              {!hasSelectedSlots ? renderSlots() : renderForm()}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        class="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                {isReserving == status.processing
                  ? "Just a second..."
                  : isReserving == status.successful
                  ? "All done!"
                  : "Uh-oh! Something went wrong"}
              </h5>
            </div>
            <div class="modal-body">
              {isReserving == status.processing
                ? "Getting everything ready..."
                : isReserving == status.successful
                ? `Space reserved. An email was sent to ${formFields.email}, click the link in the email to confirm the reservation.`
                : "Please try again"}
            </div>
            <div class="modal-footer">
              {isReserving != status.processing ? (
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={resetState}
                >
                  OK
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById("reserve-space");
const root = createRoot(container);
root.render(<ReserveSpace />);
