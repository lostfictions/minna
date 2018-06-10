import React from "react";
import { inject, observer } from "mobx-react";
// import Mousetrap from "mousetrap";

// import { hsvToRgb } from "../../../shared";
// import StackingContext from "./StackingContext";

import { Store } from "../Store";

import SVGCanvas from "./SVGCanvas";
import AddShapeView from "./AddShapeView";

@inject("store")
@observer
export default class MainView extends React.Component<{ store?: Store }> {
  // constructor(props: any) {
  //   super(props);

  //   // Mousetrap.bind("`", () => {
  //   //   this.setState({ open: !this.state.open });
  //   // });
  // }

  // componentWillUnmount() {
  //   Mousetrap.unbind("`");
  // }

  render() {
    return (
      <>
        {/* <SVGCanvas /> */}
        {this.props.store!.shapeEditing ? <AddShapeView /> : <AddShapeButton />}
        {/* <div
            style={{
              transition: "opacity 0.3s ease-in-out",
              opacity: this.state.open ? 1 : 0
            }}
          >
            <StackingContext
              innerStyle={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                padding: 10,
                backgroundColor: "rgba(0, 0, 255, 0.2)"
              }}
              zIndex={0}
              interactionEnabled={this.state.open}
            >
              <Toolbar />
            </StackingContext>
          </div> */}
      </>
    );
  }
}

/*
interface ToolbarButtonProps {
  toolType: Tools;
  icon: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  selected: boolean;
}
const ToolbarButton = ({
  icon,
  selected,
  onClick,
  toolType
}: ToolbarButtonProps) => (
  <div className="control">
    <button
      className={`button is-large is-white ${selected ? "" : "is-outlined"}`}
      onClick={onClick}
      data-tooltype={toolType}
    >
      <span className="icon">
        <span className={icon} />
      </span>
    </button>
  </div>
);

type Tools = "select" | "pen";

@inject("store")
@observer
class Toolbar extends React.Component<
  { store?: Store },
  { selectedTool: Tools }
> {
  state = {
    selectedTool: "select" as Tools
  };

  onToolClick: React.MouseEventHandler<HTMLButtonElement> = ev => {
    this.setState({ selectedTool: ev.currentTarget.dataset.tooltype as Tools });
  };

  render() {
    const { data } = this.props.store!;
    return (
      <>
        <div className="field is-grouped is-grouped-centered">
          <ToolbarButton
            onClick={this.onToolClick}
            toolType={"select"}
            icon="i-cursor"
            selected={this.state.selectedTool === "select"}
          />
          <ToolbarButton
            onClick={this.onToolClick}
            toolType={"pen"}
            icon="i-pen-tool"
            selected={this.state.selectedTool === "pen"}
          />
        </div>
      </>
    );
    // return (
    //   <>
    //     <button
    //       className="button"
    //       onClick={() => {
    //         data.addPoly({
    //           points: [
    //             {
    //               x: 100 + Math.random() * 500,
    //               y: 100 + Math.random() * 500
    //             },
    //             {
    //               x: 100 + Math.random() * 500,
    //               y: 100 + Math.random() * 500
    //             },
    //             {
    //               x: 100 + Math.random() * 500,
    //               y: 100 + Math.random() * 500
    //             }
    //           ],
    //           color: "red"
    //           // color: Util.rgb2hex(
    //           //   hsvToRgb(Math.random(), 0.5, 0.9).map(v => v / 256)
    //           // )
    //         });
    //       }}
    //     >
    //       Add poly
    //     </button>
    //     <div style={{ maxHeight: 200, overflowY: "scroll" }}>
    //       {[...data.polys.values()].map((v, i) => (
    //         <div key={i}>
    //           {i}
    //           {"\t"}
    //           <button
    //             className="button"
    //             style={{ display: "inline" }}
    //             onClick={() => data.deletePoly(v.id)}
    //           >
    //             X
    //           </button>
    //         </div>
    //       ))}
    //     </div>
    //   </>
    // );
  }
}
*/

@inject("store")
@observer
class AddShapeButton extends React.Component<{ store?: Store }> {
  onClickButton = () => {
    this.props.store!.setShapeEditing(true);
  };

  render() {
    return (
      <button
        style={{
          position: "absolute",
          bottom: 15,
          right: 15
        }}
        className="button is-large"
        onClick={this.onClickButton}
      >
        <span className="icon">+</span>
      </button>
    );
  }
}

// @inject("store")
// @observer
// class IdText extends React.Component<{ store?: Store }> {
//   render() {
//     const { clientId, setClientId } = this.props.store!;
//     return (
//       <label style={{ display: "block" }}>
//         Name
//         <input
//           type="text"
//           value={clientId}
//           onChange={ev => setClientId(ev.target.value)}
//         />
//       </label>
//     );
//   }
// }

// @inject("store")
// @observer
// class DataField extends React.Component<{ store?: Store }> {
//   render() {
//     const { data } = this.props.store!;
//     return (
//       <>
//         <button
//           onClick={() => {
//             data.addSprite({
//               x: 100 + Math.random() * 500,
//               y: 100 + Math.random() * 500,
//               width: 200,
//               height: 200,
//               color: Util.rgb2hex(
//                 hsvToRgb(Math.random(), 0.5, 0.9).map(v => v / 256)
//               )
//             });
//           }}
//         >
//           Add sprite
//         </button>
//         <div style={{ maxHeight: 200, overflowY: "scroll" }}>
//           {[...data.sprites.values()].map((v, i) => (
//             <div key={i}>
//               <button
//                 style={{ display: "inline" }}
//                 onClick={() => data.deleteSprite(v.id)}
//               >
//                 X
//               </button>
//               <pre style={{ display: "inline" }}>{`[${v.x.toFixed(
//                 2
//               )},${v.y.toFixed(2)}]: #${(v.color as number)
//                 .toString(16)
//                 .toUpperCase()}`}</pre>
//             </div>
//           ))}
//         </div>
//       </>
//     );
//   }
// }
