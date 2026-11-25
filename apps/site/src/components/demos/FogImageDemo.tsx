import { FogImage } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("frost", 1, 0, 1, 0.05),
  color("tint", "#f4f4f6"),
  range("radius", 120, 40, 300, 10),
];
const presets = {
  Frosted: {},
  "Light mist": { frost: 0.4 },
  "Smoked glass": { tint: "#1b1a22", radius: 180 },
};

export function FogImageDemo() {
  return (
    <Demo
      name="FogImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <FogImage className="demo-stage" {...p} />}
    />
  );
}
