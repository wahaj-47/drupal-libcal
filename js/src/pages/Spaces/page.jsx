import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom"

import { motion, AnimatePresence } from "framer-motion";

import { isEmpty } from "lodash";
import queryString from "query-string";

import Breadcrumb from "@components/Breadcrumb/Breadcrumb";

import RoomSkeleton from "./components/RoomSkeleton";
import Room from "./components/Room";
import Dropdown from "../../components/Input/Dropdown";
import { useCategories, useItems, useLocations, useZones } from "../../hooks/libcal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const skeletons = Array.from({ length: 6 }, (_, index) => <RoomSkeleton key={index} />)

const Spaces = () => {
  const { data: locations = [] } = useLocations();
  const lids = locations.map(l => l.lid)
  const { data: categories, pending: cPending } = useCategories(lids);
  const { data: zones, pending: zPending } = useZones(lids);
  const { data: items, pending: iPending } = useItems(lids);

  const [filters, setFilters] = useState({ location: "", category: "", zone: "", availability: "" });

  useEffect(() => {
    const categoryId = queryString.parse(location.search).category;

    if (categoryId)
      setFilters({ ...filters, category: categoryId })
  }, []);

  const handleFilterChange = (filter) => (value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filter]: value }));
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.location && item.lid !== Number(filters.location)) return false;
      if (filters.category && item.groupId !== Number(filters.category)) return false;
      if (filters.zone && item.zoneId !== Number(filters.zone)) return false;
      if (filters.availability && item.availability !== filters.availability) return false;
      return true;
    }).sort((a, b) => {
      // Group Id is category Id. No idea why they use different terms 
      const indexA = categories.findIndex(category => category?.cid === a.groupId)
      const indexB = categories.findIndex(category => category?.cid === b.groupId)

      return indexA - indexB;
    })
  }, [items, filters.location, filters.category, filters.zone, filters.availability])

  const breadContainer = document.getElementsByClassName('breadContainer')[0]
  const crumbs = useMemo(() => {
    const crumbs = [
      {
        label: "Study Spaces",
        link: window.location.origin + "/spaces"
      }
    ];

    const category = categories.find(category => category?.cid === Number(filters.category))?.name
    const href = window.location.origin + window.location.pathname + "?category=" + filters.category

    if (category) crumbs.push({ label: category, link: href })

    return crumbs
  }, [categories, filters.category])

  return (
    <section id="space-container">
      {createPortal(<Breadcrumb crumbs={crumbs}></Breadcrumb>, breadContainer)}

      <div id="filters">
        <AnimatePresence>
          {isEmpty(categories) || cPending || isEmpty(zones) || zPending ? [] :
            <motion.div className="select-container"
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
                <option value="">All room types</option>
                {categories.map((category) => (
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
                {zones.map((zone) => (
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
          }
        </AnimatePresence>
      </div>

      <div id="rooms">
        <AnimatePresence>
          {
            isEmpty(items) || iPending ?
              skeletons :
              filteredItems.map(item => (
                <Room
                  key={item.id}
                  location={locations.find(l => l?.lid === item.lid)}
                  category={categories.find(c => c?.cid === item.groupId)}
                  room={item}>
                </Room>
              ))
          }
        </AnimatePresence>
      </div>
    </section>
  );
};

const queryClient = new QueryClient()
const container = document.getElementById("spaces");
const root = createRoot(container);
root.render(<QueryClientProvider client={queryClient}><Spaces /></QueryClientProvider>);
