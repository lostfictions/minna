import {
  observable,
  action,
  autorun,
  onBecomeObserved,
  onBecomeUnobserved,
  IReactionDisposer
} from "mobx";

import { change, DocSet, Connection, Doc } from "automerge";

import { randomName } from "./util";

import { State } from "../../defs/shared";

const DOC_ID = "butt";

export class Store {
  @observable.ref doc: Doc<State> | null = null;

  @observable clientId: string;

  @observable.ref cursorPos: [number, number] = [0, 0];

  readonly otherCursors = observable.map<string, [number, number]>([], {
    deep: false
  });

  private readonly docSet = new DocSet<State>();

  private readonly disposers: ReadonlyArray<IReactionDisposer>;
  private readonly cursorHideTimeouts = new Map<string, number>();

  constructor(socket: SocketIOClient.Socket, clientId = randomName()) {
    this.clientId = clientId;

    const connection = new Connection(this.docSet, msg => {
      // console.log(`Sending message: ${JSON.stringify(msg)}`);
      socket.emit("automerge", msg);
    });

    socket.on("connect", () => {
      // TODO: seems like this is insufficient to resync state on server restart
      // -- maybe because the server state after a restart doesn't share the
      // same history root?
      //
      // unfortunately, it seems to just silently fail instead of warning about
      // that or anything.
      console.log("(re)connected");
      connection.open();
    });

    socket.on("disconnect", (reason: string) => {
      console.log(`Disconnected! (Reason: '${reason}')`);
      connection.close();
    });

    socket.on("othercursor", ([clientId, x, y]: [string, number, number]) => {
      this.otherCursors.set(clientId, [x, y]);
    });

    socket.on("automerge", (msg: any) => {
      // console.log(`Receiving message: ${JSON.stringify(msg)}`);
      connection.receiveMsg(msg);
    });

    this.docSet.registerHandler(docId => {
      console.log(`Doc '${docId}' changed!`);
    });

    onBecomeObserved(this, "doc", () =>
      this.docSet.registerHandler(this.docChangeHandler)
    );
    onBecomeUnobserved(this, "doc", () =>
      this.docSet.unregisterHandler(this.docChangeHandler)
    );

    this.disposers = [
      autorun(() => socket.emit("id", this.clientId)),
      autorun(() => socket.emit("cursor", this.cursorPos)),
      // clear cursors. TODO: not the most efficient way of doing this, probably...
      this.otherCursors.observe(change => {
        const currentTimeout = this.cursorHideTimeouts.get(change.name);
        if (currentTimeout) clearTimeout(currentTimeout);

        if (change.type === "add" || change.type === "update") {
          this.cursorHideTimeouts.set(change.name, setTimeout(
            action(() => this.otherCursors.delete(change.name)),
            5000
          ) as any);
        }
      }) as IReactionDisposer
    ];
  }

  dispose(): void {
    this.disposers.forEach(d => d());
    (this.disposers as any) = null;

    for (const timer of this.cursorHideTimeouts.values()) {
      clearTimeout(timer);
    }
    this.cursorHideTimeouts.clear();
    (this.cursorHideTimeouts as any) = null;
  }

  @action.bound
  setCursor(x: number, y: number) {
    this.cursorPos = [x, y];
  }

  @action
  changeDoc(callback: (state: State) => void): void {
    // FIXME: ensure doc is initialized
    this.docSet.setDoc(DOC_ID, change(this.doc!, callback));
  }

  @action.bound
  docChangeHandler(docId: string, doc: Doc<State>): void {
    if (docId === DOC_ID) this.doc = doc;
  }
}
