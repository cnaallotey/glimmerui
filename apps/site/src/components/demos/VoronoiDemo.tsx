import { Voronoi } from "@glimmerui/react";
import { color, colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#3b1d8f", "#e0457b", "#f9b44c"]),
  color("line", "#0e0d12"),
  range("scale", 6, 2, 16, 1),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  "Stained glass": {},
  Sea: { colors: ["#082f49", "#0284c7", "#a5f3fc"], line: "#f8fafc" },
  Giraffe: { colors: ["#92400e", "#b45309", "#d97706"], line: "#fef3c7", scale: 5 },
};

export function VoronoiDemo() {
  return (
    <Demo
      name="Voronoi"
      controls={controls}
      presets={presets}
      render={(p) => <Voronoi className="demo-stage" {...p} />}
    />
  );
}
