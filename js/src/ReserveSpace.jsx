import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import parse from "html-react-parser";

import queryString from "query-string";

import Calendar from "./components/Calendar/Calendar.desktop";

import { generateDates } from "./helpers";

import axios from "axios";
import moment from "moment";

import { motion, AnimatePresence } from "framer-motion";
import { libcal } from "./services";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";

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
  const [errorMsg, setErrorMsg] = useState("")
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
      const data = await libcal.getAvailability(spaceId);

      const room = { ...data[0] };
      console.log(data);
      const availability = room.availability;
      setRoom({
        ...room,
        availability: availability ? availability.map((slot) => ({
          id: slot.from,
          from: moment(slot.from),
          to: moment(slot.to),
        })).filter(slot => moment().isSameOrBefore(slot.from)) : [],
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
        className={`calDay indicator ${isAvailable && selectedDate.isSame(date, "day") ? "selected" : ""
          }`}
      >
        <div className={` dayContainer ${isAvailable ? "available" : ""}`}>
          <span class="numDay">{date.format("D")}</span>
          <span class="monthDay">{date.format("MMM")}</span>
        </div>
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
          className={`slot ${selectedSlots.includes(slot.id) ? "slot-selected" : ""
            } ${!selectedSlots.includes(slot.id) && !isValidForSelection
              ? "disabled"
              : ""
            }`}
          onClick={
            selectedSlots.includes(slot.id) || isValidForSelection
              ? handleSlotSelection(slot.id)
              : null
          }
        >
          <span class="slotTime">
            {slot.from.format("hh:mmA")} — {slot.to.format("hh:mmA")}
          </span>
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
        <span class="slotPrompt">Select up to 4 slots</span>
        <div className="slot-list">{render}</div>
        <div className="d-flex mt-3">
          <button
            onClick={() => {
              setHasSelectedSlots(true);
            }}
            disabled={selectedSlots.length < 1}
            className="ms-auto btn btn-outline-primary px-4"
          >
            Next <i class="fas fa-chevron-right"></i>
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
            <i class="fas fa-chevron-left"></i> Back
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
              disabled={!isFormFilled()}
            >
              Submit <i class="fas fa-chevron-right"></i>
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

    if (!isFormValid()) {
      setErrorMsg("Please use your LSU email.")
      setIsReserving(status.failed);
      return
    }
    // Reserve a space
    // API Authentication: Requires write access
    // The LibCal Resource plugin currently does not handle POST requests
    const slots = room.availability.filter((slot) =>
      selectedSlots.includes(slot.id)
    );

    const payload = {
      ...formFields,
      start: selectedSlots[0],
      // bookings: slots.map((slot) => ({
      //   id: room.id,
      //   to: slot.to.format(),
      // })),
      bookings: [{
        id: room.id,
        to: slots[selectedSlots.length - 1].to.format()
      }],
      test: 0,
    };

    try {
      setIsReserving(status.processing);

      const response = await libcal.reserve(payload);

      if (response.data.message.hasOwnProperty("booking_id")) {
        setIsReserving(status.successful);
      } else {
        setIsReserving(status.failed);
      }

      fetchAvailibility();
    } catch (error) {
      const message = error.response.data.message;
      setErrorMsg(message)
      setIsReserving(status.failed);
    }
  };

  const isFormValid = () => {
    const regex = new RegExp("[a-z0-9\.-_]*@lsu\.edu$", "i");
    return regex.test(formFields.email)
  }

  const generatecrumbs = () => {
    const title = "Study Spaces";
    const root = window.location.origin + "/spaces"

    const category = queryString.parse(location.search).category
    const categoryLink = window.location.origin + "/spaces/booking" + "?category=" + queryString.parse(location.search).categoryId

    const roomName = room?.name.split(" ").slice(-1)[0];
    const href = window.location.href

    return [
      { label: title, link: root },
      { label: category, link: categoryLink },
      { label: roomName, link: href }
    ]
  }

  const isFormFilled = () => {
    return Boolean(formFields.fname && formFields.lname && formFields.email)
  }

  if (!room) return null;

  return (
    <>
      <div class="bookingBreadcrumb"><Breadcrumb crumbs={generatecrumbs()}></Breadcrumb></div>

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
              datesToRender={generateDates(undefined, 3, true)}
            ></Calendar>
          </motion.div>
        </AnimatePresence>
        <div class="column blurredElement">
          {/* <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="column blurredElement"
          > */}
          <div className="box">
            <div class="roomBox">
              <div class="roomHeader">
                <div class="roomImage">
                  {room.image ? <img src={room.image} className="preview-img"></img> : null}
                </div>
                <div class="roomLabel">
                  <h3>{room.name}</h3>
                  {/* <span class="roomZone"> insert room zone here </span> */}
                  <div class="roomDate"><span class="selectedLabel">Selected date</span><span class="selectedDate">{selectedDate.format("dddd, MMMM Do YYYY")}</span></div>
                </div>
              </div>
              <div class="roomDetails">
                <p>{parse(room.description)}</p>
                <div class="roomFooter">
                  {/* insert room directions here */}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {!hasSelectedSlots ? renderSlots() : renderForm()}
            </AnimatePresence>
          </div>
          {/* </motion.div>
        </AnimatePresence> */}
        </div>

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
                    : errorMsg}
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
    </>
  );
};

const container = document.getElementById("reserve-space");
const root = createRoot(container);
root.render(<ReserveSpace />);
