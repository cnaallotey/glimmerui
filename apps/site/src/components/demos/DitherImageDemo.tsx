import { useState } from "react";
import { DitherImage } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function DitherImageDemo() {
  const [pixel, setPixel] = useState(2);
  const [ink, setInk] = useState("#0e0d12");
  const [paper, setPaper] = useState("#fafafa");
  const [radius, setRadius] = useState(140);
  return (
    <div className="demo not-content">
      <DitherImage
        className="demo-stage"
        src="/demo-spheres.png"
        alt="Four glossy colored spheres on a studio floor"
        pixel={pixel}
        ink={ink}
        paper={paper}
        radius={radius}
      />
      <div className="demo-controls">
        <Range label="pixel" value={pixel} min={1} max={8} step={1} onChange={setPixel} />
        <ColorInput label="ink" value={ink} onChange={setInk} />
        <ColorInput label="paper" value={paper} onChange={setPaper} />
        <Range label="radius" value={radius} min={40} max={320} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
