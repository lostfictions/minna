import React from "react";
import { render } from "react-dom";

import { configure as configureMobx } from "mobx";

import io from "socket.io-client";

import * as PIXI from "pixi.js";

import App from "./components/App";
import { Store } from "./Store";
import { assertNever } from "zone-shared";

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

const app = new PIXI.Application({
  view: document.getElementById("canvas")! as HTMLCanvasElement,
  antialias: true
});
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

const colors = [0xffe263, 0xa3bcff, 0xff916e, 0x63fbff, 0xcfff65];
let colorIndex = Math.floor(Math.random() * colors.length);
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
  cursor.drawCircle(0, 0, 3);
  cursor.endFill();
  cursor.interactive = true;
  cursor.hitArea = new PIXI.Circle(0, 0, 4);

  const ticker = () => {
    cursor.visible = Date.now() < (cursor as any).time + 5000;
  };
  app.ticker.add(ticker);

  cursor.on("removed", () => {
    console.log(`removing cursor for ${clientId}`);
    app.ticker.remove(ticker);
  });

  const text = new PIXI.Text(clientId);
  cursor.addChild(text);
  text.visible = false;

  cursor.on("mouseover", () => {
    text.visible = true;
  });
  cursor.on("mouseout", () => {
    text.visible = false;
  });

  return cursor;
}

store.otherCursors.forEach(({ x, y, time }, clientId) => {
  console.log("initializing cursor for " + clientId);
  const cursor = makeCursor(clientId);
  cursors.addChild(cursor);
  cursor.x = x;
  cursor.y = y;
  (cursor as any).time = time;
});

store.otherCursors.observe(change => {
  switch (change.type) {
    case "add": {
      const cursor = makeCursor(change.name);
      cursors.addChild(cursor);
      const { x, y, time } = change.newValue;
      cursor.x = x;
      cursor.y = y;
      (cursor as any).time = time;
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
      const { x, y, time } = change.newValue;
      cursor.x = x;
      cursor.y = y;
      (cursor as any).time = time;
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
