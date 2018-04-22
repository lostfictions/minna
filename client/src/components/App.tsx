import React from "react";
import { Provider, inject, observer } from "mobx-react";
import Mousetrap from "mousetrap";

import { hsvToRgb } from "zone-shared";
import { utils as Util } from "pixi.js";

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
          <StackingContext
            innerStyle={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: 10,
              backgroundColor: "rgba(0, 0, 255, 0.3)"
            }}
            zIndex={0}
            interactionEnabled={this.state.open}
          >
            <IdText />
            <DataField />
          </StackingContext>
        </div>
      </Provider>
    );
  }
}

@inject("store")
@observer
class IdText extends React.Component<{ store?: Store }> {
  render() {
    const { clientId, setClientId } = this.props.store!;
    return (
      <input
        type="text"
        value={clientId}
        onChange={ev => setClientId(ev.target.value)}
      />
    );
  }
}

@inject("store")
@observer
class DataField extends React.Component<{ store?: Store }> {
  render() {
    const { data } = this.props.store!;
    return (
      <>
        <div>{JSON.stringify(data.sprites.values)}</div>
        <button
          onClick={() => {
            data.addSprite({
              x: 100 + Math.random() * 500,
              y: 100 + Math.random() * 500,
              width: 200,
              height: 200,
              color: Util.rgb2hex(hsvToRgb(Math.random(), 0.5, 0.9))
            });
          }}
        >
          Add sprite
        </button>
      </>
    );
  }
}
