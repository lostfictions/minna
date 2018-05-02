import { Application, ApplicationOptions } from "pixi.js";

import { Store } from "../Store";

export default class PixiApp {
  readonly store: Store;
  readonly pixiApp: Application;

  get view() {
    return this.pixiApp.view;
  }

  get renderer() {
    return this.pixiApp.renderer;
  }
  get stage() {
    return this.pixiApp.stage;
  }
  get ticker() {
    return this.pixiApp.ticker;
  }
  get loader() {
    return this.pixiApp.loader;
  }
  get screen() {
    return this.pixiApp.screen;
  }

  constructor(store: Store, options?: ApplicationOptions) {
    this.store = store;
    this.pixiApp = new Application(options);

    const stage = this.pixiApp.stage;
    stage.interactive = true;

    // TODO: use pointer events...?
    stage.on("mousemove", (ev: PIXI.interaction.InteractionEvent) => {
      const { x, y } = ev.data.global;
      store.setCursor(x, y);
    });

    this.resizeRenderer();

    window.addEventListener("resize", this.resizeRenderer);
  }

  resizeRenderer = () => {
    const { innerWidth: w, innerHeight: h } = window;

    const canvas = this.view;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    this.renderer.resize(w, h);
  };

  start(): void {
    this.pixiApp.start();
  }
  stop(): void {
    this.pixiApp.stop();
  }
}
