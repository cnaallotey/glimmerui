import { useState } from "react";
import { HalftoneImage } from "@glimmerui/react";
import { Range } from "./Range";

export function HalftoneImageDemo() {
  const [cell, setCell] = useState(8);
  const [ink, setInk] = useState("#0e0d12");
  const [paper, setPaper] = useState("#fafafa");
  const [radius, setRadius] = useState(140);
  return (
    <div className="demo not-content">
      <HalftoneImage
        className="demo-stage"
        src="/demo-spheres.png"
        alt="Four glossy colored spheres on a studio floor"
        cell={cell}
        ink={ink}
        paper={paper}
        radius={radius}
      />
      <div className="demo-controls">
        <Range label="cell" value={cell} min={4} max={24} step={1} onChange={setCell} />
        <label>
          ink
          <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} />
        </label>
        <label>
          paper
          <input type="color" value={paper} onChange={(e) => setPaper(e.target.value)} />
        </label>
        <Range label="radius" value={radius} min={40} max={320} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
