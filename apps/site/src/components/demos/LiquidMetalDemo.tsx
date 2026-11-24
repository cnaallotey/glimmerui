import { useState } from "react";
import { LiquidMetal } from "@glimmerui/react";
import { Range } from "./Range";

export function LiquidMetalDemo() {
  const [count, setCount] = useState(6);
  const [tint, setTint] = useState("#ffffff");
  const [background, setBackground] = useState("#0e0d12");
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <LiquidMetal className="demo-stage" count={count} tint={tint} background={background} speed={speed} />
      <div className="demo-controls">
        <Range label="count" value={count} min={1} max={12} step={1} onChange={setCount} />
        <label>
          tint
          <input type="color" value={tint} onChange={(e) => setTint(e.target.value)} />
        </label>
        <label>
          background
          <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
        </label>
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
