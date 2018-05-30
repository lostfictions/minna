import React from "react";
import { inject, observer } from "mobx-react";
import { computed } from "mobx";

import Draggable, {
  DraggableCore,
  DraggableEventHandler
} from "react-draggable";

import { Store } from "../Store";

import { PolyType } from "../../../shared";

@inject("store")
@observer
export default class SVGCanvas extends React.Component<{ store?: Store }> {
  // onClick = (ev: React.MouseEvent<SVGElement>) => {
  //   console.log(ev.type, "canvas", ev.clientX, ev.clientY);
  //   // this.props.store!.data.addPoly
  // };

  render() {
    const { polys } = this.props.store!.data;
    return (
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0
        }}
        // onClick={this.onClick}
      >
        {[...polys.values()].map((p, i) => <Polygon model={p} key={i} />)}
      </svg>
    );
  }
}

@observer
class Polygon extends React.Component<{ model: PolyType }> {
  @computed
  get path(): string {
    const ps = this.props.model.points;
    if (ps.length === 0) return "";
    return `M ${ps[0].x} ${ps[0].y} ${ps
      .slice(1)
      .map(({ x, y }) => `L ${x} ${y}`)
      .join(" ")} Z`;
  }

  onDragPoly: DraggableEventHandler = (_ev, data) => {
    const { deltaX, deltaY } = data;

    this.props.model.setPosition(deltaX, deltaY);
  };

  onDragPoint: DraggableEventHandler = (_ev, data) => {
    const { x, y } = data;

    this.props.model.setPoint(parseInt(data.node.dataset.index!, 10), { x, y });
  };

  render() {
    const { color, points } = this.props.model;

    return (
      <>
        <DraggableCore onDrag={this.onDragPoly}>
          <path d={this.path} fill={color} stroke="rgba(20, 20, 20, 0.5)" />
        </DraggableCore>
        {points.map(({ x, y }, i) => (
          <Point onDrag={this.onDragPoint} x={x} y={y} index={i} key={i} />
        ))}
      </>
    );
  }
}

interface PointProps {
  onDrag: DraggableEventHandler;
  x: number;
  y: number;
  index: number;
}

class Point extends React.Component<PointProps> {
  onClick(ev: React.MouseEvent<SVGCircleElement>) {
    ev.stopPropagation();
  }

  render() {
    const { x, y, index, onDrag } = this.props;
    return (
      <Draggable position={{ x, y }} onDrag={onDrag}>
        <circle
          onClick={this.onClick}
          data-index={index}
          cx={0}
          cy={0}
          r={20}
          fill="rgba(255,255,255,0.5)"
          stroke="rgba(0,0,0,0.5)"
        />
      </Draggable>
    );
  }
}
