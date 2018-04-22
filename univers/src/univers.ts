import debug from "debug";

import {
  addMiddleware,
  applyAction,
  applyPatch,
  getPath,
  // flow,
  isStateTreeNode,
  IJsonPatch,
  IMiddlewareEvent,
  IModelType,
  ISerializedActionCall,
  ISnapshottable,
  IStateTreeNode,
  onPatch
} from "mobx-state-tree";

const log = debug("univers");

// FIXME: remove
debug.enable("univers");

export interface CommonOptions<S> {
  initialSnapshot?: S;
  env?: { [varName: string]: any };
}

export interface ServerOptions<S, T> extends CommonOptions<S> {
  model: IModelType<S, T>;
  send: (patch: IJsonPatch) => any;
}

export interface ClientOptions<S, T> extends CommonOptions<S> {
  model: IModelType<S, T>;
  send: (action: ISerializedActionCall) => Promise<any>;
}

export type ServerRecv = { recv: (action: ISerializedActionCall) => void };
export type ClientRecv = { recv: (result: IJsonPatch) => void };

export function univers<S, T>(
  options: ServerOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ServerRecv;
export function univers<S, T>(
  options: ClientOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ClientRecv;
export function univers<S, T>(
  options: ServerOptions<S, T> | ClientOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & (ServerRecv | ClientRecv) {
  if (process.env.UNIVERS_ENV === "server") {
    log("configuring as server.");
    return universServer(options as ServerOptions<S, T>);
  } else {
    log("configuring as client.");
    return universClient(options as ClientOptions<S, T>);
  }
}

export function universServer<S, T>(
  options: ServerOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ServerRecv {
  const { model, send, initialSnapshot = {} as S, env } = options;
  const tree = model.create(initialSnapshot, { ...env });
  onPatch(tree, send);
  return {
    tree,
    recv(action) {
      applyAction(tree, action);
    }
  };
}

export function universClient<S, T>(
  options: ClientOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ClientRecv {
  const { model, send, initialSnapshot = {} as S, env } = options;
  const tree = model.create(initialSnapshot, { ...env });
  addMiddleware(tree, (call, next, abort) => {
    if (process.env.NODE_ENV !== "production") {
      checkCallArguments(call);
    }

    if (call.name === "@APPLY_SNAPSHOT" || call.name === "@APPLY_PATCHES") {
      next(call);
      return;
    }

    if (call.rootId !== call.id) {
      abort(undefined);
      return;
    }

    send({
      name: call.name,
      path: getPath(call.context),
      args: call.args
    });

    abort(undefined);

    // return abort(
    //   flow(function*() {
    //     // TODO: could apply action optimistically here
    //     yield send({
    //       name: call.name,
    //       path: getPath(call.context),
    //       args: call.args
    //     });
    //   })()
    // );
  });
  return {
    tree,
    recv(patch: IJsonPatch) {
      applyPatch(tree, patch);
    }
  };
}

function checkCallArguments(call: IMiddlewareEvent) {
  call.args.forEach((arg, i) => {
    if (
      isStateTreeNode(arg) ||
      typeof arg === "function" ||
      (typeof arg === "object" &&
        !(typeof arg == "object" && arg.constructor == Object) &&
        !Array.isArray(arg))
    ) {
      console.error(
        `Argument may be unserializable: ${getPath(call.context)}/${
          call.name
        }, arg position [${i}]`
      );
    }
  });
}
