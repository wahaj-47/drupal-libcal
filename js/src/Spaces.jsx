import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";

import parse from "html-react-parser";

import { motion, AnimatePresence } from "framer-motion";

import _, { forIn } from "lodash";
import moment from "moment";

import { libcal, origin } from "./services";

import queryString from "query-string";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";

const Filters = ({ filters }) => {
  return (
    <section id="filters">
      <AnimatePresence>
        <motion.div class="selectContainer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {filters.map(filter => filter())}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const Room = ({ room, handleClick }) => {
  return (
    <div
      key={room.id}
      class="space-room">
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        href={`${origin}/spaces/booking/reserve?id=${room.id}&category=${room.groupName}&categoryId=${room.groupId}&buildingId=${room.convertedLid}`}>
        <div class="roomHeader pointer">
          <div class="roomImage">
            {room.image ? <img src={room.image} className="preview-img"></img> : null}
          </div>
          <div class="roomLabel">
            <h3>{room.name}</h3>
            <span class="roomZone">{room.zoneName}</span>
            {room.hasOwnProperty("availability") ? <span className={room.availability === "Available Now" ? "available" : ""}>{room.availability}</span> : <span>Checking availability...</span>}
          </div>
        </div>
      </motion.a>
      <div class="roomDetails">
        <p>{parse(room.description)}</p>
        <div class="roomFooter">
          {/* insert room directions here */}
        </div>
      </div>
    </div>
  );
};

const RoomSkeleton = (key) => {
  return (
    <div
      key={key}
      class="space-room">
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div class="roomHeader pointer">
          <div class="roomImage">
            <div class="roomImageSkeleton"></div>
          </div>
          <div class="roomLabel">
            <h3>
              <div class="roomNameSkeleton"></div>
            </h3>
            <span class="roomZone">
              <div class="roomZoneSkeleton"></div>
            </span>
            <span className="available">
            </span>
          </div>
        </div>
      </motion.a>
      <div class="roomDetails">
        <p>
          <div class="roomDetailsSkeleton"></div>
        </p>
        <div class="roomFooter">
          <div class="roomFooterSkeleton"></div>
          <div class="roomFooterSkeleton"></div>
          <div class="roomFooterSkeleton"></div>
        </div>
      </div>
    </div>
  )
}

// const RoomDetails = ({ room, goBack }) => {
//   if (!room) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       key={room.id}
//       className="space-room space-room-detail"
//     >
//       {/* {isSmallDevice ? ( */}
//       <button
//         type="button"
//         className="btn-close ms-auto d-block my-1"
//         aria-label="Close"
//         onClick={goBack}
//       ></button>
//       {/* ) : null} */}
//       {room.image ? <img src={room.image} className="preview-img"></img> : null}
//       <h3>{room.name}</h3>
//       {room.hasOwnProperty("availability") ? <span className={room.availability === "Available Now" ? "available" : ""}>{room.availability}</span> : <span>Checking availability...</span>}
//       <p>{parse(room.description)}</p>
//       <a
//         className="btn btn-outline-primary"
//         href={`${origin}/reserve?id=${room.id}`}
//       >
//         Reserve this space
//       </a>
//     </motion.div>
//   );
// };

const Spaces = () => {
  const [store, setStore] = useState({ locations: [], categories: [{ cid: "", name: "All room types" }], zones: [{ id: "", name: "All zones" }], items: [], });

  const [filters, setFilters] = useState({ locations: [], categories: [""], zones: [""], availability: [""] });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isViewingDetails, setViewingDetails] = useState(false);

  useEffect(() => {
    fetchData();

    const categoryId = queryString.parse(location.search).category;

    if (categoryId)
      setFilters({ ...filters, categories: [Number(categoryId)] })
  }, []);

  const fetchData = async () => {
    let locations = await libcal.getLocationIds();
    let zonesPromised = []

    let lids = "";

    locations.forEach((location) => {
      lids = lids + location.lid + ",";
      zonesPromised.push(libcal.getZones(location.lid));
    });

    lids = lids.slice(0, -1);
    let convertedLids = await libcal.getConvertedLocationIDs(lids)
    convertedLids = convertedLids.split(",")

    let zones = [{ id: "", name: "All zones" }].concat((await Promise.all(zonesPromised)).flat());

    // locations = await libcal.getLocations(lids);
    // let cids = "";
    // locations.forEach((location) => {
    //   location.categories.forEach((category) => {
    //     cids = cids + category.cid + ",";
    //   });
    // });
    // cids = cids.slice(0, -1);

    let categoriesAtLocation = await libcal.getCategories(lids);
    let categories = [{ cid: "", name: "All room types" }]
    categoriesAtLocation.forEach(location => {
      categories = categories.concat(location.categories)
    });

    let itemsPromised = []
    locations.forEach((location) => {
      itemsPromised.push(libcal.getItems(location.lid))
    })

    let itemsAtLocation = (await Promise.all(itemsPromised))
    let items = []
    itemsAtLocation.forEach((location, index) => {
      location.forEach(item => {
        items.push({ ...item, lid: Number(locations[index].lid), convertedLid: Number(convertedLids[index]) })
      })
    })

    items = items.map(item => {
      if (!item.hasOwnProperty("availability") || item.availability.length < 1)
        return { ...item, availability: "Unavailable" }

      const difference = moment(item.availability[0].from).diff(
        moment(),
        "minute"
      );

      return { ...item, availability: difference < 30 ? "Available Now" : "Available " + moment(item.availability[0].from).fromNow() };
    }).sort((a, b) => {
      // Group Id is category Id. No idea why they use different terms 
      const indexA = categories.findIndex(category => category.cid === a.groupId)
      const indexB = categories.findIndex(category => category.cid === b.groupId)

      return indexA - indexB;
    })

    setStore({
      locations,
      categories,
      zones,
      items
    });

    // const availabilitiesPromised = [];

    // categories.forEach((category) => {
    //   const itemsPromised = [];
    //   category.items.forEach((item) => {
    //     itemsPromised.push(libcal.getRoom(item.id));
    //   });
    //   availabilitiesPromised.push(Promise.all(itemsPromised));
    // });

    // const availabilities = await Promise.all(availabilitiesPromised);

    // categories.forEach((category, index) => {
    //   const spaces = availabilities[index].flat().map(item => {
    //     if (item.availability) {
    //       const difference = moment(item.availability[0].from).diff(
    //         moment(),
    //         "minute"
    //       );
    //       return { ...item, availability: difference < 30 ? "Available Now" : "Available " + moment(item.availability[0].from).fromNow() };
    //     }
    //     return { ...item, availability: "Unavailable" }
    //   })
    //   category.items = spaces
    // });

    // setStore({
    //   ...store,
    //   categories,
    // });

    // const roomId = categories[0].items[0]?.id;
    // const room = await libcal.getRoom(roomId);

    // setSelectedRoom(room[0]);
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
    // Checkbox
    // if (filters.categories.includes(cid))
    //   setFilters({ ...filters, categories: [] });
    // else setFilters({ ...filters, categories: [cid] });

    // Dropdown
    if (cid)
      setFilters({ ...filters, categories: [Number(cid)] });
    else
      setFilters({ ...filters, categories: [""] });
  };

  // Checkbox categories 
  // const renderCategoriesAsCheckboxes = () => {
  //   const render = store.categories.map((category) => (
  //     <div key={category.cid}>
  //       <input
  //         type="checkbox"
  //         id={category.cid}
  //         name="category"
  //         onChange={handleCategorySelection(category.cid)}
  //         checked={filters.categories.includes(category.cid)}
  //       ></input>
  //       <label className="label" htmlFor={category.cid}>
  //         {category.name}
  //       </label>
  //     </div>
  //   ));
  //   return render;
  // };

  // Select categories
  const filterByCategories = () => {
    const options = store.categories.map((category) => (
      <option
        key={category.cid}
        value={category.cid}
      >
        {category.name}
      </option>
    ));
    return (
      <select class="roomSelect form-select"
        value={filters.categories[0]}
        onChange={e => {
          handleCategorySelection(e.target.value)()
        }}
      >
        {/* <option value="">All room types</option> */}
        {options}
      </select>
    )
  };

  const handleZoneSelection = (id) => () => {
    // Checkbox
    // if (filters.categories.includes(cid))
    //   setFilters({ ...filters, categories: [] });
    // else setFilters({ ...filters, categories: [cid] });

    // Dropdown
    if (id)
      setFilters({ ...filters, zones: [Number(id)] });
    else
      setFilters({ ...filters, zones: [""] });
  };

  const filterByZones = () => {
    const options = store.zones.map((zone) => (
      <option
        key={zone.id}
        value={zone.id}
      >
        {zone.name}
      </option>
    ));
    return (
      <select class="roomSelect form-select"
        value={filters.zones[0]}
        onChange={e => {
          handleZoneSelection(e.target.value)()
        }}
      >
        {/* <option value="">All room types</option> */}
        {options}
      </select>
    )
  };

  const handleAvailibilitySelection = (value) => () => {
    // Checkbox
    // if (filters.categories.includes(cid))
    //   setFilters({ ...filters, categories: [] });
    // else setFilters({ ...filters, categories: [cid] });

    // Dropdown
    if (value)
      setFilters({ ...filters, availability: [value] });
    else
      setFilters({ ...filters, availability: [""] });
  };

  const filterByAvailability = () => {
    return (
      <select class="roomSelect form-select"
        value={filters.availability[0]}
        onChange={e => {
          handleAvailibilitySelection(e.target.value)()
        }}
      >
        <option value="">Availability: Any</option>
        <option value="now">Available Now</option>
        <option value="soon">Available Soon</option>
      </select>
    )
  }

  const renderSkeletons = () => {
    const render = []

    // Add six placeholder skeletons if no items.
    for (let index = 0; index < 6; index++) {
      render.push(<RoomSkeleton key={index}></RoomSkeleton>)
    }

    return render;
  }

  const renderItems = () => {
    let locations = store.locations;
    // let categories = store.categories;
    let items = store.items;

    let cidsToFilterBy = filters.categories;
    let cidsAtLocation = [];

    if (!_.isEmpty(filters.locations.filter(lid => lid)) || !_.isEmpty(filters.categories.filter(cid => cid))) {
      // categories.forEach((category) => {
      //   items = items.concat(category.items);
      // });
      // } else {
      locations
        .filter((location) => filters.locations.includes(location.lid))
        .forEach((location) => {
          location.categories.forEach((category) => {
            cidsAtLocation.push(category.cid);
          });
        });

      cidsToFilterBy = _.union(cidsToFilterBy, cidsAtLocation);
      items = store.items.filter(item => (cidsToFilterBy.includes(item.groupId)))

      // categories
      //   .filter((category) => cidsToFilterBy.includes(category.cid))
      //   .forEach((category) => {
      //     items = items.concat(category.items);
      //   });
    }

    if (!_.isEmpty(filters.zones.filter(id => id)))
      items = items.filter(item => filters.zones.filter(id => id).includes(item.zoneId))

    if (!_.isEmpty(filters.availability.filter(availability => availability))) {
      if (filters.availability[0] === "now")
        items = items.filter(item => item.availability === "Available Now")
      else
        items = items.filter(item => item.availability !== "Available Now" && item.availability !== "Unavailable")

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
    window.location = `${origin}/reserve?id=${room.id}&buildingId=${room.convertedLid}`
    // setSelectedRoom({ ...room, scrollPosition: window.scrollY });
    // //const roomData = await libcal.getRoom(room.id);
    // //setSelectedRoom({ ...roomData[0], scrollPosition: window.scrollY });
    // // if (isSmallDevice) setViewingDetails(true);
    // setViewingDetails(true);
    // window.scrollTo(0, 500);
  };

  const handleCloseButtonClicked = () => {
    setViewingDetails(false);
    setTimeout(() => {
      window.scrollTo(0, selectedRoom.scrollPosition);
    }, 500);
  };

  const generatecrumbs = () => {
    const title = "Study Spaces";
    const root = window.location.origin + "/spaces"

    const category = store.categories.find(category => category.cid === filters.categories[0])?.name
    const href = window.location.origin + window.location.pathname + "?category=" + filters.categories[0]

    return [
      { label: title, link: root },
      { label: category, link: href }
    ]
  }

  return (
    <div id="space-container">
      <div class="bookingBreadcrumb"><Breadcrumb crumbs={generatecrumbs()}></Breadcrumb></div>
      <Filters
        filters={[filterByCategories, filterByZones, filterByAvailability]}
      ></Filters>

      {/* {isSmallDevice ? ( */}
      {!isViewingDetails ? (
        <section id="rooms" className="space-column">
          <AnimatePresence>{_.isEmpty(store.items) ? renderSkeletons() : renderItems()}</AnimatePresence>
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
