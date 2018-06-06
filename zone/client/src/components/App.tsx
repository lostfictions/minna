import React from "react";
import { Provider } from "mobx-react";
import { hot } from "react-hot-loader";

import { Store } from "../Store";
import MainView from "./MainView";

class App extends React.Component<{ store: Store }> {
  render() {
    return (
      <Provider store={this.props.store}>
        <MainView />
      </Provider>
    );
  }
}

export default hot(module)(App);
