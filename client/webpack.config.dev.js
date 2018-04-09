const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  entry: [
    "webpack-hot-middleware/client?reload=true",
    path.resolve(__dirname, "./src/index.ts")
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve("./dist")
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.resolve(__dirname, "./tsconfig.json")
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    noParse: /\.min\.js/,
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  }
};
