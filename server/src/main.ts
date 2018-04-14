import path from "path";
import { Server } from "http";

import express from "express";
import { default as socket, Socket } from "socket.io";
import level from "level";

import {
  init,
  change,
  save,
  load,
  DocSet,
  Text,
  Connection,
  Doc
} from "automerge";

import { State } from "../../defs/shared";

const DB_PATH = path.join(__dirname, "../persist/db");
const db = level(DB_PATH);

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

const DOC_ID = "butt";

const docSet = new DocSet<State>();

(async () => {
  let doc: Doc<State>;
  try {
    const file = (await db.get(DOC_ID)) as any;
    doc = load(file);
    console.log("Loaded state from DB.");
  } catch (e) {
    console.error(e);
    console.log(`Probably can't open DB. Using defaults.`);
    doc = change(init(), doc => {
      doc.field1 = new Text();
      doc.field1.insertAt(0, ..."sup");

      doc.field2 = new Text();
      doc.field2.insertAt(0, ..."bro");
    });
  }

  docSet.setDoc(DOC_ID, doc);

  docSet.registerHandler(async (_docId: string, doc: Doc<State>) => {
    await db.put(DOC_ID, save(doc));
  });
})();

const clients = new Set<Socket>();

io.on("connection", socket => {
  clients.add(socket);

  console.log(`Client connected!`);

  let clientId: string;
  socket.on("id", (id: string) => {
    console.log(`Client identified as '${id}'`);
    clientId = id;
  });

  socket.on("cursor", ([x, y]: [number, number]) => {
    clients.forEach(s => {
      if (s !== socket) {
        s.emit("othercursor", [clientId, x, y]);
      }
    });
  });

  const connection = new Connection(docSet, msg => {
    // console.log(`Sending message: ${JSON.stringify(msg)}`);
    socket.emit("automerge", msg);
  });

  connection.open();

  socket.on("disconnect", reason => {
    console.log(`Client '${clientId}' disconnected! (Reason: '${reason}')`);
    connection.close();
    clients.delete(socket);
  });

  socket.on("automerge", msg => {
    // console.log(`Receiving message: ${JSON.stringify(msg)}`);
    connection.receiveMsg(msg);
  });
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
