import { HalftoneImage } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("cell", 8, 4, 24, 1),
  color("ink", "#0e0d12"),
  color("paper", "#fafafa"),
  range("radius", 140, 40, 320, 10),
];
const presets = {
  Newsprint: {},
  Riso: { cell: 10, ink: "#e0457b", paper: "#fff7ed" },
  Poster: { cell: 20, ink: "#3b1d8f", paper: "#f9b44c" },
};

export function HalftoneImageDemo() {
  return (
    <Demo
      name="HalftoneImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <HalftoneImage className="demo-stage" {...p} />}
    />
  );
}
