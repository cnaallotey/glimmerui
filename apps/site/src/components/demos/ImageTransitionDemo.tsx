import { useState } from "react";
import { ImageTransition } from "@glimmerui/react";
import { withBase } from "@/lib/url";
import { range, select } from "./controls";
import { Demo } from "./Demo";

const controls = [
  select("effect", "dissolve", ["dissolve", "wipe", "blocks", "ripple", "zoom"]),
  range("duration", 1.2, 0.3, 4, 0.1),
  select("driver", "index", ["index", "scroll", "progress"]),
  range("progress", 0.5, 0, 2, 0.01),
];
const images = [
  { src: withBase("/demo.png"), alt: "A grid and rings on blue" },
  { src: withBase("/demo-spheres.png"), alt: "Four glossy colored spheres on a studio floor" },
  { src: withBase("/demo-alt.png"), alt: "A violet disc on a warm dotted pattern" },
];

export function ImageTransitionDemo() {
  const [index, setIndex] = useState(0);
  return (
    <Demo
      name="ImageTransition"
      controls={controls}
      fixed={{
        images: [
          { src: "/one.jpg", alt: "Describe the first" },
          { src: "/two.jpg", alt: "Describe the second" },
        ],
      }}
      codeProps={({ effect, duration, driver, progress }) => ({
        ...(effect === "dissolve" ? {} : { effect }),
        ...(duration === 1.2 ? {} : { duration }),
        ...(driver === "scroll" ? { scroll: true } : driver === "progress" ? { progress } : { index: 0 }),
      })}
      hint="Press Next, scroll the page, or drag progress."
      render={({ effect, duration, driver, progress }) => (
        <ImageTransition
          className="demo-stage demo-stage--end"
          images={images}
          effect={effect}
          duration={duration}
          index={index}
          scroll={driver === "scroll"}
          progress={driver === "progress" ? progress : undefined}
        >
          {driver === "index" && (
            <button type="button" className="demo-toggle" onClick={() => setIndex((index + 1) % images.length)}>
              Next
            </button>
          )}
        </ImageTransition>
      )}
    />
  );
}
