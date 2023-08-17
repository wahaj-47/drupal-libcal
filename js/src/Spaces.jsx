import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";

import parse from "html-react-parser";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

import { motion, AnimatePresence } from "framer-motion";

import _ from "lodash";
import moment from "moment";

import useWindowDimensions from "./hooks/useWindowsDimensions";
import { libcal, origin } from "./services";

const Filters = ({ renderLocations, renderCategories }) => {
  return (
    <section id="filters">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* {renderLocations()} */}
          {renderCategories()}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const Room = ({ room, handleClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={room.id}
      className="space-room pointer"
      onClick={handleClick}
    >
      <h3>{room.name}</h3>
      {room.image ? <img src={room.image} className="preview-img"></img> : null}
      <p>{parse(room.description)}</p>
    </motion.div>
  );
};

const RoomDetails = ({ room, goBack }) => {
  if (!room) return null;

  const { width } = useWindowDimensions();
  const isSmallDevice = width <= 768;

  const calculateAvailability = () => {
    if (room.availability) {
      const difference = moment(room.availability[0].from).diff(
        moment(),
        "minute"
      );
      if (difference < 30) return "Available now";
      else return "Available " + moment(room.availability[0].from).fromNow();
    }
    return null;
  };

  const availability = useMemo(() => calculateAvailability(), [room]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={room.id}
      className="space-room space-room-detail"
    >
      {/* {isSmallDevice ? ( */}
      <button
        type="button"
        className="btn-close ms-auto d-block my-1"
        aria-label="Close"
        onClick={goBack}
      ></button>
      {/* ) : null} */}
      {room.image ? <img src={room.image} className="preview-img"></img> : null}
      <h3>{room.name}</h3>
      <h4>{availability ? availability : "Checking availability..."}</h4>
      <p>{parse(room.description)}</p>
      <a
        className="btn btn-outline-primary"
        href={`${origin}/reserve?id=${room.id}`}
      >
        Reserve this space
      </a>
    </motion.div>
  );
};

const Spaces = () => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width <= 768;
  const [store, setStore] = useState({ locations: [], categories: [] });

  const [filters, setFilters] = useState({ locations: [], categories: [] });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isViewingDetails, setViewingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let locations = await libcal.getLocationIds();
    let lids = "";
    locations.forEach((location) => {
      lids = lids + location.lid + ",";
    });
    lids = lids.slice(0, -1);

    locations = await libcal.getLocations(lids);
    let cids = "";
    locations.forEach((location) => {
      location.categories.forEach((category) => {
        cids = cids + category.cid + ",";
      });
    });
    cids = cids.slice(0, -1);

    let categories = await libcal.getCategories(cids);
    setStore({
      locations,
      categories,
    });

    const roomId = categories[0].items[0]?.id;
    const room = await libcal.getRoom(roomId);

    setSelectedRoom(room[0]);
  };

  const handleLocationSelection = (lid) => () => {
    setFilters({ ...filters, locations: [lid] });
  };

  const renderLocations = () => {
    const options = store.locations.map((location) => (
      <option value={location.lid} key={location.lid}>
        {location.name}
      </option>
    ));
    return (
      <select
        name="location"
        onChange={(e) => {
          handleLocationSelection(e.target.value);
        }}
      >
        {options}
      </select>
    );
  };

  const handleCategorySelection = (cid) => () => {
    if (cid) setFilters({ ...filters, categories: [cid] });
    else setFilters({ ...filters, categories: [] });
  };

  const renderCategories = () => {
    const render = store.categories.map((category) => (
      <div key={category.lid}>
        <input
          type="radio"
          id={category.cid}
          name="category"
          onChange={handleCategorySelection(category.cid)}
        ></input>
        <label className="label" htmlFor={category.cid}>
          {category.name}
        </label>
      </div>
    ));
    return [
      <div key="all">
        <input
          defaultChecked
          type="radio"
          id="all"
          name="category"
          onChange={handleCategorySelection(null)}
        ></input>
        <label className="label" htmlFor="all">
          Show All
        </label>
      </div>,
      ...render,
    ];
  };

  const renderItems = () => {
    let locations = store.locations;
    let categories = store.categories;
    let items = [];

    let cidsToFilterBy = filters.categories;
    let cidsAtLocation = [];

    if (_.isEmpty(filters.locations) && _.isEmpty(filters.categories)) {
      categories.forEach((category) => {
        items = items.concat(category.items);
      });
    } else {
      locations
        .filter((location) => filters.locations.includes(location.lid))
        .forEach((location) => {
          location.categories.forEach((category) => {
            cidsAtLocation.push(category.cid);
          });
        });

      cidsToFilterBy = _.union(cidsToFilterBy, cidsAtLocation);

      categories
        .filter((category) => cidsToFilterBy.includes(category.cid))
        .forEach((category) => {
          items = items.concat(category.items);
        });
    }

    const render = items.map((item) => (
      <Room
        key={item.id}
        room={item}
        handleClick={handleRoomSelection(item)}
      ></Room>
    ));

    return render;
  };

  const handleRoomSelection = (room) => async () => {
    setSelectedRoom(room);
    const roomData = await libcal.getRoom(room.id);
    setSelectedRoom({ ...roomData[0], scrollPosition: window.scrollY });
    // if (isSmallDevice) setViewingDetails(true);
    setViewingDetails(true);
    window.scrollTo(0, 500);
  };

  const handleCloseButtonClicked = () => {
    setViewingDetails(false);
    setTimeout(() => {
      window.scrollTo(0, selectedRoom.scrollPosition);
    }, 500);
  };

  return (
    <div id="space-container">
      <Filters
        renderLocations={renderLocations}
        renderCategories={renderCategories}
      ></Filters>

      {/* {isSmallDevice ? ( */}
      {!isViewingDetails ? (
        <section id="rooms" className="space-column">
          <AnimatePresence>{renderItems()}</AnimatePresence>
        </section>
      ) : (
        <section id="selected-room" className="space-column">
          <AnimatePresence>
            <RoomDetails
              room={selectedRoom}
              goBack={handleCloseButtonClicked}
            ></RoomDetails>
          </AnimatePresence>
        </section>
      )}
      {/* ) : (
        <>
          <section id="rooms" className="space-column">
            <AnimatePresence>{renderItems()}</AnimatePresence>
          </section>
          <section id="selected-room" className="space-column">
            <AnimatePresence>
              <RoomDetails room={selectedRoom}></RoomDetails>
            </AnimatePresence>
          </section>{" "}
        </>
      )} */}
    </div>
  );
};

const container = document.getElementById("spaces");
const root = createRoot(container);
root.render(<Spaces />);
