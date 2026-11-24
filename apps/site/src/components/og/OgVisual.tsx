import type { CSSProperties, ReactNode } from "react";
import {
  AsciiImage,
  Aurora,
  Caustics,
  ContourLines,
  DitherImage,
  DotGrid,
  DuotoneImage,
  FogImage,
  GlitchImage,
  GridFloor,
  HalftoneImage,
  HoloCard,
  ImageDistortion,
  ImageReveal,
  InkSmoke,
  KaleidoscopeImage,
  LensImage,
  LiquidMetal,
  MeshGradient,
  Particles,
  PixelImage,
  ShaderButton,
  ShaderGradient,
  ShaderText,
  Silk,
  SpotlightCard,
  Starfield,
  TiltCard,
  Voronoi,
} from "@glimmerui/react";
import { withBase } from "../../lib/url";

const fill: CSSProperties = { position: "absolute", inset: 0 };
const card: CSSProperties = { width: "118%", aspectRatio: "3 / 2" };
const grid = withBase("/demo.png");
const warm = withBase("/demo-alt.png");
const spheres = withBase("/demo-spheres.png");

/** The pane on the right of a social card: the page's own effect where it has one. */
export function OgVisual({ component }: { component?: string }) {
  const [content, tone]: [ReactNode, "light" | "night"] = (() => {
    switch (component) {
      case "shader-gradient": return [<ShaderGradient style={fill} />, "light"];
      case "image-distortion": return [<ImageDistortion src={grid} alt="" style={fill} />, "light"];
      case "tilt-card": return [<TiltCard src={warm} alt="" style={card} />, "light"];
      case "image-reveal": return [<ImageReveal src={grid} revealSrc={warm} alt="" style={fill} />, "light"];
      case "lens-image": return [<LensImage src={warm} alt="" style={fill} />, "light"];
      case "aurora": return [<Aurora style={fill} intensity={0.6} />, "night"];
      case "dot-grid": return [<DotGrid style={fill} />, "light"];
      case "liquid-metal": return [<LiquidMetal style={fill} />, "light"];
      case "particles": return [<Particles style={fill} />, "night"];
      case "halftone-image": return [<HalftoneImage src={spheres} alt="" style={fill} />, "light"];
      case "pixel-image": return [<PixelImage src={spheres} alt="" style={fill} />, "light"];
      case "mesh-gradient": return [<MeshGradient style={fill} />, "light"];
      case "silk": return [<Silk style={fill} />, "light"];
      case "caustics": return [<Caustics style={fill} />, "night"];
      case "contour-lines": return [<ContourLines style={fill} />, "light"];
      case "starfield": return [<Starfield style={fill} />, "night"];
      case "voronoi": return [<Voronoi style={fill} />, "light"];
      case "grid-floor": return [<GridFloor style={fill} />, "night"];
      case "ink-smoke": return [<InkSmoke style={fill} />, "night"];
      case "glitch-image": return [<GlitchImage src={grid} alt="" style={fill} />, "light"];
      case "dither-image": return [<DitherImage src={spheres} alt="" style={fill} />, "light"];
      case "ascii-image": return [<AsciiImage src={spheres} alt="" colored style={fill} />, "night"];
      case "duotone-image": return [<DuotoneImage src={spheres} alt="" style={fill} />, "light"];
      case "fog-image": return [<FogImage src={warm} alt="" style={fill} />, "light"];
      case "kaleidoscope-image": return [<KaleidoscopeImage src={warm} alt="" style={fill} />, "light"];
      case "holo-card": return [<HoloCard src={spheres} alt="" style={card} />, "light"];
      case "spotlight-card":
        return [
          <SpotlightCard radius={20} style={{ width: "78%", padding: "36px", color: "#e9e8ee", fontSize: "26px" }}>
            <strong style={{ display: "block", fontSize: "34px", marginBottom: "10px" }}>Pro plan</strong>
            The border lights up near the pointer.
          </SpotlightCard>,
          "night",
        ];
      case "shader-button":
        return [<ShaderButton style={{ fontSize: "30px", padding: "24px 44px" }}>Start free trial</ShaderButton>, "night"];
      case "shader-text":
        return [<ShaderText text="Glimmer" style={{ fontSize: "96px", fontWeight: 600, letterSpacing: "-0.04em" }} />, "night"];
      default:
        return [<ShaderGradient style={fill} colors={["#121117", "#9ea0a8", "#f4f4f6"]} speed={0.7} />, "light"];
    }
  })();
  return <div className={`og-visual og-visual--${tone}`}>{content}</div>;
}
