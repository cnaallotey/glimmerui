import { useState } from "react";
import { withBase } from "@/lib/url";
import { KaleidoscopeImage } from "@glimmerui/react";
import { Range } from "./Range";

export function KaleidoscopeImageDemo() {
  const [segments, setSegments] = useState(8);
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <KaleidoscopeImage
        className="demo-stage"
        src={withBase("/demo.png")}
        alt="A kaleidoscope pattern made from a grid-and-rings test image"
        segments={segments}
        speed={speed}
      />
      <div className="demo-controls">
        <Range label="segments" value={segments} min={2} max={16} step={1} onChange={setSegments} />
        <Range label="speed" value={speed} min={0} max={4} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
