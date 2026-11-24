import { useState } from "react";
import { Voronoi } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

type Palette = [string, string, string];

export function VoronoiDemo() {
  const [colors, setColors] = useState<Palette>(["#3b1d8f", "#e0457b", "#f9b44c"]);
  const [line, setLine] = useState("#0e0d12");
  const [scale, setScale] = useState(6);
  const [speed, setSpeed] = useState(1);
  const setColor = (i: number, value: string) =>
    setColors((c) => c.map((v, j) => (j === i ? value : v)) as Palette);
  return (
    <div className="demo not-content">
      <Voronoi className="demo-stage" colors={colors} line={line} scale={scale} speed={speed} />
      <div className="demo-controls">
        {colors.map((color, i) => (
          <ColorInput key={i} label={`Color ${i + 1}`} value={color} onChange={(v) => setColor(i, v)} />
        ))}
        <ColorInput label="line" value={line} onChange={setLine} />
        <Range label="scale" value={scale} min={2} max={16} step={1} onChange={setScale} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
