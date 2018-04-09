const path = require("path");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: [path.resolve(__dirname, "./src/index.ts")],
  output: {
    filename: "bundle.js",
    path: path.resolve("./dist")
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    noParse: /\.min\.js/,
    rules: [
      {
        test: /\.ts$/,
        loaders: ["ts-loader"]
      }
    ]
  }
};
