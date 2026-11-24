import { useState } from "react";
import { withBase } from "@/lib/url";
import { DuotoneImage } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";

export function DuotoneImageDemo() {
  const [dark, setDark] = useState("#3b1d8f");
  const [light, setLight] = useState("#f9b44c");
  return (
    <div className="demo not-content">
      <DuotoneImage
        className="demo-stage"
        src={withBase("/demo-spheres.png")}
        alt="Four glossy colored spheres on a studio floor"
        dark={dark}
        light={light}
      />
      <div className="demo-controls">
        <ColorInput label="dark" value={dark} onChange={setDark} />
        <ColorInput label="light" value={light} onChange={setLight} />
      </div>
    </div>
  );
}
