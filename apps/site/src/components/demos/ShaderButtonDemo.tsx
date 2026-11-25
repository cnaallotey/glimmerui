import { ShaderButton } from "@glimmerui/react";
import { useState } from "react";
import { colors, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  colors("colors", ["#3b1d8f", "#e0457b", "#f9b44c"]),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Sunset: {},
  Lagoon: { colors: ["#0f766e", "#0891b2", "#22c55e"] },
  Ink: { colors: ["#0e0d12", "#3f3d49", "#8b8a94"] },
};

export function ShaderButtonDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <Demo
      name="ShaderButton"
      controls={controls}
      presets={presets}
      children="Get started"
      sized={false}
      hint="Try it with the keyboard too: Tab to it, then Enter."
      render={(p) => (
        <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
          <ShaderButton {...p} onClick={() => setClicks((n) => n + 1)}>
            {clicks === 0 ? "Get started" : `Clicked ${clicks} ${clicks === 1 ? "time" : "times"}`}
          </ShaderButton>
        </div>
      )}
    />
  );
}
