/* eslint no-undef:2, no-unused-vars:2 */

const path = require("path");

const express = require("express");

const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const hotMiddleware = require("webpack-hot-middleware");

const PORT = 3000;

const app = express();

const config = require("./webpack.config.dev");
const compiler = webpack(config);

app.use(express.static(path.resolve(__dirname, "./static")));

app.use(hotMiddleware(compiler));
app.use(devMiddleware(compiler, { noInfo: true }));

app.listen(PORT);

console.log(`Listening on port ${PORT}`);
