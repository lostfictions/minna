import React from "react";
import { render } from "react-dom";

import { configure as configureMobx } from "mobx";

import io from "socket.io-client";

import App from "./components/App";
import { Store } from "./Store";

configureMobx({ enforceActions: true });

let host: string;
if (process.env.NODE_ENV === "production") {
  host = window.location.toString();
} else {
  const PROTOCOL = "http";
  const HOSTNAME = "localhost";
  const PORT = process.env.PORT || 3000;
  host = `${PROTOCOL}://${HOSTNAME}:${PORT}`;
}

const socket = io.connect(host, {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("socket connected!");
});

socket.on("disconnect", (reason: string) => {
  console.log(`Disconnected! (Reason: '${reason}')`);
});

const store = new Store(socket);

render(<App store={store} />, document.querySelector("#root"));
