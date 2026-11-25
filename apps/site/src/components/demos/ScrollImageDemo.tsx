import { ScrollImage } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("strength", 1, 0, 2, 0.1),
  range("split", 1, 0, 2, 0.1),
];
const presets = {
  Standard: {},
  Gentle: { strength: 0.5, split: 0.3 },
  Wild: { strength: 2, split: 2 },
};

export function ScrollImageDemo() {
  return (
    <Demo
      name="ScrollImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo.png", alt: "Test pattern of a grid and rings" }}
      hint="Scroll the page quickly to bend it."
      render={(p) => <ScrollImage className="demo-stage" {...p} />}
    />
  );
}
