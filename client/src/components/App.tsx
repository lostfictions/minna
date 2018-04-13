import React from "react";
import Mousetrap from "mousetrap";

import StackingContext from "./StackingContext";
import { Store, withStore, ProvidedStore } from "./Store";

import { Text } from "automerge";

export default class App extends React.Component<{}, { open: boolean }> {
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
      <Store>
        <div
          style={{
            transition: "opacity 0.3s ease-in-out",
            opacity: this.state.open ? 1 : 0
          }}
        >
          <StackingContext zIndex={0} interactionEnabled={this.state.open}>
            <IdText />
            <TextFieldWithStore />
          </StackingContext>
        </div>
      </Store>
    );
  }
}

const IdText = withStore(({ store: { id } }) => <div>{id}</div>);

class TextField extends React.Component<{ store: ProvidedStore }> {
  setField1 = (ev: React.ChangeEvent<any>) => {
    this.props.store.change(state => {
      state.field1 = new Text();
      state.field1.insertAt(0, ...ev.target.value);
    });
  };

  render() {
    const { store: { doc } } = this.props;
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

const TextFieldWithStore = withStore(TextField);
