/* eslint no-undef:2, no-unused-vars:1 */
// @ts-check
const path = require("path");
const webpack = require("webpack");

module.exports = function(/** @type {{[key: string]: any}} */ env) {
  let config = {
    mode: "development",
    target: "web",
    devtool: "cheap-module-eval-source-map",
    entry: [path.resolve(__dirname, "./src/index.tsx")],
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "../build/server/static")
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
      rules: [
        // {
        //   test: /\.(j|t)sx?$/,
        //   use: "source-map-loader",
        //   enforce: "pre"
        // },
        { test: /\.(j|t)sx?$/, loader: "ts-loader", exclude: /node_modules/ }
      ]
    }
  };

  if (env.production) {
    config = {
      ...config,
      mode: "production",
      devtool: "source-map",
      plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify("production")
        })
      ]
    };
  } else {
    // Add fork-checker plugin.
    const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

    config = {
      ...config,
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          tsconfig: path.resolve(__dirname, "./tsconfig.json")
        }),
        ...config.plugins
      ]
    };

    // Set ts-loader to transpile-only mode
    const tsLoaderConfig = config.module.rules.find(
      r => r.loader === "ts-loader"
    );
    if (!tsLoaderConfig.options) tsLoaderConfig.options = {};
    tsLoaderConfig.options.transpileOnly = true;
  }

  return config;
};
