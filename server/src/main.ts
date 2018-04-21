import { Server } from "http";

import express from "express";
import { default as socket } from "socket.io";

import { configureMethodForServer, serverListen } from "univers";
import { model } from "zone-shared";

// import path from "path";
// import level from "level";

// const DB_PATH = path.join(__dirname, "../persist/db");
// const db = level(DB_PATH);

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

const m = model.create();

import { onSnapshot as onSnap_DEBUG } from "mobx-state-tree";
onSnap_DEBUG(m, snap => {
  console.log(`state is now ${JSON.stringify(snap)}`);
});

io.on("connection", s => {
  console.log(`Client connected!`);

  configureMethodForServer(async patches => {
    console.log(`sending patch: ${JSON.stringify(patches)}`);

    // FIXME: simulate network latency...
    await new Promise(res => setTimeout(() => res(), 2000));

    s.emit("patches", patches);
  });

  serverListen(m, cb => {
    s.on("action", action => {
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

  s.on("disconnect", reason => {
    console.log(`Client '\${clientId}' disconnected! (Reason: '${reason}')`);
    s.removeAllListeners();
  });
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
