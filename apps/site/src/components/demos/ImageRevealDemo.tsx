import { ImageReveal } from "@glimmerui/react";
import { withBase } from "@/lib/url";
import { range, select } from "./controls";
import { Demo } from "./Demo";

const controls = [select("driver", "hover", ["hover", "scroll", "progress"]), range("progress", 0.5, 0, 1, 0.01)];

export function ImageRevealDemo() {
  return (
    <Demo
      name="ImageReveal"
      controls={controls}
      fixed={{ src: "/before.jpg", revealSrc: "/after.jpg", alt: "Describe both here" }}
      codeProps={({ driver, progress }) =>
        driver === "hover" ? {} : driver === "scroll" ? { scroll: true } : { progress }
      }
      hint="Hover or tap the image, scroll the page, or drag progress."
      render={({ driver, progress }) => (
        <ImageReveal
          className="demo-stage"
          src={withBase("/demo.png")}
          revealSrc={withBase("/demo-alt.png")}
          alt="A cool grid-and-rings test pattern that dissolves into a warm dotted one"
          scroll={driver === "scroll"}
          progress={driver === "progress" ? progress : undefined}
        />
      )}
    />
  );
}
