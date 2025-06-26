const path = require("path");
const isDevMode = false;

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
  mode: isDevMode ? "development" : "production",
  devtool: isDevMode ? "source-map" : false,
  entry: {
    "libcal-spaces": [
      "./js/src/pages/Spaces/page.jsx",
      "./scss/libcal-spaces.scss"
    ],
    "libcal-reserve": [
      "./js/src/pages/ReserveSpace/page.jsx",
      "./js/src/components/Calendar/Calendar.jsx",
      "./scss/libcal-reserve-spaces.scss",
      "./scss/calendar.scss",
      "./scss/day.scss"
    ],
  },
  output: {
    path: isDevMode
      ? path.resolve(__dirname, "dist_dev")
      : path.resolve(__dirname, "dist"),
    filename: "[name].min.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "js/src"),
      "@components": path.resolve(__dirname, "js/src/components"),
      "@utils": path.resolve(__dirname, "js/src/utils"),
      "@services": path.resolve(__dirname, "js/src/services"),
    },
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
              api: "modern"
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ],
};

module.exports = config;
