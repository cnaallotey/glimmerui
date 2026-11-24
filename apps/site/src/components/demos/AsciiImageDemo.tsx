import { useState } from "react";
import { AsciiImage } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function AsciiImageDemo() {
  const [cell, setCell] = useState(10);
  const [color, setColor] = useState("#e9e8ee");
  const [background, setBackground] = useState("#0e0d12");
  const [colored, setColored] = useState(true);
  return (
    <div className="demo not-content">
      <AsciiImage
        className="demo-stage"
        src="/demo-spheres.png"
        alt="Four glossy colored spheres on a studio floor"
        cell={cell}
        color={color}
        background={background}
        colored={colored}
      />
      <div className="demo-controls">
        <Range label="cell" value={cell} min={6} max={24} step={1} onChange={setCell} />
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="background" value={background} onChange={setBackground} />
        <label>
          colored
          <input type="checkbox" checked={colored} onChange={(e) => setColored(e.target.checked)} />
        </label>
      </div>
    </div>
  );
}
