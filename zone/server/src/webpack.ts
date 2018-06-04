import { Application } from "express";

import webpack from "webpack";
import devMiddleware from "webpack-dev-middleware";
import hotMiddleware from "webpack-hot-middleware";

export function addWebpack(app: Application) {
  console.log("Adding webpack middleware for serving client code...");

  const config = require("../../client/webpack.config");
  const compiler = webpack(config({ development: true }));

  app.use(devMiddleware(compiler, { noInfo: true }));
  app.use(hotMiddleware(compiler));
}
