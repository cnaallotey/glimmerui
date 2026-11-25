import { Caustics } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("deep", "#06283d"),
  color("shallow", "#1b8fa6"),
  color("light", "#e6fbff"),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Pool: {},
  Reef: { deep: "#042f2e", shallow: "#2dd4bf", light: "#f0fdfa" },
  Sunset: { deep: "#3b0764", shallow: "#fb7185", light: "#fff7ed" },
};

export function CausticsDemo() {
  return (
    <Demo
      name="Caustics"
      controls={controls}
      presets={presets}
      render={(p) => <Caustics className="demo-stage" {...p} />}
    />
  );
}
