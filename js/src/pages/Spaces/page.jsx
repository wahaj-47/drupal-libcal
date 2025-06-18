import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom"

import { motion, AnimatePresence } from "framer-motion";

import _ from "lodash";
import moment from "moment";
import queryString from "query-string";

import { libcal } from "@services";

import Breadcrumb from "@components/Breadcrumb/Breadcrumb";

import RoomSkeleton from "./components/RoomSkeleton";
import Room from "./components/Room";
import Dropdown from "../../components/Input/Dropdown";

const skeletons = Array.from({ length: 6 }, (_, index) => <RoomSkeleton key={index} />)

const Spaces = () => {
  const [store, setStore] = useState({ locations: [], categories: [], zones: [], items: [], });
  const [filters, setFilters] = useState({ location: "", category: "", zone: "", availability: "" });

  useEffect(() => {
    fetchData();

    const categoryId = queryString.parse(location.search).category;

    if (categoryId)
      setFilters({ ...filters, category: categoryId })
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

    let zones = (await Promise.all(zonesPromised)).flat();

    let categoriesAtLocation = await libcal.getCategories(lids);
    let categories = []
    categoriesAtLocation.forEach(location => {
      categories = categories.concat(location.categories)
    });

    let itemsPromised = []
    locations.forEach((location) => {
      itemsPromised.push(libcal.getItems(location.lid))
    })

    let itemsAtLocation = (await Promise.all(itemsPromised))
    const footers = await libcal.getFooters();
    let items = []
    itemsAtLocation.forEach((location, index) => {
      location.forEach(item => {
        items.push({ ...item, globalFooter: footers['global'], footer: footers[item.id], lid: Number(locations[index].lid) })
      })
    })

    items = items.map(item => {
      if (!item.hasOwnProperty("availability") || item.availability.length < 1)
        return { ...item, availability: "unavailable" }

      const difference = moment(item.availability[0].from).diff(
        moment(),
        "minute"
      );

      return { ...item, availability: difference < 30 ? "now" : "soon", availableIn: moment(item.availability[0].from).fromNow() };
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
  };

  const handleFilterChange = (filter) => (value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filter]: value }));
  }

  const filteredItems = useMemo(() => {
    const { items } = store;
    return items.filter(item => {
      if (filters.location && item.lid !== Number(filters.location)) return false;
      if (filters.category && item.groupId !== Number(filters.category)) return false;
      if (filters.zone && item.zoneId !== Number(filters.zone)) return false;
      if (filters.availability && item.availability !== filters.availability) return false;
      return true;
    })
  }, [store.items, filters.location, filters.category, filters.zone, filters.availability])

  const breadContainer = document.getElementsByClassName('breadContainer')[0]
  const crumbs = useMemo(() => {
    const title = "Study Spaces";
    const root = window.location.origin + "/spaces"

    const category = store.categories.find(category => category.cid === Number(filters.category))?.name
    const href = window.location.origin + window.location.pathname + "?category=" + filters.category

    return [
      { label: title, link: root },
      { label: category, link: href }
    ]
  }, [store.categories, filters.category])

  return (
    <section id="space-container">
      {createPortal(<Breadcrumb crumbs={crumbs}></Breadcrumb>, breadContainer)}

      <div id="filters">
        <AnimatePresence>
          <motion.div class="selectContainer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dropdown
              id='filter-category'
              label="Category"
              required={false}
              value={filters.category}
              onChange={handleFilterChange('category')}
              className="w-100"
            >
              <option value="">All categories</option>
              {store.categories.map((category) => (
                <option
                  key={category.cid}
                  value={category.cid}
                >
                  {category.name}
                </option>
              ))}
            </Dropdown>
            <Dropdown
              id='filter-zone'
              label="Zone"
              required={false}
              value={filters.zone}
              onChange={handleFilterChange('zone')}
              className="w-100"
            >
              <option value="">All Zones</option>
              {store.zones.map((zone) => (
                <option
                  key={zone.id}
                  value={zone.id}
                >
                  {zone.name}
                </option>
              ))}
            </Dropdown>
            <Dropdown
              id='filter-availability'
              label="Availability"
              required={false}
              value={filters.availability}
              onChange={handleFilterChange('availability')}
              className="w-100"
            >
              <option value="">Any</option>
              <option value="now">Available Now</option>
              <option value="soon">Available Soon</option>
            </Dropdown>
          </motion.div>
        </AnimatePresence>
      </div>

      <div id="rooms" className="space-column">
        <AnimatePresence>
          {
            _.isEmpty(store.items) ?
              skeletons :
              filteredItems.map(item => (<Room key={item.id} room={item}></Room>))
          }
        </AnimatePresence>
      </div>
    </section>
  );
};

const container = document.getElementById("spaces");
const root = createRoot(container);
root.render(<Spaces />);
