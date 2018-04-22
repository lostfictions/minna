import { Container, Graphics, Circle, Text } from "pixi.js";

import { assertNever } from "zone-shared";

import App from "./PixiApp";

export default class Cursors {
  readonly app: App;

  readonly colors: ReadonlyArray<number> = [
    0xffe263,
    0xa3bcff,
    0xff916e,
    0x63fbff,
    0xcfff65
  ];

  colorIndex = Math.floor(Math.random() * this.colors.length);

  readonly idToColor = new Map<string, number>();

  readonly container: Container;

  constructor(app: App) {
    this.app = app;
    this.container = new Container();
    app.stage.addChild(this.container);

    app.store.otherCursors.forEach(({ x, y, time }, clientId) => {
      console.log("initializing cursor for " + clientId);
      const cursor = this.makeCursor(clientId);
      this.container.addChild(cursor);
      cursor.x = x;
      cursor.y = y;
      (cursor as any).time = time;
    });

    app.store.otherCursors.observe(change => {
      switch (change.type) {
        case "add": {
          const cursor = this.makeCursor(change.name);
          this.container.addChild(cursor);
          const { x, y, time } = change.newValue;
          cursor.x = x;
          cursor.y = y;
          (cursor as any).time = time;
          break;
        }
        case "update": {
          const cursor = this.container.getChildByName(change.name);
          if (!cursor) {
            console.log(change.name);
            console.log("not found");
            console.log("children: ", this.container.children.length);
            console.log(this.container.children.map(c => c.name).join(", "));
          }
          const { x, y, time } = change.newValue;
          cursor.x = x;
          cursor.y = y;
          (cursor as any).time = time;
          break;
        }
        case "delete": {
          const cursor = this.container.getChildByName(change.name);
          cursor.destroy();
          break;
        }
        default:
          assertNever(change);
      }
    });
  }

  makeCursor(clientId: string): Container {
    let color = this.idToColor.get(clientId);
    if (!color) {
      color = this.colors[this.colorIndex];
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
      this.idToColor.set(clientId, color);
    }

    const cursor = new Graphics();
    cursor.name = clientId;
    cursor.beginFill(color);
    cursor.drawCircle(0, 0, 3);
    cursor.endFill();
    cursor.interactive = true;
    cursor.hitArea = new Circle(0, 0, 4);

    const ticker = () => {
      cursor.visible = Date.now() < (cursor as any).time + 5000;
    };

    this.app.ticker.add(ticker);

    cursor.on("removed", () => {
      console.log(`removing cursor for ${clientId}`);
      this.app.ticker.remove(ticker);
    });

    const text = new Text(clientId);
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
}
