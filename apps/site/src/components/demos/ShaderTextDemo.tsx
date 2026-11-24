import { useId, useState } from "react";
import { ShaderText } from "@glimmerui/react";

export function ShaderTextDemo() {
  const [text, setText] = useState("Glimmer");
  const id = useId();
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
        <ShaderText
          text={text}
          style={{ fontSize: "clamp(3rem, 9vw, 6rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
        />
      </div>
      <div className="demo-controls">
        <label htmlFor={id}>
          text
          <input id={id} value={text} onChange={(e) => setText(e.target.value)} style={{ width: "12rem" }} />
        </label>
      </div>
    </div>
  );
}
