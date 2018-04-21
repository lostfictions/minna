import {
  applyAction,
  applyPatch,
  recordPatches,
  decorate,
  getPath,
  flow,
  IJsonPatch,
  ISerializedActionCall,
  IStateTreeNode
} from "mobx-state-tree";

let _sendResponse: (patches: IJsonPatch[]) => any;
let _sendAction: (action: ISerializedActionCall) => Promise<any>;

export function configureMethodForServer(
  sendResponse: (patches: IJsonPatch[]) => any
) {
  _sendResponse = sendResponse;
}

export function configureMethodForClient(
  sendAction: (action: ISerializedActionCall) => Promise<any>
) {
  _sendAction = sendAction;
}

export function serverListen(
  tree: IStateTreeNode,
  networkReceiver: (onAction: (action: ISerializedActionCall) => void) => any
) {
  networkReceiver(action => {
    console.log(
      `got action from network: at [${action.path}] => "${
        action.name
      }" applying.`
    );
    applyAction(tree, action);
  });
}

export function clientListen(
  tree: IStateTreeNode,
  networkReceiver: (onPatches: (result: IJsonPatch[]) => void) => any
) {
  networkReceiver(patches => {
    console.log(
      `got patches from network: ${JSON.stringify(patches)}. applying.`
    );
    applyPatch(tree, patches);
  });
}

export function method(innerMethod: (...args: any[]) => any) {
  if (process.env.UNIVERS_ENV === "server") {
    console.log("configuring as server...");
    return decorate((call, next) => {
      const recorder = recordPatches(call.tree);
      console.log("in middleware: before call");
      const result = next(call);
      console.log(`in middleware: after call, result is "${result}"`);
      console.log(
        `in middleware: patches after call: ${JSON.stringify(recorder.patches)}`
      );

      return _sendResponse(recorder.patches as IJsonPatch[]);
    }, innerMethod);
  } else {
    console.log("configuring as client...");
    return decorate((call, _next, abort) => {
      console.log("in middleware: sending...");
      return abort(
        flow(function*() {
          console.log(`start of flow. could apply action optimistically here`);
          yield _sendAction({
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
