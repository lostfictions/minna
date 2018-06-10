import React from "react";
import { inject, observer } from "mobx-react";
import { computed, observable, action } from "mobx";

import Draggable, { DraggableEventHandler } from "react-draggable";

import Hammer from "hammerjs";

import { Store } from "../Store";

import { PolyType, Poly, Transform } from "../../../shared";

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
  @observable aspect = 1.5;

  initialRotation = 0;
  committedTransform = Transform.IDENTITY.scaleBy(100).translateBy(200, 200);
  totalTransform = observable.box<Transform>(this.committedTransform, {
    deep: false
  });

  initializeGesture = (ev: HammerInput) => {
    this.initialRotation = ev.rotation;
  };

  @action.bound
  setGesture(ev: HammerInput): void {
    // HACK: Hammer events' "rotation" field is supposed to be a delta, but
    // instead seems to be an absolute value -- so we have to track it.
    // Unfortunately, for gestures that might be one-finger, like panning, the
    // rotation will read as 0 until a second finger is placed down, at which
    // point it might jump to any angle between 0 and 360. So we check if our
    // initial value is _exactly_ zero, and if it is, we're allowed to
    // initialize it in the move phase.
    if (this.initialRotation === 0) {
      if (ev.rotation !== 0) {
        this.initialRotation = ev.rotation;
      }
    }
    const rads = ((ev.rotation - this.initialRotation) * Math.PI) / 180;
    this.totalTransform.set(
      Transform.IDENTITY.translateBy(ev.deltaX, ev.deltaY)
        .scaleBy(ev.scale, [ev.center.x, ev.center.y])
        .rotateBy(rads, [ev.center.x, ev.center.y])
        .multiplyBy(this.committedTransform)
    );
  }

  commitGesture = () => {
    this.committedTransform = this.totalTransform.get();
  };

  hammer: HammerManager | null = null;
  ref = React.createRef<SVGGElement>();

  componentDidMount() {
    const h = new Hammer(this.ref.current!, {
      recognizers: [
        [
          Hammer.Pan,
          {
            threshold: 5,
            pointers: 0
          }
        ],
        [Hammer.Tap]
      ]
    });

    this.hammer = h;

    h.on("panstart", this.initializeGesture);
    h.on("panmove", this.setGesture);
    h.on("panend", this.commitGesture);
    h.on("tap", this.onTap);
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

  @action.bound
  onTap(_ev: HammerInput) {
    console.log("tap!");
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
    const { s, r, tx, ty } = this.totalTransform.get();

    return (
      <g
        ref={this.ref}
        style={{
          transform: `matrix(${s}, ${r}, ${-r}, ${s}, ${tx}, ${ty})`
        }}
      >
        <rect
          x={0}
          y={0}
          width={this.aspect}
          height={1}
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
