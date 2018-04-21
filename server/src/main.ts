import { Server } from "http";

import express from "express";
import { default as socket } from "socket.io";

import { getSnapshot } from "mobx-state-tree";
import { univers, ServerOptions } from "univers";
import { model } from "zone-shared";

// import path from "path";
// import level from "level";

// const DB_PATH = path.join(__dirname, "../persist/db");
// const db = level(DB_PATH);

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

let onAction!: (action: any) => void;
const m = univers(model, {
  send: async patches => {
    console.log(`sending patch: ${JSON.stringify(patches)}`);

    // simulate network latency
    // await new Promise(res => setTimeout(() => res(), 2000));

    io.emit("patches", patches);
  },
  recv: cb => {
    onAction = cb;
  }
} as ServerOptions);

import { onSnapshot as onSnap_DEBUG } from "mobx-state-tree";
onSnap_DEBUG(m, snap => {
  console.log(`state is now ${JSON.stringify(snap)}`);
});

const idsBySocket = new Map<socket.Socket, string>();

io.on("connection", s => {
  console.log(`Client connected!`);

  s.emit("init", getSnapshot(m));

  s.on("action", (action: any) => {
    console.log(`got action: ${JSON.stringify(action)}. applying`);
    onAction(action);
  });

  s.on("id", id => {
    console.log(`Client identified as '${id}'`);
    idsBySocket.set(s, id);
  });

  s.on("cursor", ([x, y]: [number, number]) => {
    // console.log(`cursor ${idsBySocket.get(s)} = [${x},${y}]`);
    s.broadcast.emit("othercursor", [idsBySocket.get(s), x, y]);
  });

  s.on("disconnect", reason => {
    console.log(
      `Client '${idsBySocket.get(s)}' disconnected! (Reason: '${reason}')`
    );
    s.removeAllListeners();
    idsBySocket.delete(s);
  });
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
