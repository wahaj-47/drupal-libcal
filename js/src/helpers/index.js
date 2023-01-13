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

function generateDates(today = moment(), count = 70, flatten = false) {
  let start = today;
  let number = count - (count % 7);

  while (start.format("dd") !== "Su") {
    start.subtract(1, "day");
  }

  let dates = [];
  for (let i = 0; i < number; i += 1) {
    dates.push(start);
    start = moment(start).add(1, "days");
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
    return response.data.message;
  } catch (error) {
    console.log(error);
  }
}

export { getRandomColor, getWindowDimensions, generateDates, get };
