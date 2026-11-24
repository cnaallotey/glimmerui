import { useState } from "react";
import { ShaderButton } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";

type Palette = [string, string, string];

export function ShaderButtonDemo() {
  const [colors, setColors] = useState<Palette>(["#3b1d8f", "#e0457b", "#f9b44c"]);
  const [clicks, setClicks] = useState(0);
  const setColor = (i: number, value: string) =>
    setColors((c) => c.map((v, j) => (j === i ? value : v)) as Palette);
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12", gap: "1rem" }}>
        <ShaderButton colors={colors} onClick={() => setClicks((n) => n + 1)}>
          {clicks === 0 ? "Get started" : `Clicked ${clicks} ${clicks === 1 ? "time" : "times"}`}
        </ShaderButton>
      </div>
      <div className="demo-controls">
        {colors.map((color, i) => (
          <ColorInput key={i} label={`Color ${i + 1}`} value={color} onChange={(v) => setColor(i, v)} />
        ))}
        <span>Try it with the keyboard too: Tab to it, then Enter.</span>
      </div>
    </div>
  );
}
