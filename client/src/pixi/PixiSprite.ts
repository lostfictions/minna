import { autorun } from "mobx";
import { Graphics } from "pixi.js";

import { Sprite } from "zone-shared";

export default class PixiSprite {
  readonly graphic: Graphics;

  readonly disposers: (() => void)[];

  constructor(sprite: typeof Sprite.Type) {
    this.graphic = new Graphics();

    this.graphic.interactive = true;
    this.graphic.on("click", () => {
      sprite.setPosition(Math.random() * 400, Math.random() * 400);
    });

    this.disposers = [
      autorun(() => {
        console.log("id", sprite.id);
        this.graphic.name = sprite.id as string;
      }),
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
    this.disposers.forEach(d => d());
    (this.disposers as any) = null;

    this.graphic.destroy();
    (this.graphic as any) = null;
  }
}
