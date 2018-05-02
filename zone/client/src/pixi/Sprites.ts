import { Container } from "pixi.js";

import PixiSprite from "./PixiSprite";

import App from "./PixiApp";

export default class Sprites {
  readonly app: App;
  readonly container: Container;

  readonly idsToPixiSprites = new Map<string, PixiSprite>();

  constructor(app: App) {
    this.app = app;
    this.container = new Container();
    this.container.name = "Sprites";
    app.stage.addChild(this.container);

    app.store.data.sprites.observe(change => {
      switch (change.type) {
        case "add": {
          // for some reason we can't use "change.newValue" -- we have to get it
          // from the map ourselves?
          const sprite = change.object.get(change.name)!;
          const pixiSprite = new PixiSprite(app, sprite);

          this.idsToPixiSprites.set(sprite.id, pixiSprite);
          this.container.addChild(pixiSprite.graphic);

          break;
        }
        case "delete": {
          const pixiSprite = this.idsToPixiSprites.get(change.name);
          if (!pixiSprite) {
            console.warn(`sprite not found: ${change.name}`);
          } else {
            pixiSprite.destroy();
          }
          break;
        }
      }
    });
  }
}
