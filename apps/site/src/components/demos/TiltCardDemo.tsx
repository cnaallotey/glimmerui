import { TiltCard } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("maxTilt", 0.4, 0, 0.8, 0.05),
  range("radius", 20, 0, 48, 1),
  range("glare", 1, 0, 1, 0.05),
];
const presets = {
  Standard: {},
  Gentle: { maxTilt: 0.15, glare: 0.4 },
  Flashy: { maxTilt: 0.75, radius: 40 },
};

export function TiltCardDemo() {
  return (
    <Demo
      name="TiltCard"
      controls={controls}
      presets={presets}
      image={{ src: "/demo.png", alt: "Test pattern of a grid and rings" }}
      render={(p) => (
        <div className="demo-stage demo-stage--card">
          <TiltCard {...p} style={{ width: "min(100%, 30rem)", aspectRatio: "3 / 2" }} />
        </div>
      )}
    />
  );
}
