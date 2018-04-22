const path = require("path");

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
      "process.env.MINNA_ENV": JSON.stringify("browser")
    })
  ],
  module: {
    noParse: /\.min\.js/,
    rules: [
      {
        test: /\.tsx?$/,
        loaders: ["ts-loader"]
      }
    ]
  }
};
