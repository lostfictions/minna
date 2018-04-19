import React from "react";
import { render } from "react-dom";

import { IJsonPatch } from "mobx-state-tree";
// import { configure } from "mobx";
// import {
//   observable,
//   action,
//   autorun,
//   onBecomeObserved,
//   onBecomeUnobserved,
//   IReactionDisposer
// } from "mobx";

import { onSnapshot } from "mobx-state-tree";
import io from "socket.io-client";

const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3000;

const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`, {
  transports: ["websocket"]
});

////////////////
// BEGIN WILDCARD PATCH
////////////////

// function wildcard(Emitter: any) {
//   const emit = Emitter.prototype.emit;

//   function onevent(this: any, packet: any) {
//     const args = packet.data || [];
//     if (packet.id != null) {
//       args.push(this.ack(packet.id));
//     }
//     emit.call(this, "*", packet);
//     return emit.apply(this, args);
//   }

//   return function(socket: any) {
//     if (socket.onevent !== onevent) {
//       socket.onevent = onevent;
//     }
//     return null;
//   };
// }

// const patch = wildcard(io.Manager);
// patch(socket);

// socket.on("*", (...args: any[]) => {
//   console.log("message, args: " + JSON.stringify(args));
// });

// socket.on("event", (ev: any) => {
//   console.log("event!", ev);
// });

////////////////
// END WILDCARD PATCH
////////////////

socket.on("connect", () => {
  console.log("socket connected!");
});

socket.on("disconnect", (reason: string) => {
  console.log(`Disconnected! (Reason: '${reason}')`);
});

// socket.on("patches", (patches: IJsonPatch[]) => {
//   console.log(`(1) got patches ${patches.join("\n")}, applying`);
// });

// import { assertNever } from "./util";

import { configureMethodForClient, clientListen } from "../shared/method";

configureMethodForClient(async action => {
  socket.emit("action", action);
});

import { model } from "../shared/model";

const m = model.create();

clientListen(m, cb => {
  console.log("setting up client listener...");
  socket.on("patches", (patches: IJsonPatch[]) => {
    console.log(`got patches ${JSON.stringify(patches)}, applying`);
    cb(patches);
  });
});

onSnapshot(m, snap => {
  console.log(`state is now ${JSON.stringify(snap)}`);
});

render(
  <button onClick={() => m.addOne()}>click</button>,
  document.querySelector("#root")
);
