import React from "react";

interface StackingContextProps {
  style?: React.CSSProperties;
  interactionEnabled?: boolean;
  zIndex: number;
  children: any;
}

export default function StackingContext({
  style,
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
        ...style
      }}
    >
      <div style={{ pointerEvents: pointerEvents }}>{children}</div>
    </div>
  );
}
