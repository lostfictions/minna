/* eslint no-undef:2, no-unused-vars:1 */
// @ts-check

const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  entry: [
    "webpack-hot-middleware/client?reload=true",
    path.resolve(__dirname, "./src/index.tsx")
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve("./dist")
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.resolve(__dirname, "./tsconfig.json")
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env.MINNA_ENV": JSON.stringify("browser")
    })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    noParse: /\.min\.js/,
    rules: [
      // {
      //   test: /\.(j|t)sx?$/,
      //   use: "source-map-loader",
      //   enforce: "pre"
      // },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  }
};
