import { ShaderGradient } from "@glimmerui/react";

type Palette = [string, string, string];

const palettes: Palette[] = [
  ["#3b1d8f", "#e0457b", "#f9b44c"],
  ["#0f766e", "#22d3ee", "#a7f3d0"],
  ["#7c2d12", "#f97316", "#fde68a"],
  ["#1e3a8a", "#6366f1", "#f0abfc"],
  ["#14532d", "#84cc16", "#fef08a"],
  ["#4c0519", "#e11d48", "#fda4af"],
  ["#0c4a6e", "#0ea5e9", "#e0f2fe"],
  ["#312e81", "#a855f7", "#fbcfe8"],
  ["#422006", "#ca8a04", "#fef3c7"],
  ["#134e4a", "#2dd4bf", "#ccfbf1"],
  ["#3b0764", "#d946ef", "#fae8ff"],
  ["#1a1538", "#e0457b", "#f9b44c"],
];

/** Twelve live gradients, all drawn through the page's single WebGL context. */
export function SwatchGrid() {
  return (
    <div className="mk-swatches">
      {palettes.map((colors, i) => (
        <ShaderGradient
          key={colors.join()}
          className="mk-swatch"
          colors={colors}
          speed={0.6 + (i % 4) * 0.35}
          data-glimmer=""
        />
      ))}
    </div>
  );
}
