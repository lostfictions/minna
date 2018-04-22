import { autorun } from "mobx";
import { Graphics, interaction } from "pixi.js";

import { Sprite } from "zone-shared";

export default class PixiSprite {
  readonly graphic: Graphics;

  readonly disposers: (() => void)[];

  constructor(sprite: typeof Sprite.Type) {
    const g = new Graphics();
    this.graphic = g;

    g.alpha = 0.5;

    g.interactive = true;

    let data: interaction.InteractionData | null = null;
    let offset: { x: number; y: number };
    const dragStart = (ev: interaction.InteractionEvent) => {
      data = ev.data;
      offset = data.getLocalPosition(g);
    };

    const dragEnd = () => {
      data = null;
    };

    const dragMove = () => {
      if (!data) return;
      const { x, y } = data.getLocalPosition(g.parent);
      sprite.setPosition(x - offset.x, y - offset.y);
    };

    g.on("pointerdown", dragStart);
    g.on("pointerup", dragEnd);
    g.on("pointerupoutside", dragEnd);
    g.on("pointermove", dragMove);

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
        this.graphic.rotation = sprite.rotation;
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

    this.graphic.removeAllListeners();
    this.graphic.destroy();
    (this.graphic as any) = null;
  }
}
