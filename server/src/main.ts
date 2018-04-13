import { Server } from "http";

import express from "express";
import { default as socket, Socket } from "socket.io";

import { init, change, DocSet, Text, Connection } from "automerge";

import { State } from "../../defs/shared";

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
