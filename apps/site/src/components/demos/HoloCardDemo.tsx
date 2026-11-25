import { HoloCard } from "@glimmerui/react";
import { range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  range("foil", 0.8, 0, 1, 0.05),
  range("maxTilt", 0.4, 0, 0.8, 0.05),
  range("radius", 20, 0, 48, 1),
];
const presets = {
  Standard: {},
  Faint: { foil: 0.3 },
  Rare: { foil: 1, maxTilt: 0.6 },
};

export function HoloCardDemo() {
  return (
    <Demo
      name="HoloCard"
      controls={controls}
      presets={presets}
      image={{ src: "/demo-spheres.png", alt: "Four glossy colored spheres on a holographic card" }}
      render={(p) => (
        <div className="demo-stage demo-stage--card">
          <HoloCard {...p} style={{ width: "min(100%, 30rem)", aspectRatio: "3 / 2" }} />
        </div>
      )}
    />
  );
}
