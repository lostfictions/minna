import { observable, action, autorun, IReactionDisposer } from "mobx";
import { IJsonPatch, applySnapshot } from "mobx-state-tree";

import { univers, ClientOptions } from "univers";

import { model } from "zone-shared";

import { randomName } from "./util";

export class Store {
  @observable clientId: string;

  @observable.ref cursorPos: [number, number] = [0, 0];

  data: typeof model.Type;

  readonly otherCursors = observable.map<
    string,
    { x: number; y: number; time: number }
  >([], {
    deep: false
  });

  private readonly disposers: ReadonlyArray<IReactionDisposer>;
  constructor(socket: SocketIOClient.Socket, clientId = randomName()) {
    this.clientId = clientId;

    this.data = univers(model, {
      send: async modelAction => {
        console.log("emitting action");
        socket.emit("action", modelAction);
      },
      recv: onPatches => {
        console.log("setting up client listener...");
        socket.on("patches", (patches: IJsonPatch[]) => {
          console.log(`got patches ${JSON.stringify(patches)}, applying`);
          onPatches(patches);
        });
      }
    } as ClientOptions);

    socket.on("init", (snap: any) => applySnapshot(this.data, snap));

    socket.on(
      "othercursor",
      ([otherClientId, x, y]: [string, number, number]) => {
        this.otherCursors.set(otherClientId, {
          x,
          y,
          time: Date.now()
        });
      }
    );

    this.disposers = [
      autorun(() => socket.emit("id", this.clientId)),
      autorun(() => socket.emit("cursor", this.cursorPos))
    ];
  }

  dispose(): void {
    this.disposers.forEach(d => d());
    (this.disposers as any) = null;
  }

  @action.bound
  setClientId(id: string) {
    this.clientId = id;
  }

  @action.bound
  setCursor(x: number, y: number) {
    this.cursorPos = [x, y];
  }
}
