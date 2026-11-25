import { ShaderText } from "@glimmerui/react";
import { colors, range, text } from "./controls";
import { Demo } from "./Demo";

const controls = [
  text("text", "Glimmer"),
  colors("colors", ["#3b1d8f", "#e0457b", "#f9b44c"]),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Sunset: {},
  Lagoon: { colors: ["#2dd4bf", "#22d3ee", "#a7f3d0"] },
  Fire: { colors: ["#f43f5e", "#f97316", "#fde047"], speed: 2 },
};

export function ShaderTextDemo() {
  return (
    <Demo
      name="ShaderText"
      controls={controls}
      presets={presets}
      sized={false}
      render={(p) => (
        <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
          <ShaderText
            {...p}
            style={{ fontSize: "clamp(3rem, 9vw, 6rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          />
        </div>
      )}
    />
  );
}
