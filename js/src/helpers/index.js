import moment from "moment";
import _ from "lodash";
import axios from "axios";

function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function generateDates(today = moment(), count = 3, flatten = false) {
  let start = today.startOf('month');

  // let number = count - (count % 7);

  // while (start.format("dd") !== "Su") {
  //   start.subtract(1, "day");
  // }

  let dates = [];
  for (let month = 1; month <= count; month += 1) {

    let padStartCount = start.day();

    for (let padding = 1; padding <= padStartCount; padding += 1) {
      dates.push(null);
    }

    let daysInMonth = start.daysInMonth();
    for (let day = 1; day <= daysInMonth; day += 1) {
      dates.push(start);
      start = moment(start).add(1, "days");
    }

    let padEndCount = 6 - moment(start).subtract(1, 'day').day();

    for (let padding = 1; padding <= padEndCount; padding += 1) {
      dates.push(null);
    }
  }

  if (flatten) {
    dates = _.flatten(
      _.chunk(_.chunk(dates, 7), 5).map((chunk) => _.flatten(_.zip(...chunk)))
    );
  }

  return dates;
}

async function get(url) {
  try {
    const response = await axios.get(url);
    if (response.data.hasOwnProperty("message"))
      return response.data.message;
    return response.data
  } catch (error) {
    throw error
  }
}

async function post(url, payload, config) {
  try {
    const response = await axios.post(url, payload, config);
    return response
  } catch (error) {
    throw error
  }
}

export { getRandomColor, getWindowDimensions, generateDates, get, post };
