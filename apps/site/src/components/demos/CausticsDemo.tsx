import { useState } from "react";
import { Caustics } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function CausticsDemo() {
  const [deep, setDeep] = useState("#06283d");
  const [shallow, setShallow] = useState("#1b8fa6");
  const [light, setLight] = useState("#e6fbff");
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <Caustics className="demo-stage" deep={deep} shallow={shallow} light={light} speed={speed} />
      <div className="demo-controls">
        <ColorInput label="deep" value={deep} onChange={setDeep} />
        <ColorInput label="shallow" value={shallow} onChange={setShallow} />
        <ColorInput label="light" value={light} onChange={setLight} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
