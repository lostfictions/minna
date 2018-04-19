// @ts-check

const {
  applyAction,
  applyPatch,
  recordPatches,
  decorate,
  getPath,
  flow
} = require("mobx-state-tree");

/** @type {(patches : Patch[]) => any} */
let sendResponse;
/** @type {(action: Action) => Promise<any>} */
let sendAction;

/** @typedef {{ name: string, path: string, args: any[]}} Action */
/** @typedef {{ op: "replace" | "add" | "remove", path: string, value?: any }} Patch */

function configureMethodForServer(
  /** @type {(patches : Patch[]) => any} */ _sendResponse
) {
  sendResponse = _sendResponse;
}

function configureMethodForClient(
  /** @type {(action: Action) => Promise<any>} */ _sendAction
) {
  sendAction = _sendAction;
}

function serverListen(
  /** @type {any} */ tree,
  /** @type {(cb: (action: Action) => void) => any} */ network
) {
  network(action => {
    console.log(
      `got action from network: at [${action.path}] => "${
        action.name
      }" applying.`
    );
    applyAction(tree, action);
  });
}

function clientListen(
  /** @type {any} */ tree,
  /** @type {(cb: (result: Patch[]) => void) => any} */ network
) {
  network(patches => {
    console.log(
      `got patches from network: ${JSON.stringify(patches)}. applying.`
    );
    applyPatch(tree, patches);
  });
}

function method(/** @type {(...args: any[]) => any} */ innerMethod) {
  if (process.env.APP_ENV === "server") {
    console.log("configuring as server...");
    return decorate((call, next) => {
      const recorder = recordPatches(call.tree);
      console.log("in middleware: before call");
      const result = next(call);
      console.log(`in middleware: after call, result is "${result}"`);
      console.log(
        `in middleware: patches after call: ${JSON.stringify(recorder.patches)}`
      );

      // @ts-ignore
      return sendResponse(recorder.patches);
    }, innerMethod);
  } else {
    console.log("configuring as client...");
    return decorate((call, _next, abort) => {
      console.log("in middleware: sending...");
      return abort(
        flow(function*() {
          console.log(`start of flow. could apply action optimistically here`);
          yield sendAction({
            name: call.name,
            path: getPath(call.context),
            args: call.args
          });
          console.log(`after sending action in flow.`);
        })()
      );
    }, innerMethod);
  }
}

module.exports = {
  configureMethodForClient,
  configureMethodForServer,
  serverListen,
  clientListen,
  method
};
