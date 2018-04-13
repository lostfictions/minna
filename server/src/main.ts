import { Server } from "http";

import express from "express";
import socket from "socket.io";

import * as automerge from "automerge";
// import * as Immutable from "immutable";

const PORT = 3001;

const app = express();
const server = new Server(app);
const io = socket(server);

const DOC_ID = "butt";

const docSet = new automerge.DocSet();
docSet.setDoc(
  DOC_ID,
  automerge.change(automerge.init(), (doc: any) => {
    doc.field1 = new automerge.Text();
    doc.field1.insertAt(0, ..."sup");

    doc.field2 = new automerge.Text();
    doc.field2.insertAt(0, ..."bro");
  })
);

// docSet.registerHandler((docId: string, doc: any) => {
//   console.log(`Doc changed: '${docId}'`);
//   console.log(Object.keys(doc));
// });

io.on("connection", socket => {
  console.log(`Client connected!`);

  const connection = new automerge.Connection(docSet, (msg: any) => {
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

  socket.emit(
    "automerge-init",
    automerge.getChanges(automerge.init(), docSet.getDoc(DOC_ID))
  );
});

server.listen(PORT);

console.log(`Listening on port ${PORT}`);
