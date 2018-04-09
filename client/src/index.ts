import * as PIXI from "pixi.js";

import Pouch from "pouchdb";

const HOSTNAME = "localhost";
const PORT = 3001;
const DB_NAME = "pix";
const REMOTE_DB = `http://${HOSTNAME}:${PORT}/db/${DB_NAME}`;

const db = new Pouch(DB_NAME);

db.sync(REMOTE_DB, { live: true, retry: true }).on("error", err => {
  console.error("PouchDB Sync Error:", err);
});

// const ren = new PIXI.WebGLRenderer();
const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
// ren.view = canvas;

const app = new PIXI.Application({ view: canvas, antialias: true });

const stage = app.stage;

// const stage = new PIXI.Container();

const gfx = new PIXI.Graphics();

gfx.width = 200;
gfx.height = 200;
gfx.x = 400;
gfx.y = 400;

gfx.beginFill(0xff0000);
gfx.drawRect(10, 10, 100, 100);
gfx.endFill();
// gfx.cacheAsBitmap = true;

stage.addChild(gfx);

const rotSpeed = 0.01;

app.ticker.add(dt => {
  gfx.rotation = gfx.rotation + dt * rotSpeed;
});

// ren.render(gfx);

// function render() {
//   // ren.render(stage);
//   ren.render(gfx);
//   requestAnimationFrame(render);
// }

// render();
