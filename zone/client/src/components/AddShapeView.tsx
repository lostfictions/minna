import React from "react";
import { inject, observer } from "mobx-react";
import { computed, observable, action } from "mobx";

import { DraggableCore, DraggableEventHandler } from "react-draggable";

import Hammer from "hammerjs";

import { Store } from "../Store";

import { PolyType, Poly, Transform } from "../../../shared";

import testImage from "../../temp/test.jpg";

@inject("store")
@observer
export default class AddShapeView extends React.Component<{ store?: Store }> {
  poly = Poly.create({
    points: [],
    image: testImage
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

  hammer: HammerManager | null = null;
  ref = React.createRef<SVGUseElement>();

  initializeGesture = (ev: HammerInput) => {
    this.initialRotation = ev.rotation;
  };

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
        [Hammer.Tap],
        [Hammer.Press]
      ]
    });

    this.hammer = h;

    h.on("panstart", this.initializeGesture);
    h.on("panmove", this.setGesture);
    h.on("panend", this.commitGesture);
    h.on("tap pressup", this.onTap);
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

  onTap = (ev: HammerInput) => {
    const { x, y } = ev.center;
    const [tX, tY] = this.totalTransform
      .get()
      .inverse()
      .transformPoint([x, y]);

    this.props.model.addPoint([tX, tY] as any);
  };

  onDragPoint: DraggableEventHandler = (_ev, data) => {
    const { deltaX, deltaY } = data;

    // We need the scale and rotation of the transform but not the translation,
    // since we're using deltas.
    let trans = this.totalTransform.get().inverse();
    trans.tx = 0;
    trans.ty = 0;

    const [tX, tY] = trans.transformPoint([deltaX, deltaY]);

    this.props.model.setPoint(parseFloat(data.node.dataset.index!), tX, tY);

    // TODO: constrain to paper bounds
  };

  onClickRect: React.MouseEventHandler<SVGRectElement> = ev => {
    const { clientX, clientY } = ev;

    this.props.model.addPoint({ x: clientX, y: clientY });
  };

  render() {
    const { points, image } = this.props.model;
    const trans = this.totalTransform.get();
    const { s, r, tx, ty } = trans;

    return (
      <>
        <defs>
          <image id="img" xlinkHref={image} width={this.aspect} height={1} />
        </defs>
        <g
          style={{ transform: `matrix(${s}, ${r}, ${-r}, ${s}, ${tx}, ${ty})` }}
        >
          <defs>
            <path
              id="path"
              vectorEffect="non-scaling-stroke"
              d={this.svgPathString}
            />
          </defs>
          <clipPath id="temp">
            <use xlinkHref="#path" />
          </clipPath>
          <use
            xlinkHref="#img"
            ref={this.ref}
            opacity={points.length >= 3 ? 0.3 : 1}
          />
          <use xlinkHref="#img" clipPath="url(#temp)" pointerEvents="none" />

          <use
            xlinkHref="#path"
            fill="none"
            stroke="black"
            strokeWidth={2}
            pointerEvents="none"
          />
        </g>

        {points.map(({ x: pX, y: pY }, i) => {
          const [tX, tY] = trans.transformPoint([pX, pY]);
          return (
            <Point onDrag={this.onDragPoint} x={tX} y={tY} index={i} key={i} />
          );
        })}
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
  onClick(ev: React.MouseEvent<SVGRectElement>) {
    ev.stopPropagation();
  }

  render() {
    const { x, y, index, onDrag } = this.props;
    return (
      <DraggableCore onDrag={onDrag}>
        <rect
          onClick={this.onClick}
          data-index={index}
          x={x - 20}
          y={y - 20}
          width={40}
          height={40}
          fill="transparent"
          stroke="black"
        />
      </DraggableCore>
    );
  }
}
