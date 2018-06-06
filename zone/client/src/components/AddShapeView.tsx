import React from "react";
import { inject, observer } from "mobx-react";
import { computed, observable, action } from "mobx";

import Draggable, { DraggableEventHandler } from "react-draggable";

import { Store } from "../Store";

import { PolyType, Poly } from "../../../shared";

@inject("store")
@observer
export default class AddShapeView extends React.Component<{ store?: Store }> {
  poly = Poly.create({
    points: [[200, 200], [400, 400]],
    color: "red"
  });

  render() {
    return (
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0
        }}
      >
        <Paper model={this.poly} />
      </svg>
    );
  }
}

@observer
class Paper extends React.Component<{ model: PolyType }> {
  /** temporary attributes for shape-adding behaviour. */
  @observable
  transform = {
    x: 150,
    y: 200,
    angle: 0,
    scale: 100,
    /** x/y */
    aspect: 1 / 1.4
  };

  @computed
  get svgPathString(): string {
    const ps = this.props.model.points;
    if (ps.length === 0) return "";
    return `M ${ps[0].x} ${ps[0].y} ${ps
      .slice(1)
      .map(({ x, y }) => `L ${x} ${y}`)
      .join(" ")}`;
  }

  onDragPoint: DraggableEventHandler = (_ev, data) => {
    const { deltaX, deltaY } = data;

    this.props.model.setPoint(
      parseFloat(data.node.dataset.index!),
      deltaX,
      deltaY
    );

    // TODO: constrain to paper bounds
  };

  onClickRect: React.MouseEventHandler<SVGRectElement> = ev => {
    const { clientX, clientY } = ev;

    this.props.model.addPoint({ x: clientX, y: clientY });
  };

  render() {
    const { color, points } = this.props.model;

    const { x, y, angle, scale, aspect } = this.transform;

    return (
      <g
        style={{
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}, ${scale}) rotate(${angle}deg)`
        }}
        // // TODO: should be on child, here for simplicity for now
        // onTouchMoveCapture={ev => {
        //   const { clientX: touchX, clientY: touchY } = ev.touches[0]

        //   // console.log("client", ev.currentTarget.clientLeft, ev.touches[0].clientY);
        //   // const { deltaX, deltaY } = data;

        //   //   this.props.model.setPosition(deltaX, deltaY);
        // }}
      >
        <rect
          x={0}
          y={0}
          width={aspect}
          height={1}
          onClick={this.onClickRect}
          fill={points.length === 0 ? color : "rgba(200, 200, 20, 0.3)"}
        />
        <path
          d={this.svgPathString}
          fill={color}
          stroke="black"
          strokeWidth={2}
        />

        {points.map(({ x, y }, i) => (
          <Point onDrag={this.onDragPoint} x={x} y={y} index={i} key={i} />
        ))}
      </g>
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
  onClick(ev: React.MouseEvent<SVGRectElement>) {
    ev.stopPropagation();
  }

  render() {
    const { x, y, index, onDrag } = this.props;
    return (
      <Draggable position={{ x, y }} onDrag={onDrag}>
        <rect
          onClick={this.onClick}
          data-index={index}
          x={-20}
          y={-20}
          width={40}
          height={40}
          fill="transparent"
          stroke="black"
        />
      </Draggable>
    );
  }
}
