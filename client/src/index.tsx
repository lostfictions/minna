import React from "react";
import { render } from "react-dom";

import { configure as configureMobx } from "mobx";

import io from "socket.io-client";

import App from "./components/App";
import { Store } from "./Store";

import PixiApp from "./pixi/PixiApp";
import Cursors from "./pixi/Cursors";
import Sprites from "./pixi/Sprites";

configureMobx({ enforceActions: true });
PIXI.utils.skipHello();

const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3001;

const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`, {
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

///////////
// Pixi
///////////

const app = new PixiApp(store, {
  view: document.getElementById("canvas")! as HTMLCanvasElement,
  antialias: true,
  backgroundColor: 0xcccccc
});
/* const cursors =  */ new Cursors(app);
/* const sprites = */ new Sprites(app);
