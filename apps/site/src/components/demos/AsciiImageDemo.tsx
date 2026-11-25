import { AsciiImage } from "@glimmerui/react";
import { color, range, toggle } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("cell", 10, 6, 24, 1),
  color("color", "#e9e8ee"),
  color("background", "#0e0d12"),
  toggle("colored", true),
];
const presets = {
  Color: {},
  Terminal: { colored: false, color: "#4ade80", background: "#05130a", cell: 8 },
  Chunky: { cell: 20 },
};

export function AsciiImageDemo() {
  return (
    <Demo
      name="AsciiImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <AsciiImage className="demo-stage" {...p} />}
    />
  );
}
