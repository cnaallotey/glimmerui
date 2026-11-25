import { RippleImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("strength", 1, 0, 2, 0.1),
  range("speed", 1, 0.2, 3, 0.1),
];
const presets = {
  Pond: {},
  Still: { strength: 0.5, speed: 0.6 },
  Choppy: { strength: 1.7, speed: 1.7 },
};

export function RippleImageDemo() {
  return (
    <Demo
      name="RippleImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      hint="Move over the image, then click it."
      render={(p) => <RippleImage className="demo-stage" {...p} />}
    />
  );
}
