import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom"

import parse from "html-react-parser";
import queryString from "query-string";

import Calendar from "@components/Calendar/Calendar";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";

import Day from "./components/Day";
import Slot from './components/Slot'
import ReservationForm from "./components/ReservationForm";

import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast'

import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

import { xor } from "lodash";
import { useCategory, useForm, useLocations, useReserve, useSpace } from "../../hooks/libcal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const origin = window.location.origin;
const sid = queryString.parse(location.search).id;
const cid = queryString.parse(location.search).categoryId;
const lid = queryString.parse(location.search).locationId;

const from = dayjs().format('YYYY-MM-DD');
const to = dayjs().add(31, 'days').format('YYYY-MM-DD');

const ReserveSpace = () => {

  const { data: locations = [], pending: lPending } = useLocations();
  const location = locations.find(location => location.lid === Number(lid));
  const { data: category } = useCategory(cid);
  const { data: space } = useSpace(sid, `${from},${to}`);
  const fid = room && "formid" in room ? room.formid : category && "formid" in category ? category.formid : location && "formid" in location ? location.formid : 0;
  const { data: form } = useForm(fid);

  const { description: lDescription = "", termsAndConditions: lTermsAndConditions = "" } = location ?? {};
  const { description: cDescription = "", termsAndConditions: cTermsAndConditions = "" } = category ?? {};

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [hasSelectedSlots, setHasSelectedSlots] = useState(false);

  const { mutateAsync: reserve, isSuccess } = useReserve();

  useEffect(() => { if (isSuccess) resetState() }, [isSuccess])

  const room = useMemo(() => {
    if (!space) return null;

    return {
      ...space,
      availability: space.availability ?
        space.availability.map((slot) => {
          const from = dayjs(slot.from)
          const to = dayjs(slot.to)

          const display = to.diff(from, "hours") > 4 ? "Library operating hours" : `${from.format("hh:mmA")} — ${to.format("hh:mmA")}`;

          return ({
            id: slot.from,
            display: display,
            from: dayjs(slot.from),
            to: dayjs(slot.to),
          })
        }) :
        []
    }
  }, [space])

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
    setSelectedSlots(xor(selectedSlots, [slotId]));
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
      reserve(payload),
      {
        loading: 'Just a second...',
        success: `Space reserved.\n A confirmation email has been sent to ${data.email}`,
        error: "Uh-oh! Something went wrong"
      })
  };

  const breadContainer = document.getElementsByClassName('breadContainer')[0]
  const crumbs = useMemo(() => {
    const crumbs = [
      { label: "Study Spaces", link: origin + "/spaces" },
    ]

    if (category) crumbs.push({ label: category.name, link: origin + "/spaces/booking?category=" + cid })
    if (room) crumbs.push({ label: room.name.split(" ").slice(-1)[0], link: window.location.href })

    return crumbs;
  }, [room])

  const slots = useMemo(() => {
    const sorted = selectedSlots
      .map((from) => dayjs(from))
      .sort((a, b) => a.diff(b))

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const next = dayjs(last).add(60, "minutes");
    const max = dayjs(first).add(180, "minutes");

    const data = room?.availability.filter((slot) =>
      slot.from.isSame(selectedDate, "day")
    ) ?? [];

    if (data.length === 1) {
      data[0].valid = true;
      return data;
    }

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
              dates={{ start: dayjs(), end: dayjs().add(3, 'months') }}
              enabled={
                {
                  start: "availability" in room && room.availability.length > 0 ? room.availability[0].from : null,
                  end: "availability" in room && room.availability.length > 0 ? room.availability[room.availability.length - 1].to : null
                }
              }
            >
            </Calendar>
          </motion.div>
        </AnimatePresence>
        <div class="column blurredElement">
          <div className="box">
            <div class="room-box">
              <div class="room-header d-flex">
                <div class="room-image">
                  {room.image ? <a href={room.image} data-lightbox="room-image"><img src={room.image} className="preview-img"></img></a> : null}
                </div>
                <div class="room-label">
                  <h3>{room.name}</h3>
                  <div class="room-date"><span class="selected-label">Selected date</span><span class="selected-date">{selectedDate.format("dddd, MMMM D YYYY")}</span></div>
                </div>
              </div>
              <div class="room-details">
                {room.description && parse(room.description)}
                {cDescription && parse(cDescription)}
                {lDescription && parse(lDescription)}
                {room.termsAndConditions && parse(room.termsAndConditions)}
                {cTermsAndConditions && parse(cTermsAndConditions)}
                {lTermsAndConditions && parse(lTermsAndConditions)}
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
                  <span class="slot-prompt">Select up to {Math.min(slots.length, 6)} slots</span>
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
                  <ReservationForm form={form} handleSubmit={handleSubmit}></ReservationForm>
                </>
              }
            </AnimatePresence>
          </div>
        </div>
      </div >
    </>
  );
};

const queryClient = new QueryClient()
const container = document.getElementById("reserve-space");
const root = createRoot(container);
root.render(<QueryClientProvider client={queryClient}><ReserveSpace /></QueryClientProvider>);
