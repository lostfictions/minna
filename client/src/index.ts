import * as PIXI from "pixi.js";

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
