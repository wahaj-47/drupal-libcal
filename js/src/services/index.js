import _ from "lodash";
import { get, post } from "../helpers";

const origin = window.location.origin;

console.log(origin);

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
  getCsrfToken: async () => {
    return await get(
      `${origin}/session/token`
    );
  },
  reserve: async (payload) => {

    const csrfToken = await libcal.getCsrfToken()

    return await post(
      `${origin}/api/libcal/space/reserve`,
      payload,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      }
    );
  }
};

export { origin, libcal };
