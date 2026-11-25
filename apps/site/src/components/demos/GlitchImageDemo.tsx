import { GlitchImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("strength", 1, 0, 2, 0.1),
];
const presets = {
  Standard: {},
  Nudge: { strength: 0.4 },
  Broken: { strength: 2 },
};

export function GlitchImageDemo() {
  return (
    <Demo
      name="GlitchImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <GlitchImage className="demo-stage" {...p} />}
    />
  );
}
