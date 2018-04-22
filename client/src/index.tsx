import React from "react";
import { render } from "react-dom";

import { configure as configureMobx } from "mobx";

import io from "socket.io-client";

import App from "./components/App";
import { Store } from "./Store";

import PixiApp from "./pixi/PixiApp";
import Cursors from "./pixi/Cursors";

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

//////////////////////////////
// PIXI
//////////////////////////////

const app = new PixiApp(store, {
  view: document.getElementById("canvas")! as HTMLCanvasElement,
  antialias: true,
  backgroundColor: 0xcccccc
});

/* const cursors =  */ new Cursors(app);

// const gfx = new PIXI.Graphics();
// gfx.width = 0;
// gfx.height = 0;
// gfx.x = 200;
// gfx.y = 200;

// function makeRect(color: number) {
//   gfx.clear();
//   gfx.beginFill(color);
//   gfx.drawRect(-50, -50, 100, 100);
//   gfx.endFill();
// }

// makeRect(0xff0000);
// stage.addChild(gfx);

// const rotSpeed = 0.01;

// app.ticker.add(dt => {
//   gfx.rotation = gfx.rotation + dt * rotSpeed;
// });
