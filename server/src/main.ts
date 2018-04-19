// import path from "path";
import { Server } from "http";

import express from "express";
import { default as socket /* , Socket */ } from "socket.io";
// import level from "level";

// const DB_PATH = path.join(__dirname, "../persist/db");
// const db = level(DB_PATH);

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

io.on("connection", socket => {
  console.log(`Client connected!`);

  let clientId: string;
  socket.on("id", (id: string) => {
    console.log(`Client identified as '${id}'`);
    clientId = id;
  });

  // socket.on("cursor", ([x, y]: [number, number]) => {
  //   socket.broadcast.emit("othercursor", [clientId, x, y]);
  // });

  socket.on("disconnect", reason => {
    console.log(`Client '${clientId}' disconnected! (Reason: '${reason}')`);
  });
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
