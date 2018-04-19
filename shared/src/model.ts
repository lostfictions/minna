import {
  types,
  // @ts-ignore (IModelType needed for declaration file)
  IModelType
} from "mobx-state-tree";

import { method } from "univers";

export const model = types
  .model({
    x: 0,
    y: 0
  })
  .actions(self => ({
    addOne: method(() => {
      self.x += 1;
    })
  }));
