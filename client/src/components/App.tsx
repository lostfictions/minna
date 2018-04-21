import React from "react";
import { Provider, inject, observer } from "mobx-react";
import Mousetrap from "mousetrap";

import StackingContext from "./StackingContext";
import { Store } from "../Store";

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
  render() {
    return <div>sup</div>;
  }
}
