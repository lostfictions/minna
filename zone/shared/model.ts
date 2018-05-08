// prettier-ignore
import {
  types,
  // @ts-ignore (needed for declaration file)
  IModelType, IExtendedObservableMap, ISnapshottable
} from "mobx-state-tree";

import uuid from "uuid/v4";

export interface SpriteSnap {
  id?: string;
  x: number;
  y: number;
  rotation?: number;
  width: number;
  height: number;
  color: number;
}

export const Sprite = types
  .model({
    id: types.optional<string, string>(types.identifier(), () => uuid()),
    x: types.number,
    y: types.number,
    rotation: 0,
    width: types.number,
    height: types.number,
    color: types.number
  })
  .actions(self => ({
    setPosition(x: number, y: number) {
      self.x = x;
      self.y = y;
    },
    setRotation(rotation: number) {
      self.rotation = rotation;
    },
    setColor(color: number) {
      self.color = color;
    }
  }));

export const Model = types
  .model({ sprites: types.optional(types.map(Sprite), {}) })
  .actions(self => ({
    addSprite(snap: SpriteSnap) {
      self.sprites.put(Sprite.create(snap));
    },
    deleteSprite(id: string) {
      self.sprites.delete(id);
    }
  }));
