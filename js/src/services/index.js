import _ from "lodash";
import { get } from "../helpers";

const origin = window.location.origin;

const libcal = {
  getCalendars: async () => {
    const message = await get(`${origin}/api/libcal/calendars`);
    return message.calendars;
  },
  getEvents: async (calId, date) => {
    const message = await get(
      `${origin}/api/libcal/events?cal_id=${calId}&date=${date}&limit=100`
    );
    return message.events;
  },
  getLocationIds: async () => {
    return await get(`${origin}/api/libcal/space/locations`);
  },
  getLocations: async (lids) => {
    return await get(`${origin}/api/libcal/space/categories/${lids}`);
  },
  getCategories: async (cids) => {
    return await get(`${origin}/api/libcal/space/category/${cids}?details=1`);
  },
  getRoom: async (roomId) => {
    return await get(
      `${origin}/api/libcal/space/item/${roomId}?availability=next`
    );
  },
};

export { origin, libcal };
