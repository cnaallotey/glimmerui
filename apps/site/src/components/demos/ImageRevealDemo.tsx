import { ImageReveal } from "@glimmerui/react";

export function ImageRevealDemo() {
  return (
    <div className="demo not-content">
      <ImageReveal
        className="demo-stage"
        src="/demo.png"
        revealSrc="/demo-alt.png"
        alt="A cool grid-and-rings test pattern that dissolves into a warm dotted one"
      />
      <div className="demo-controls">
        <span>Hover the image, or tap it on a touch screen.</span>
      </div>
    </div>
  );
}
