import React from "react";
import { inject, observer } from "mobx-react";
import { computed, observable, action } from "mobx";

import Draggable, { DraggableEventHandler } from "react-draggable";

import Hammer from "hammerjs";

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

  hammer: HammerManager | null = null;
  ref = React.createRef<SVGGElement>();

  componentDidMount() {
    const h = new Hammer(this.ref.current!);
    this.hammer = h;
    h.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    h.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(h.get("pan"));
    h.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(
      [h.get("pan"), h.get("rotate")] as any /* bad typings */
    );

    h.add(new Hammer.Tap());

    // h.on("panstart", this.onPanStart);
    h.on("panmove", this.onPan);
    h.on("panend", this.onPanEnd);
    // h.on("rotatestart", this.onRotateStart);
    // h.on("rotatemove", this.onRotate);
    // h.on("pinchstart", this.onPinchStart);
    // h.on("pinchmove", this.onPinch);
    // h.on("tap", this.onTap);
  }

  componentWillUnmount() {
    if (this.hammer) {
      this.hammer.destroy();
      this.hammer = null;
    }
  }

  @computed
  get svgPathString(): string {
    const ps = this.props.model.points;
    if (ps.length === 0) return "";
    return `M ${ps[0].x} ${ps[0].y} ${ps
      .slice(1)
      .map(({ x, y }) => `L ${x} ${y}`)
      .join(" ")}`;
  }

  lastDeltaX = 0;
  lastDeltaY = 0;
  @action.bound
  onPan(ev: HammerInput) {
    this.transform.x += ev.deltaX - this.lastDeltaX;
    this.transform.y += ev.deltaY - this.lastDeltaY;
    this.lastDeltaX = ev.deltaX;
    this.lastDeltaY = ev.deltaY;
  }

  onPanEnd = () => {
    this.lastDeltaX = 0;
    this.lastDeltaY = 0;
  };

  rotateInitialAngle!: number;
  rotateInitialRotation!: number;
  rotateInitialX!: number;
  rotateInitialY!: number;

  onRotateStart = (ev: HammerInput) => {
    this.rotateInitialAngle = this.transform.angle;
    // HACK: the event rotation seems to be an absolute value, not a relative
    // one. even the example on the hammer frontpage is wrong?
    this.rotateInitialRotation = ev.rotation;
    this.rotateInitialX = this.transform.x;
    this.rotateInitialY = this.transform.y;
    // Alternately:
    // this.rotateInitialAngle = this.transform.angle - ev.rotation;
  };

  @action.bound
  onRotate(ev: HammerInput) {
    const theta = (ev.rotation - this.rotateInitialRotation) * 0.0174533;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const deltaX = this.transform.x - ev.center.x;
    const deltaY = this.transform.y - ev.center.y;

    this.transform.x = cos * deltaX - sin * deltaY + ev.center.x;
    this.transform.y = sin * deltaX + cos * deltaY + ev.center.y;
    this.transform.angle = this.rotateInitialAngle + ev.rotation;
  }

  pinchInitialScale!: number;
  onPinchStart = (ev: HammerInput) => {
    this.pinchInitialScale = this.transform.scale;
    this.onPinch(ev);
  };

  @action.bound
  onPinch(ev: HammerInput) {
    this.transform.scale = this.pinchInitialScale * ev.scale;
  }

  @action.bound
  onTap(ev: HammerInput) {
    //
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
        ref={this.ref}
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${angle}deg)`
          // transform: `translate(${x}px, ${y}px) scale(${scale}, ${scale}) rotate(${angle}deg)`
          // transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}, ${scale}) rotate(${angle}deg)`
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
          // onClick={this.onClickRect}
          fill={points.length === 0 ? color : "rgba(200, 200, 20, 0.3)"}
        />
        <path
          d={this.svgPathString}
          fill={color}
          stroke="black"
          strokeWidth={2}
        />

        {points.map(({ x: pX, y: pY }, i) => (
          <Point onDrag={this.onDragPoint} x={pX} y={pY} index={i} key={i} />
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
