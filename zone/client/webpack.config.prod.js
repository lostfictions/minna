/* eslint no-undef:2, no-unused-vars:1 */
// @ts-check

const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: [path.resolve(__dirname, "./src/index.tsx")],
  output: {
    filename: "bundle.js",
    path: path.resolve("./dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.MINNA_ENV": JSON.stringify("browser"),
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ],
  module: {
    rules: [
      // {
      //   test: /\.(j|t)sx?$/,
      //   use: "source-map-loader",
      //   enforce: "pre"
      // },
      {
        test: /\.tsx?$/,
        loaders: ["ts-loader"]
      }
    ]
  }
};
