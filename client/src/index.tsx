// import * as PIXI from "pixi.js";
// PIXI.utils.skipHello();

import io from "socket.io-client";
import * as automerge from "automerge";

import * as React from "react";
import { render } from "react-dom";

const PROTOCOL = "http";
const HOSTNAME = "localhost";
const PORT = 3001;

const socket = io.connect(`${PROTOCOL}://${HOSTNAME}:${PORT}`);

const DOC_ID = "butt";

const docSet = new automerge.DocSet();

const connection = new automerge.Connection(docSet, (msg: any) => {
  // console.log(`Sending message: ${JSON.stringify(msg)}`);
  socket.emit("automerge", msg);
});

socket.on("automerge", (msg: any) => {
  // console.log(`Receiving message: ${JSON.stringify(msg)}`);
  connection.receiveMsg(msg);
});

docSet.registerHandler((docId: string, doc: { [field: string]: any }) => {
  console.log(`Doc '${docId}' changed!`);
  render(<Butt doc={doc} />, document.querySelector("#root"));
});

connection.open();

class Butt extends React.Component<{ doc: any }> {
  setField1 = (ev: React.ChangeEvent<any>) => {
    //
    const doc = docSet.getDoc(DOC_ID);
    docSet.setDoc(
      DOC_ID,
      automerge.change(doc, (doc: any) => {
        doc.field1 = new automerge.Text();
        doc.field1.insertAt(0, ...ev.target.value);
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

render(<Butt doc={null} />, document.querySelector("#root"));

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
