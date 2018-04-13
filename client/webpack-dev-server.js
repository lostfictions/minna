const express = require("express");
const webpack = require("webpack");
const path = require("path");
const devMiddleware = require("webpack-dev-middleware");
const hotMiddleware = require("webpack-hot-middleware");

const PORT = 3000;

const config = require("./webpack.config.dev");
const compiler = webpack(config);

function addToApp(app) {
  app.use(express.static(path.resolve(__dirname, "./static")));

  // @ts-ignore
  app.use(hotMiddleware(compiler));
  // @ts-ignore
  app.use(
    devMiddleware(compiler, {
      noInfo: true
    })
  );

  return app;
}

// if we're called directly rather than required...
if (require.main === module) {
  console.log(`Starting server from ${__filename}...`);
  const app = express();

  addToApp(app);

  app.listen(PORT);
  console.log(`Listening on port ${PORT}`);
}

module.exports = {
  addToApp
};
