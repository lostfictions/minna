import { observable, action, autorun, IReactionDisposer } from "mobx";
import { IJsonPatch, applySnapshot } from "mobx-state-tree";

import { universClient } from "univers";

import { Model, randomName } from "zone-shared";

export class Store {
  @observable clientId: string;

  @observable.ref cursorPos: [number, number] = [0, 0];

  data: typeof Model.Type;

  readonly otherCursors = observable.map<
    string,
    { x: number; y: number; time: number }
  >([], {
    deep: false
  });

  private readonly disposers: ReadonlyArray<IReactionDisposer>;
  constructor(socket: SocketIOClient.Socket, clientId = randomName()) {
    this.clientId = clientId;

    const { tree, recv } = universClient({
      model: Model,
      send: async modelAction => {
        console.log("emitting action ", JSON.stringify(modelAction));
        socket.emit("action", modelAction);
      }
    });

    this.data = tree;

    socket.on("patch", (patch: IJsonPatch) => {
      console.log(`got patch ${JSON.stringify(patch)}, applying`);
      recv(patch);
    });

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
