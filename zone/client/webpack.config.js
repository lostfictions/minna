/* eslint no-undef:2, no-unused-vars:1 */
// @ts-check
const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

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
    resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.resolve(__dirname, "./tsconfig.json")
      }),
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
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: [
                [
                  "@babel/preset-env",
                  { targets: { browsers: "last 2 Chrome versions" } }
                ],
                "@babel/preset-typescript",
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                "react-hot-loader/babel"
              ]
            }
          }
        }
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
  }

  return config;
};
