type primitive = string | number | boolean | undefined | null;
type DeepReadonly<T> = T extends primitive ? T : DeepReadonlyObject<T>;
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

declare module "automerge" {
  export type Doc<T> = { _objectId: string } & DeepReadonly<T>;

  type Diff =
    | {
        type: "map";
        action: "set";
        key: string;
        value: any;
        link?: true;
        conflicts?: any[];
      }
    | { type: "map"; action: "remove"; key: string }
    | {
        type: "list" | "text";
        action: "insert";
        key: string;
        value: any;
        link?: true;
      }
    | {
        type: "list" | "text";
        action: "set";
        index: number;
        value: any;
        link?: true;
      }
    | {
        type: "list" | "text";
        action: "remove";
        index: number;
      };

  interface HistoryItem<T> {
    change: { message: string };
    snapshot: T;
  }

  export function init<T = {}>(actorId?: string): Doc<T>;

  // prettier-ignore
  export function change<T>(doc: Doc<T>, message: string, callback: (state: T) => void): Doc<T>;
  export function change<T>(doc: Doc<T>, callback: (state: T) => void): Doc<T>;

  export function merge<T>(local: Doc<T>, remote: Doc<T>): Doc<T>;

  export function diff<T>(oldState: Doc<T>, newState: Doc<T>): Diff[];

  export function assign<T, U>(target: Doc<T>, values: U): Doc<T & U>;

  export function load<T>(serialized: string, actorId?: string): Doc<T>;
  export function save<T>(doc: Doc<T>): string;

  export function equals(val1: any, val2: any): boolean;

  export function inspect<T>(doc: Doc<T>): T;

  export function getHistory<T>(doc: Doc<T>): HistoryItem<T>[];

  // TODO: undescribed return type
  export function getChanges<T>(currentDoc: Doc<T>, newDoc: Doc<T>): Object[];
  export function applyChanges<T>(doc: Doc<T>, changes: Object[]): Doc<T>;

  export class Text {
    constructor();

    length: number;

    get(index: number): string;

    [Symbol.iterator](): IterableIterator<string>;

    /**
     * Adds all the elements of the Text separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array.
     */
    slice(start?: number, end?: number): string[];

    insertAt(index: number, ...args: string[]): void;
    deleteAt(index: number): void;
  }

  export class DocSet<T = {}> {
    constructor();
    docIds: IterableIterator<string>;

    getDoc(docId: string): Doc<T>;

    setDoc(docId: string, doc: Doc<T>): void;

    applyChanges(docId: string, changes: Object[]): Doc<T>;

    registerHandler(handler: (docId: string, doc: Doc<T>) => void): void;

    unregisterHandler(handler: (docId: string, doc: Doc<T>) => void): void;
  }

  export class Connection {
    constructor(docSet: DocSet<any>, sendMsg: (msg: Object) => void);

    open(): void;

    close(): void;

    receiveMsg(msg: Object): void;
  }

  // undocumented, presumably unstable apis. let's wait until they're at least
  // mentioned in documentation somewhere before adding them:

  // export function initImmutable
  // export function loadImmutable
  // export function getConflicts
  // export function getChangesForActor
  // export function getMissingDeps
  // export class WatchableDoc
}
