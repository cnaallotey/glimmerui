import { DuotoneImage } from "@glimmerui/react";
import { color } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("dark", "#3b1d8f"),
  color("light", "#f9b44c"),
];
const presets = {
  Sunset: {},
  Forest: { dark: "#052e16", light: "#bef264" },
  Ice: { dark: "#0c1a4b", light: "#e0f2fe" },
};

export function DuotoneImageDemo() {
  return (
    <Demo
      name="DuotoneImage"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a studio floor" }}
      render={(p) => <DuotoneImage className="demo-stage" {...p} />}
    />
  );
}
