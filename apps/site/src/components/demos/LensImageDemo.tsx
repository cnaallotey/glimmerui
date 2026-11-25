import { LensImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("zoom", 1.75, 1, 4, 0.25),
  range("size", 96, 40, 200, 4),
  range("fringe", 1, 0, 1, 0.05),
];
const presets = {
  Magnifier: {},
  Loupe: { zoom: 3.5, size: 64 },
  Fisheye: { zoom: 2.25, size: 190, fringe: 0.3 },
};

export function LensImageDemo() {
  return (
    <Demo
      name="LensImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-alt.png", alt: "A warm dotted test pattern with a violet disc" }}
      render={(p) => <LensImage className="demo-stage" {...p} />}
    />
  );
}
