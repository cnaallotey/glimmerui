import { useState } from "react";
import { ImageTransition, type TransitionEffect } from "@glimmerui/react";
import { withBase } from "../../lib/url";

const images = [
  { src: withBase("/demo-spheres.png"), alt: "Four glossy colored spheres on a studio floor" },
  { src: withBase("/demo.png"), alt: "A grid and rings on blue" },
  { src: withBase("/demo-alt.png"), alt: "A violet disc on a warm dotted pattern" },
];
const effects: TransitionEffect[] = ["dissolve", "blocks", "ripple", "wipe", "zoom"];

/** A slideshow that plays a different transition each time. */
export function TransitionPanel() {
  const [step, setStep] = useState(0);
  return (
    <>
      <ImageTransition
        className="mk-panel-media"
        images={images}
        index={step % images.length}
        effect={effects[(step + effects.length - 1) % effects.length]}
        data-glimmer=""
      />
      <button type="button" className="mk-btn mk-panel-btn" onClick={() => setStep(step + 1)}>
        Next image
      </button>
    </>
  );
}
