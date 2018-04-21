import React from "react";

interface StackingContextProps {
  layerStyle?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
  interactionEnabled?: boolean;
  zIndex: number;
  children: any;
}

export default function StackingContext({
  layerStyle,
  innerStyle,
  zIndex,
  children,
  interactionEnabled
}: StackingContextProps) {
  let pointerEvents = "auto";
  if (interactionEnabled === false) {
    pointerEvents = "none";
  }
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex,
        pointerEvents: "none",
        ...layerStyle
      }}
    >
      <div
        style={{
          display: "inline-block",
          pointerEvents: pointerEvents,
          ...innerStyle
        }}
      >
        {children}
      </div>
    </div>
  );
}
