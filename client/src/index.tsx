// import * as PIXI from "pixi.js";
// PIXI.utils.skipHello();

import io from "socket.io-client";
import { change, DocSet, Text, Connection, Doc } from "automerge";

import React from "react";
import { render } from "react-dom";

import { State } from "../../shared";

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

docSet.registerHandler((docId, doc) => {
  console.log(`Doc '${docId}' changed!`);
  render(<Butt doc={doc} />, document.querySelector("#root"));
});

class Butt extends React.Component<{ doc: Doc<State> }> {
  setField1 = (ev: React.ChangeEvent<any>) => {
    docSet.setDoc(
      DOC_ID,
      change(this.props.doc, state => {
        state.field1 = new Text();
        state.field1.insertAt(0, ...ev.target.value);
      })
    );
  };

  // setField2 = (ev: React.ChangeEvent<any>) => {
  //   //
  // };

  render() {
    const doc = this.props.doc;
    if (!doc || !doc.field1 || !doc.field2) {
      return <div>"nothing"</div>;
    }

    return (
      <div>
        <input value={doc.field1.join("")} onChange={this.setField1} />
        {/* <input value={doc.field2.join("")} onChange={this.setField2} /> */}
      </div>
    );
  }
}

render(<Butt doc={docSet.getDoc(DOC_ID)} />, document.querySelector("#root"));

// const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
// const app = new PIXI.Application({ view: canvas, antialias: true });
// const stage = app.stage;

// const gfx = new PIXI.Graphics();
// gfx.width = 200;
// gfx.height = 200;
// gfx.x = 400;
// gfx.y = 400;

// function makeRect(color: number) {
//   gfx.clear();
//   gfx.beginFill(color);
//   gfx.drawRect(10, 10, 100, 100);
//   gfx.endFill();
// }

// makeRect(0xff0000);
// stage.addChild(gfx);

// const rotSpeed = 0.01;

// app.ticker.add(dt => {
//   gfx.rotation = gfx.rotation + dt * rotSpeed;
// });
