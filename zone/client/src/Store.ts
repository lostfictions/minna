import { observable, action, autorun, IReactionDisposer } from "mobx";
import { IJsonPatch, applySnapshot, getSnapshot } from "mobx-state-tree";

import { clientSync } from "minna";

import { Model, randomName } from "../../shared";

export class Store {
  @observable shapeEditing = false;

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

    const { tree, recv } = clientSync({
      model: Model,
      send: async modelAction => {
        // console.log("emitting action ", JSON.stringify(modelAction));
        socket.emit("action", modelAction);
      }
    });

    this.data = tree;

    console.log("FIXME: remove");
    this.data.addPoly({
      id: "bittt",
      points: [[50, 100], [200, 100], [50, 200]] as any,
      image: ""
    });

    socket.on("patch", (patch: IJsonPatch) => {
      // console.log(`got patch ${JSON.stringify(patch)}, applying`);
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

  @action.bound
  setShapeEditing(enabled: boolean) {
    this.shapeEditing = enabled;
  }
}
