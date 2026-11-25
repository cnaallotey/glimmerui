import { KaleidoscopeImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("segments", 8, 2, 16, 1),
  range("speed", 1, 0, 4, 0.1),
];
const presets = {
  Eight: {},
  Mirror: { segments: 2, speed: 0.5 },
  Snowflake: { segments: 14, speed: 2 },
};

export function KaleidoscopeImageDemo() {
  return (
    <Demo
      name="KaleidoscopeImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo.png", alt: "A kaleidoscope pattern made from a grid-and-rings test image" }}
      render={(p) => <KaleidoscopeImage className="demo-stage" {...p} />}
    />
  );
}
