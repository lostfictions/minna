import { observable, action, autorun, IReactionDisposer } from "mobx";

import { randomName } from "./util";

export class Store {
  @observable clientId: string;

  @observable.ref cursorPos: [number, number] = [0, 0];

  readonly otherCursors = observable.map<
    string,
    { x: number; y: number; time: number }
  >([], {
    deep: false
  });

  private readonly disposers: ReadonlyArray<IReactionDisposer>;
  constructor(socket: SocketIOClient.Socket, clientId = randomName()) {
    this.clientId = clientId;

    socket.on("connect", () => {
      console.log("(re)connected");

      socket.once("disconnect", (reason: string) => {
        console.log(`Disconnected! (Reason: '${reason}')`);
      });
    });

    socket.on(
      "othercursor",
      ([otherClientId, x, y]: [string, number, number]) => {
        this.otherCursors.set(otherClientId, { x, y, time: Date.now() });
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
  setCursor(x: number, y: number) {
    this.cursorPos = [x, y];
  }
}
