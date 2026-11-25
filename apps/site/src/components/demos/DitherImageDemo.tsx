import { DitherImage } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("pixel", 2, 1, 8, 1),
  color("ink", "#0e0d12"),
  color("paper", "#fafafa"),
  range("radius", 140, 40, 320, 10),
];
const presets = {
  Mono: {},
  Handheld: { pixel: 4, ink: "#0f380f", paper: "#9bbc0f" },
  Blueprint: { pixel: 3, ink: "#dbeafe", paper: "#1e3a8a" },
};

export function DitherImageDemo() {
  return (
    <Demo
      name="DitherImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <DitherImage className="demo-stage" {...p} />}
    />
  );
}
