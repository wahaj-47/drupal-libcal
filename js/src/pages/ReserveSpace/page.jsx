import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom"

import { libcal } from "@services";

import parse from "html-react-parser";
import queryString from "query-string";

import Calendar from "@components/Calendar/Calendar.desktop";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";

import Day from "./components/Day";
import Slot from './components/Slot'
import ReservationForm from "./components/ReservationForm";

import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast'

import moment from "moment";
import _ from "lodash";

const ReserveSpace = () => {
  const [room, setRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [hasSelectedSlots, setHasSelectedSlots] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const spaceId = queryString.parse(location.search).id;
      const categoryId = queryString.parse(location.search).categoryId;
      const locationId = queryString.parse(location.search).locationId;

      const from = moment().format('YYYY-MM-DD');
      const to = moment().add(31, 'days').format('YYYY-MM-DD');
      const [locations, category, room, policyStatement, footers] = await Promise.all([libcal.getLocationIds(), libcal.getCategory(categoryId), libcal.getAvailability(spaceId, `${from},${to}`), libcal.getPolicies(), libcal.getFooters()])
      const l = locations.find(location => location.lid === Number(locationId))

      let form = null;
      if ("formid" in room[0] && room[0].formid !== 0) form = await libcal.getForm(room[0].formid)
      else if ("formid" in category[0] && category[0].formid !== 0) form = await libcal.getForm(category[0].formid);
      else if ("formid" in l && l.formid !== 0) form = await libcal.getForm(l.formid);

      room[0].form = form ? form[0] : null;
      room[0].globalFooter = footers['global'];
      room[0].footer = footers[room[0].id];
      room[0].policyStatement = policyStatement[categoryId] ?? "";

      if ("availability" in room[0]) {
        room[0].availability = room[0].availability.map((slot) => {
          const from = moment(slot.from)
          const to = moment(slot.to)

          const display = to.diff(from, "hours") > 4 ? "Library operating hours" : `${from.format("hh:mmA")} — ${to.format("hh:mmA")}`;

          return ({
            id: slot.from,
            display: display,
            from: moment(slot.from),
            to: moment(slot.to),
          })
        })
      }

      setRoom(room[0]);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const resetState = () => {
    setSelectedSlots([]);
    setHasSelectedSlots(false);
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setHasSelectedSlots(false);
  };

  const handleSlotSelection = (slotId) => () => {
    setSelectedSlots(_.xor(selectedSlots, [slotId]));
  };

  const handleSubmit = async (data) => {
    const slots = room.availability.filter((slot) =>
      selectedSlots.includes(slot.id)
    );

    const payload = {
      ...data,
      start: selectedSlots[0],
      bookings: [{
        id: room.id,
        to: slots[selectedSlots.length - 1].to.format()
      }],
      // Mock reservations
      test: 0,
    };

    toast.promise(
      async () => {
        const response = await libcal.reserve(payload);
        if (!("booking_id" in response.data.message)) {
          throw new Error("Reservation failed")
        }
        resetState();
      },
      {
        loading: 'Just a second...',
        success: `Space reserved.\n A confirmation email has been sent to ${data.email}`,
        error: "Uh-oh! Something went wrong"
      })
  };

  const breadContainer = document.getElementsByClassName('breadContainer')[0]
  const crumbs = useMemo(() => {
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
  }, [room])

  const slots = useMemo(() => {
    const sorted = selectedSlots
      .map((from) => moment(from))
      .sort((a, b) => a.diff(b))

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const next = moment(last).add(60, "minutes");
    const max = moment(first).add(180, "minutes");

    const data = room?.availability.filter((slot) =>
      slot.from.isSame(selectedDate, "day")
    ) ?? [];

    data.forEach((slot, index) => {
      data[index].valid = true;
      if (first)
        data[index].valid =
          slot.from.isSameOrAfter(first, "minutes") &&
          slot.to.isSameOrBefore(next, "minutes") &&
          slot.to.isSameOrBefore(max, "minutes");
    });

    return data;
  }, [room, selectedDate, selectedSlots])

  if (!room) return null;

  return (
    <>
      <Toaster />
      {createPortal(<Breadcrumb crumbs={crumbs}></Breadcrumb>, breadContainer)}

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
              dates={{ start: moment(), end: moment().add(3, 'months') }}
              enabled={
                {
                  start: "availability" in room ? room.availability[0].from : null,
                  end: "availability" in room ? room.availability[room.availability.length - 1].to : null
                }
              }
            >
              <Day></Day>
            </Calendar>
          </motion.div>
        </AnimatePresence>
        <div class="column blurredElement">
          <div className="box">
            <div class="roomBox">
              <div class="roomHeader d-flex">
                <div class="roomImage">
                  {room.image ? <a href={room.image} data-lightbox="room-image"><img src={room.image} className="preview-img"></img></a> : null}
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
                  {room.globalFooter ? parse(room.globalFooter.markup.value) : []}
                  {/* insert room directions here */}
                </div>
                <div>
                  <p>{room.policyStatement}</p>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {!hasSelectedSlots ?
                <motion.div
                  initial={{ opacity: 0, translateY: 200 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -200 }}
                  layout
                >
                  <span class="slotPrompt">Select up to {Math.min(slots.length, 6)} slots</span>
                  <div className="slot-list">
                    {slots.length > 0 ?
                      slots.map(slot => (
                        <Slot
                          key={slot.id}
                          id={slot.id}
                          label={slot.display}
                          selected={selectedSlots.includes(slot.id)}
                          isValid={slot.valid}
                          handleSelect={handleSlotSelection}
                        ></Slot>
                      ))
                      :
                      <motion.div
                        initial={{ opacity: 0, translateY: 200 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: -200 }}
                        className="slot"
                      >
                        <h4>Space unavailable for {selectedDate.format("DD MMM YYYY")}</h4>
                      </motion.div>
                    }
                  </div>
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
                :
                <>
                  <button
                    className="border border-0 my-3 bg-transparent text-start"
                    onClick={() => {
                      setHasSelectedSlots(false);
                    }}
                  >
                    <i class="fas fa-chevron-left"></i> Back
                  </button>
                  <h4>Confirm reservation</h4>
                  <ReservationForm form={room.form} handleSubmit={handleSubmit}></ReservationForm>
                </>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

const container = document.getElementById("reserve-space");
const root = createRoot(container);
root.render(<ReserveSpace />);
