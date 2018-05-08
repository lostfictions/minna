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

const log = debug("minna");

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

// For convenience, we export a function that checks the environment variable to
// decide whether it should act as a server or a client.
export function sync<S, T>(
  options: ServerOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ServerRecv;
export function sync<S, T>(
  options: ClientOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & ClientRecv;
export function sync<S, T>(
  options: ServerOptions<S, T> | ClientOptions<S, T>
): {
  tree: IStateTreeNode & ISnapshottable<S> & T;
} & (ServerRecv | ClientRecv) {
  if (process.env.MINNA_ENV === "server") {
    log("configuring as server.");
    return serverSync(options as ServerOptions<S, T>);
  } else {
    log("configuring as client.");
    return clientSync(options as ClientOptions<S, T>);
  }
}

export function serverSync<S, T>(
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

export function clientSync<S, T>(
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

    // if we're applying a snapshot or patches on the client, we don't do
    // anything.
    if (call.name === "@APPLY_SNAPSHOT" || call.name === "@APPLY_PATCHES") {
      next(call);
      return;
    }

    // we should never reach a non-root call in client code (at least until we
    // implement optimistic updates?)
    if (call.rootId !== call.id) {
      console.warn("Non-root MST call reached in client code!");
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
