const path = require("path");
const { Server } = require("http");

const express = require("express");

const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
const hotMiddleware = require("webpack-hot-middleware");

const socket = require("socket.io");

const PORT = 3000;

const app = express();
const server = new Server(app);
const io = socket(server);

const config = require("./webpack.config.dev");
const compiler = webpack(config);

const { configureMethodForServer, serverListen } = require("./shared/method");

const { onSnapshot } = require("mobx-state-tree");

const { model } = require("./shared/model");

const m = model.create();

onSnapshot(m, snap => {
  console.log(`state is now ${JSON.stringify(snap)}`);
});

io.on("connection", socket => {
  console.log(`Client connected!`);

  configureMethodForServer(async patches => {
    console.log(`sending patch: ${JSON.stringify(patches)}`);

    // simulate network latency...
    await new Promise(res => setTimeout(() => res(), 2000));

    socket.emit("patches", patches);
  });

  serverListen(m, cb => {
    socket.on("action", action => {
      console.log(`got action: ${JSON.stringify(action)}. applying`);
      cb(action);
    });
  });

  // let clientId;
  // socket.on("id", id => {
  //   console.log(`Client identified as '${id}'`);
  //   clientId = id;
  // });

  // socket.on("cursor", ([x, y]: [number, number]) => {
  //   socket.broadcast.emit("othercursor", [clientId, x, y]);
  // });

  socket.on("disconnect", reason => {
    console.log(`Client '\${clientId}' disconnected! (Reason: '${reason}')`);
    socket.removeAllListeners();
  });
});

app.use(express.static(path.resolve(__dirname, "./static")));

app.use(hotMiddleware(compiler));
app.use(devMiddleware(compiler, { noInfo: true }));

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
