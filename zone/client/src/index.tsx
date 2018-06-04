import React from "react";
import { render } from "react-dom";

import { configure as configureMobx } from "mobx";

import io from "socket.io-client";

import App from "./components/App";
import { Store } from "./Store";

configureMobx({ enforceActions: true });

const host = window.location.toString();

const socket = io.connect(
  host,
  {
    transports: ["websocket"]
  }
);

socket.on("connect", () => {
  console.log("socket connected!");
});

socket.on("disconnect", (reason: string) => {
  console.log(`Disconnected! (Reason: '${reason}')`);
});

const store = new Store(socket);

render(<App store={store} />, document.querySelector("#root"));
