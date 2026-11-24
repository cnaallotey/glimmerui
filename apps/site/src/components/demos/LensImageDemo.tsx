import { useState } from "react";
import { LensImage } from "@glimmerui/react";
import { Range } from "./Range";

export function LensImageDemo() {
  const [zoom, setZoom] = useState(1.75);
  const [size, setSize] = useState(96);
  const [fringe, setFringe] = useState(1);
  return (
    <div className="demo not-content">
      <LensImage
        className="demo-stage"
        src="/demo-alt.png"
        alt="A warm dotted test pattern with a violet disc"
        zoom={zoom}
        size={size}
        fringe={fringe}
      />
      <div className="demo-controls">
        <Range label="zoom" value={zoom} min={1} max={4} step={0.25} onChange={setZoom} />
        <Range label="size" value={size} min={40} max={200} step={4} onChange={setSize} />
        <Range label="fringe" value={fringe} min={0} max={1} step={0.05} onChange={setFringe} />
      </div>
    </div>
  );
}
