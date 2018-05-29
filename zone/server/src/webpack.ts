import { Application } from "express";

import webpack from "webpack";
import devMiddleware from "webpack-dev-middleware";
import hotClient from "webpack-hot-client";

export function addWebpack(app: Application) {
  console.log("Adding webpack middleware for serving client code...");

  const config = require("../../client/webpack.config");
  const compiler = webpack(config({ development: true }));

  hotClient(compiler);

  app.use(devMiddleware(compiler, { noInfo: true }));
}
