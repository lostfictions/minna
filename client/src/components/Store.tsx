import React from "react";

import io from "socket.io-client";
import { change, DocSet, Connection, Doc } from "automerge";

import { State } from "../../../defs/shared";

const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3001;
const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`);

const DOC_ID = "butt";
const docSet = new DocSet<State>();

const connection = new Connection(docSet, msg => {
  // console.log(`Sending message: ${JSON.stringify(msg)}`);
  socket.emit("automerge", msg);
});

socket.on("connect", () => {
  connection.open();
});

socket.on("disconnect", () => {
  connection.close();
});

socket.on("automerge", (msg: any) => {
  // console.log(`Receiving message: ${JSON.stringify(msg)}`);
  connection.receiveMsg(msg);
});

docSet.registerHandler(docId => {
  console.log(`Doc '${docId}' changed!`);
});

export interface ProvidedStore {
  doc: Doc<State>;
  change(callback: (state: State) => void): void;
}

const { Provider, Consumer } = React.createContext<ProvidedStore>();

export class Store extends React.Component<{}, { doc: Doc<State> }> {
  constructor(props: any) {
    super(props);

    this.state = { doc: docSet.getDoc(DOC_ID) };
  }

  componentDidMount() {
    docSet.registerHandler(this.docHandler);
  }

  componentWillUnmount() {
    docSet.unregisterHandler(this.docHandler);
  }

  docHandler = (_docId: string, newDoc: Doc<State>) => {
    this.setState(() => ({ doc: newDoc }));
  };

  handleChange = (cb: (state: State) => void) => {
    docSet.setDoc(DOC_ID, change(this.state.doc, cb));
  };

  render() {
    return (
      <Provider value={{ doc: this.state.doc, change: this.handleChange }}>
        {this.props.children}
      </Provider>
    );
  }
}

export function withStore(
  Component: React.ComponentType<{ store: ProvidedStore }>
) {
  return function ComponentWithStore(props: any) {
    return (
      <Consumer>{store => <Component {...props} store={store} />}</Consumer>
    );
  };
}
