import { Server } from "http";

import express from "express";
import socket from "socket.io";

import { init, change, DocSet, Text, Connection, getChanges } from "automerge";

import { State } from "../../shared";

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

const DOC_ID = "butt";

const docSet = new DocSet<State>();
docSet.setDoc(
  DOC_ID,
  change(init(), doc => {
    doc.field1 = new Text();
    doc.field1.insertAt(0, ..."sup");

    doc.field2 = new Text();
    doc.field2.insertAt(0, ..."bro");
  })
);

// docSet.registerHandler((docId: string, doc: any) => {
//   console.log(`Doc changed: '${docId}'`);
//   console.log(Object.keys(doc));
// });

io.on("connection", socket => {
  console.log(`Client connected!`);

  const connection = new Connection(docSet, msg => {
    // console.log(`Sending message: ${JSON.stringify(msg)}`);
    socket.emit("automerge", msg);
  });

  connection.open();

  socket.on("disconnect", reason => {
    console.log(`Client disconnected! (Reason: '${reason}')`);
    connection.close();
  });

  socket.on("automerge", msg => {
    // console.log(`Receiving message: ${JSON.stringify(msg)}`);
    connection.receiveMsg(msg);
  });

  socket.emit("automerge-init", getChanges(init(), docSet.getDoc(DOC_ID)));
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
