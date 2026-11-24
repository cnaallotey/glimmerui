import { useState } from "react";
import { withBase } from "@/lib/url";
import { FogImage } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function FogImageDemo() {
  const [frost, setFrost] = useState(1);
  const [tint, setTint] = useState("#f4f4f6");
  const [radius, setRadius] = useState(120);
  return (
    <div className="demo not-content">
      <FogImage
        className="demo-stage"
        src={withBase("/demo-spheres.png")}
        alt="Four glossy colored spheres on a studio floor"
        frost={frost}
        tint={tint}
        radius={radius}
      />
      <div className="demo-controls">
        <Range label="frost" value={frost} min={0} max={1} step={0.05} onChange={setFrost} />
        <ColorInput label="tint" value={tint} onChange={setTint} />
        <Range label="radius" value={radius} min={40} max={300} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
