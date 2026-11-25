import { PixelImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("block", 32, 4, 64, 4),
  range("radius", 180, 60, 400, 10),
];
const presets = {
  Standard: {},
  Chunky: { block: 64, radius: 240 },
  Fine: { block: 8, radius: 120 },
};

export function PixelImageDemo() {
  return (
    <Demo
      name="PixelImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <PixelImage className="demo-stage" {...p} />}
    />
  );
}
