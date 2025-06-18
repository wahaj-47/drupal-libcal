import _ from "lodash";
import { get, post } from "../utils";
import moment from "moment";

const origin = window.location.origin;

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
      return await get(`${origin}/api/libcal/space/locations?details=1`);
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
  getCategory: async (categoryId) => {
    try {
      return await get(`${origin}/api/libcal/space/category/${categoryId}`)
    } catch (error) {
      throw error
    }
  },
  getPolicies: async () => {
    try {
      return await get(`${origin}/api/libcal/statements`);
    } catch (error) {
      throw error
    }
  },
  getFooters: async () => {
    try {
      return await get(`${origin}/api/libcal/footers`);
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
  getZones: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/space/zones/${lids}`);
    } catch (error) {
      throw error
    }
  },
  getItems: async (lids) => {
    try {
      return await get(`${origin}/api/libcal/space/items/${lids}?availability=next&pageSize=100`)
    } catch (error) {
      throw error
    }
  },
  getSpace: async (spaceId, availability = 'next') => {
    try {
      return await get(
        `${origin}/api/libcal/space/item/${spaceId}?availability=${availability}`
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
      return await get(`${origin}/api/libcal/space/item/${spaceId}?availability=${moment()
        .format("YYYY-MM-DD")},${moment()
          .add(31, "days")
          .format("YYYY-MM-DD")}`)
    } catch (error) {
      throw error
    }
  },
  getForm: async (spaceId) => {
    try {
      return await get(`${origin}/api/libcal/space/form/${spaceId}`)
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

export { libcal };
