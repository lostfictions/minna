import { autorun } from "mobx";
import { Graphics } from "pixi.js";

import { Sprite } from "zone-shared";

import App from "./PixiApp";

export default class PixiSprite {
  readonly app: App;
  readonly sprite: typeof Sprite.Type;

  readonly graphic: Graphics;

  readonly disposers: (() => void)[];

  constructor(app: App, sprite: typeof Sprite.Type) {
    this.app = app;
    this.sprite = sprite;
    this.graphic = new Graphics();
    this.app.stage.addChild(this.graphic);

    this.disposers = [
      autorun(() => {
        this.graphic.x = sprite.x;
      }),
      autorun(() => {
        this.graphic.y = sprite.y;
      }),
      autorun(() => {
        this.setColor(sprite.color);
      })
    ];
  }

  setColor(color: number) {
    this.graphic.clear();
    this.graphic.beginFill(color);
    this.graphic.drawRect(-50, -50, 100, 100);
    this.graphic.endFill();
  }

  destroy() {
    this.graphic.destroy();
    (this.graphic as any) = null;
  }
}
