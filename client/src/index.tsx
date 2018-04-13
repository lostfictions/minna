import React from "react";
import { render } from "react-dom";

// import * as PIXI from "pixi.js";
// PIXI.utils.skipHello();

import App from "./components/App";

const root = document.getElementById("root")!;
render(<App />, root);

// const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
// const app = new PIXI.Application({ view: canvas, antialias: true });
// const stage = app.stage;

// const gfx = new PIXI.Graphics();
// gfx.width = 200;
// gfx.height = 200;
// gfx.x = 400;
// gfx.y = 400;

// function makeRect(color: number) {
//   gfx.clear();
//   gfx.beginFill(color);
//   gfx.drawRect(10, 10, 100, 100);
//   gfx.endFill();
// }

// makeRect(0xff0000);
// stage.addChild(gfx);

// const rotSpeed = 0.01;

// app.ticker.add(dt => {
//   gfx.rotation = gfx.rotation + dt * rotSpeed;
// });
