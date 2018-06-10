// prettier-ignore
import {
  types,
  // @ts-ignore (needed for declaration file)
  IModelType, IExtendedObservableMap, ISnapshottable
} from "mobx-state-tree";

import uuid from "uuid/v4";

interface Point {
  x: number;
  y: number;
}
const Point = types.custom<[number, number], Point>({
  name: "Point",
  fromSnapshot([x, y]: [number, number]) {
    return { x, y };
  },
  toSnapshot(t: Point) {
    return [t.x, t.y];
  },
  isTargetType(value: [number, number] | Point): boolean {
    return !Array.isArray(value);
  },
  getValidationMessage(value: [number, number]): string {
    if (Array.isArray(value) && value.length === 2) return "";
    return `'${value}' doesn't look like a valid `;
  }
});

export const Poly = types
  .model({
    id: types.optional<string, string>(types.identifier(), () => uuid()),
    points: types.array(Point),
    image: types.string
  })
  .views(self => ({
    get bounds() {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      self.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });

      return {
        minX,
        minY,
        maxX,
        maxY
      };
    }
  }))
  .actions(self => ({
    addPoint(point: Point, index?: number) {
      if (index == null) {
        self.points.push(point);
      } else {
        self.points.splice(index, 0, point);
      }
    },
    deletePoint(index: number) {
      self.points.splice(index, 1);
    },
    setPoint(index: number, deltaX: number, deltaY: number) {
      const { x, y } = self.points[index];
      self.points[index] = {
        x: x + deltaX,
        y: y + deltaY
      };
    },
    setPosition(deltaX: number, deltaY: number) {
      // console.log("here");
      for (let i = 0; i < self.points.length; i++) {
        self.points[i] = {
          x: self.points[i].x + deltaX,
          y: self.points[i].y + deltaY
        };
      }
      // self.points.forEach(p => {
      //   p.x += deltaX;
      //   p.y += deltaY;
      // });
    },
    setImage(url: string) {
      self.image = url;
    }
  }));

export type PolyType = typeof Poly.Type;

interface PolySnap {
  id?: string;
  points: Point[];
  image: string;
}

export const Model = types
  .model({
    polys: types.optional(types.map(Poly), {}),
    // Maps user IDs to selectable objects.
    selections: types.optional(types.map(Poly), {})
  })
  .views(self => ({
    // TODO: this could be set up using the observe() api instead for better
    // performance
    get selectionsToUsers() {
      const selections = new Map<string, string>();
      self.selections.forEach((selection, userId) => {
        selections.set(selection.id, userId);
      });
      return selections;
    }
  }))
  .actions(self => ({
    addPoly(snap: PolySnap) {
      self.polys.put(Poly.create(snap));
    },
    deletePoly(id: string) {
      self.polys.delete(id);
    },
    setSelection(_userId: string) {
      // TODO: server should inject user ID
    }
  }));
