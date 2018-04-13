import React from "react";
import { render } from "react-dom";
import { configure } from "mobx";

import * as PIXI from "pixi.js";

import { Store } from "./Store";
import { assertNever } from "./util";
import App from "./components/App";

configure({ enforceActions: true });
PIXI.utils.skipHello();

import io from "socket.io-client";
const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3001;
const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`);

const store = new Store(socket);

const root = document.getElementById("root")!;
render(<App store={store} />, root);

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const app = new PIXI.Application({ view: canvas, antialias: true });
const stage = app.stage;
stage.interactive = true;

stage.on("mousemove", (ev: PIXI.interaction.InteractionEvent) => {
  const { x, y } = ev.data.global;
  store.setCursor(x, y);
});

app.renderer.backgroundColor = 0xcccccc;

const gfx = new PIXI.Graphics();
gfx.width = 0;
gfx.height = 0;
gfx.x = 200;
gfx.y = 200;

function makeRect(color: number) {
  gfx.clear();
  gfx.beginFill(color);
  gfx.drawRect(-50, -50, 100, 100);
  gfx.endFill();
}

makeRect(0xff0000);
stage.addChild(gfx);

//////////
// cursors
//////////

const colors = [0xff0000, 0x00ff00, 0x0000ff];
let colorIndex = 0;
const idToColor = new Map<string, number>();

const cursors = new PIXI.Container();
stage.addChild(cursors);

function makeCursor(clientId: string): PIXI.Container {
  let color = idToColor.get(clientId);
  if (!color) {
    color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    idToColor.set(clientId, color);
  }

  const cursor = new PIXI.Graphics();
  cursor.name = clientId;
  cursor.beginFill(color);
  cursor.drawCircle(0, 0, 2);
  cursor.endFill();

  return cursor;
}

store.otherCursors.forEach(([x, y], clientId) => {
  console.log("initializing cursor for " + clientId);
  const cursor = makeCursor(clientId);
  cursors.addChild(cursor);
  cursor.x = x;
  cursor.y = y;
});
store.otherCursors.observe(change => {
  switch (change.type) {
    case "add": {
      const cursor = makeCursor(change.name);
      cursors.addChild(cursor);
      const [x, y] = change.newValue;
      cursor.x = x;
      cursor.y = y;
      break;
    }
    case "update": {
      const cursor = cursors.getChildByName(change.name);
      if (!cursor) {
        console.log(change.name);
        console.log("not found");
        console.log("children: ", cursors.children.length);
        console.log(cursors.children.map(c => c.name).join(", "));
      }
      const [x, y] = change.newValue;
      cursor.x = x;
      cursor.y = y;
      break;
    }
    case "delete": {
      const cursor = cursors.getChildByName(change.name);
      cursor.destroy();
      break;
    }
    default:
      assertNever(change);
  }
});

//////////
// end cursors
//////////

const rotSpeed = 0.01;

app.ticker.add(dt => {
  gfx.rotation = gfx.rotation + dt * rotSpeed;
});

function resizeRenderer() {
  const { innerWidth: w, innerHeight: h } = window;

  const canvas = app.view;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  app.renderer.resize(w, h);
}

resizeRenderer();

window.addEventListener("resize", resizeRenderer);
