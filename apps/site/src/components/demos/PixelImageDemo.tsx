import { useState } from "react";
import { withBase } from "@/lib/url";
import { PixelImage } from "@glimmerui/react";
import { Range } from "./Range";

export function PixelImageDemo() {
  const [block, setBlock] = useState(32);
  const [radius, setRadius] = useState(180);
  return (
    <div className="demo not-content">
      <PixelImage
        className="demo-stage"
        src={withBase("/demo-spheres.png")}
        alt="Four glossy colored spheres on a studio floor"
        block={block}
        radius={radius}
      />
      <div className="demo-controls">
        <Range label="block" value={block} min={4} max={64} step={4} onChange={setBlock} />
        <Range label="radius" value={radius} min={60} max={400} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
