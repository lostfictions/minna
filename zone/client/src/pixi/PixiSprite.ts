import { autorun } from "mobx";
import { Graphics, Point, interaction } from "pixi.js";

import { Sprite } from "../../../shared";

import PixiApp from "./PixiApp";

export default class PixiSprite {
  readonly graphic: Graphics;
  readonly handle!: Graphics;

  readonly disposers: (() => void)[];

  rotating = false;

  constructor(app: PixiApp, sprite: typeof Sprite.Type) {
    const g = new Graphics();
    this.graphic = g;

    g.alpha = 0.5;
    g.interactive = true;
    // g.interactiveChildren = false;

    this.makeHandle(app, sprite);

    let data: interaction.InteractionData | null = null;
    let offset: { x: number; y: number };

    const dragStart = (ev: interaction.InteractionEvent) => {
      // verify we're not trying to grab a child
      if (ev.target !== g) return;

      data = ev.data;

      const { x: oX, y: oY } = g.getGlobalPosition();
      const { x, y } = data.global;

      offset = { x: x - oX, y: y - oY };
    };

    const dragEnd = () => {
      data = null;
    };

    const dragMove = () => {
      if (!data) return;
      const { x, y } = data.global;
      sprite.setPosition(x - offset.x, y - offset.y);
    };

    g.on("pointerdown", dragStart);
    g.on("pointerup", dragEnd);
    g.on("pointerupoutside", dragEnd);
    g.on("pointercancel", dragEnd);
    g.on("pointermove", dragMove);

    g.on("pointerover", () => {
      this.handle.visible = true;
    });
    g.on("pointerout", () => {
      if (!this.rotating) this.handle.visible = false;
    });

    // TODO: reduce this boilerplate....
    this.disposers = [
      autorun(() => {
        this.graphic.name = sprite.id as string;
      }),
      autorun(() => {
        this.graphic.x = sprite.x;
      }),
      autorun(() => {
        this.graphic.y = sprite.y;
      }),
      // autorun(() => {
      //   this.graphic.width = sprite.width;
      // }),
      // autorun(() => {
      //   this.graphic.height = sprite.height;
      // }),
      autorun(() => {
        this.graphic.rotation = sprite.rotation;
      }),
      autorun(() => {
        this.setColor(sprite.color);
      })
    ];
  }

  makeHandle(app: PixiApp, sprite: typeof Sprite.Type) {
    const h = new Graphics();
    (this.handle as any) = h;

    this.graphic.addChild(h);
    h.cursor = "grab";
    h.name = "Handle";
    h.x = 50;
    h.y = -50;

    h.lineWidth = 3;
    h.beginFill(0xffffff);
    h.drawCircle(0, 0, 10);
    h.endFill();

    h.visible = false;
    h.interactive = true;

    let data: interaction.InteractionData | null = null;
    // let initialX: number;
    // let initialY: number;
    let spriteX: number;
    let spriteY: number;
    const dragStart = (ev: interaction.InteractionEvent) => {
      this.rotating = true;
      data = ev.data;
      // ({ x: initialX, y: initialY } = data.global);
      ({ x: spriteX, y: spriteY } = this.graphic.getGlobalPosition());
    };

    const dragEnd = (ev: interaction.InteractionEvent) => {
      this.rotating = false;

      // HACK: isn't there a better way to do this?
      const currentTarget = (app.renderer.plugins
        .interaction as interaction.InteractionManager).hitTest(
        new Point(ev.data.global.x, ev.data.global.y)
      );

      if (currentTarget !== this.graphic && currentTarget !== h) {
        h.visible = false;
      }
      data = null;
    };

    const dragMove = () => {
      if (!data) return;
      const { x, y } = data.global;

      // we add pi/4 since the handle is in the top-right corner
      sprite.setRotation(Math.atan2(y - spriteY, x - spriteX) + Math.PI / 4);
    };

    h.on("pointerdown", dragStart);
    h.on("pointerup", dragEnd);
    h.on("pointerupoutside", dragEnd);
    h.on("pointercancel", dragEnd);
    h.on("pointermove", dragMove);
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

    this.handle.removeAllListeners();
    this.handle.destroy();
    (this.handle as any) = null;

    this.graphic.removeAllListeners();
    this.graphic.destroy();
    (this.graphic as any) = null;
  }
}
