import React from "react";
import { Provider, inject, observer } from "mobx-react";
import Mousetrap from "mousetrap";

import StackingContext from "./StackingContext";
import { Store } from "../Store";

import { Text } from "automerge";

export default class App extends React.Component<
  { store: Store },
  { open: boolean }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      open: true
    };

    Mousetrap.bind("`", () => {
      this.setState({ open: !this.state.open });
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind("`");
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <div
          style={{
            transition: "opacity 0.3s ease-in-out",
            opacity: this.state.open ? 1 : 0
          }}
        >
          <StackingContext zIndex={0} interactionEnabled={this.state.open}>
            <IdText />
            <TextField />
          </StackingContext>
        </div>
      </Provider>
    );
  }
}

const IdText = inject("store")(({ store: { clientId } }) => (
  <div>{clientId}</div>
));

@inject("store")
@observer
class TextField extends React.Component<{ store?: Store }> {
  setField1 = (ev: React.ChangeEvent<any>) => {
    this.props.store!.changeDoc(state => {
      state.field1 = new Text();
      state.field1.insertAt(0, ...ev.target.value);
    });
  };

  render() {
    const { doc } = this.props.store!;
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
