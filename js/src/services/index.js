import _ from "lodash";
import { get, post } from "../helpers";
import moment from "moment";

const origin = window.location.origin;

console.log(origin);

const libcal = {
  getCalendars: async () => {
    try {
      const message = await get(`${origin}/api/libcal/calendars`);
      return message.calendars;
    } catch (error) {
      throw error
    }
  },
  getEvents: async (calId, date) => {
    try {
      const message = await get(
        `${origin}/api/libcal/events?cal_id=${calId}&date=${date}&limit=100`
      );
      return message.events;
    } catch (error) {
      throw error
    }
  },
  getLocationIds: async () => {
    try {
      return await get(`${origin}/api/libcal/space/locations`);
    } catch (error) {
      throw error
    }
  },
  getCategories: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/space/categories/${lids}?details=1`);
    } catch (error) {
      throw error
    }
  },
  getHours: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/hours/${lids}?to=${moment()
        .add(31, "days")
        .format("YYYY-MM-DD")}`);
    } catch (error) {
      throw error
    }
  },
  getConvertedLocationIDs: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/convert?lids=${lids}`);
    } catch (error) {
      throw error
    }
  },
  getZones: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/space/zones/${lids}`);
    } catch (error) {
      throw error
    }
  },
  // getCategories: async (cids) => {
  //   return await get(`${origin}/api/libcal/space/category/${cids}?details=1`);
  // },
  getItems: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/space/items/${lids}?availability=next&pageSize=100`)
    } catch (error) {
      throw error
    }
  },
  getRoom: async (roomId) => {
    try {
      return await get(
        `${origin}/api/libcal/space/item/${roomId}?availability=next`
      );
    } catch (error) {
      throw error
    }
  },
  getCsrfToken: async () => {
    try {
      return await get(
        `${origin}/session/token`
      );
    } catch (error) {
      throw error
    }
  },
  getAvailability: async (spaceId) => {
    try {
      // return await get(`${origin}/api/libcal/space/item/${spaceId}?availability=next`)
      return await get(`${origin}/api/libcal/space/item/${spaceId}?availability=${moment()
        // .subtract(1, "day")
        .format("YYYY-MM-DD")},${moment()
          .add(31, "days")
          .format("YYYY-MM-DD")}`)
    } catch (error) {
      throw error
    }
  },
  reserve: async (payload) => {
    try {
      const csrfToken = await libcal.getCsrfToken()

      const response = await post(
        `${origin}/api/libcal/space/reserve`,
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      return response;
    } catch (error) {
      throw error
    }
  }
};

export { origin, libcal };
