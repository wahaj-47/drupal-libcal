const path = require("path");
const isDevMode = process.env.NODE_ENV !== "production";

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
  entry: {
    events: ["./js/src/Events/EventsCalendar.jsx", "./scss/events.scss"],
    spaces: ["./js/src/Spaces.jsx", "./scss/spaces.scss"],
    reserve: ["./js/src/ReserveSpace.jsx", "./scss/reserve-spaces.scss"],
  },
  devtool: isDevMode ? "source-map" : false,
  mode: isDevMode ? "development" : "production",
  output: {
    path: isDevMode
      ? path.resolve(__dirname, "dist_dev")
      : path.resolve(__dirname, "dist"),
    filename: "[name].min.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        include: path.join(__dirname, "js/src"),
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};

module.exports = config;
