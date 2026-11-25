import { ImageDistortion } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("strength", 1, 0, 2, 0.1),
];
const presets = {
  Standard: {},
  Subtle: { strength: 0.4 },
  Strong: { strength: 2 },
};

export function ImageDistortionDemo() {
  return (
    <Demo
      name="ImageDistortion"
      controls={controls}
      presets={presets}
      image={{ src: "/demo.png", alt: "Test pattern of a grid and rings" }}
      render={(p) => <ImageDistortion className="demo-stage" {...p} />}
    />
  );
}
