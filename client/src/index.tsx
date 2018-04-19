import React from "react";
import { render } from "react-dom";

import { IJsonPatch } from "mobx-state-tree";
import { configure as configureMobx } from "mobx";

import { onSnapshot } from "mobx-state-tree";
import io from "socket.io-client";

import { configureMethodForClient, clientListen } from "univers";
import { model } from "zone-shared";

configureMobx({ enforceActions: true });

const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3000;

const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`, {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("socket connected!");
});

socket.on("disconnect", (reason: string) => {
  console.log(`Disconnected! (Reason: '${reason}')`);
});

configureMethodForClient(async action => {
  socket.emit("action", action);
});

const m = model.create();

clientListen(m, onPatches => {
  console.log("setting up client listener...");
  socket.on("patches", (patches: IJsonPatch[]) => {
    console.log(`got patches ${JSON.stringify(patches)}, applying`);
    onPatches(patches);
  });
});

onSnapshot(m, snap => {
  console.log(`state is now ${JSON.stringify(snap)}`);
});

render(
  <button onClick={() => m.addOne()}>click</button>,
  document.querySelector("#root")
);
