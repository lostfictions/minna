import debug from "debug";

import {
  applyAction,
  applyPatch,
  recordPatches,
  decorate,
  getEnv,
  getPath,
  flow,
  IJsonPatch,
  IModelType,
  ISerializedActionCall,
  ISnapshottable,
  IStateTreeNode
} from "mobx-state-tree";

const log = debug("univers");

debug.enable("univers");

export interface ServerOptions {
  send: (patches: IJsonPatch[]) => any;
  recv: (onAction: (action: ISerializedActionCall) => void) => any;
  env?: { [varName: string]: any };
}

export interface ClientOptions {
  send: (action: ISerializedActionCall) => Promise<any>;
  recv: (onPatches: (result: IJsonPatch[]) => void) => any;
  env?: { [varName: string]: any };
}

export function univers<S, T>(
  modelType: IModelType<S, T>,
  options: ServerOptions | ClientOptions
): IStateTreeNode & ISnapshottable<S> & T {
  let tree: IStateTreeNode & ISnapshottable<S> & T;
  if (process.env.UNIVERS_ENV === "server") {
    const { recv, send, env } = options as ServerOptions;
    tree = modelType.create({} as S, { __universSendServer: send, ...env });
    recv(action => applyAction(tree, action));
  } else {
    const { recv, send, env } = options as ClientOptions;
    tree = modelType.create({} as S, { __universSendClient: send, ...env });
    recv(patches => applyPatch(tree, patches));
  }
  return tree;
}

export function method(innerMethod: (...args: any[]) => any) {
  if (process.env.UNIVERS_ENV === "server") {
    log("configuring as server...");
    return decorate((call, next) => {
      const { __universSendServer: send } = getEnv(call.tree);
      if (!send) {
        throw new Error(`Send function not found in tree environment!`);
      }

      const recorder = recordPatches(call.tree);
      next(call);
      return send(recorder.patches as IJsonPatch[]);
    }, innerMethod);
  } else {
    log("configuring as client...");
    return decorate((call, _next, abort) => {
      const { __universSendClient: send } = getEnv(call.tree);
      if (!send) {
        throw new Error(`Send function not found in tree environment!`);
      }

      return abort(
        flow(function*() {
          // TODO: could apply action optimistically here
          yield send({
            name: call.name,
            path: getPath(call.context),
            args: call.args
          });
        })()
      );
    }, innerMethod);
  }
}
