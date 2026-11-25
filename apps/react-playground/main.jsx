import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AsciiImage,
  Aurora,
  BorderBeam,
  Caustics,
  ContourLines,
  CursorTrail,
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
  ImageTransition,
  InkSmoke,
  KaleidoscopeImage,
  LensImage,
  LightRays,
  LiquidMetal,
  MeshGradient,
  Particles,
  PixelImage,
  Plasma,
  RainImage,
  RippleImage,
  ScrollImage,
  ShaderButton,
  ShaderGradient,
  ShaderText,
  Silk,
  SpotlightCard,
  Starfield,
  TiltCard,
  Voronoi,
  useScrollProgress,
} from "@glimmerui/react";

// ?stress=24 renders many effects at once to prove they share one WebGL context.
const stress = Number(new URLSearchParams(location.search).get("stress")) || 0;

function Stress({ count }) {
  const palettes = [
    ["#3b1d8f", "#e0457b", "#f9b44c"],
    ["#0f766e", "#22d3ee", "#a7f3d0"],
    ["#7c2d12", "#f97316", "#fde68a"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <ShaderGradient
          key={i}
          className="stress"
          colors={palettes[i % palettes.length]}
          speed={0.5 + (i % 5) * 0.3}
        />
      ))}
    </div>
  );
}

const slides = [
  { src: "/demo.png", alt: "Cool test pattern" },
  { src: "/demo-spheres.png", alt: "Spheres" },
  { src: "/demo-alt.png", alt: "Warm test pattern" },
];

function Slides({ effect }) {
  const [index, setIndex] = useState(0);
  return (
    <ImageTransition className="card" images={slides} index={index} effect={effect}>
      <button type="button" onClick={() => setIndex((index + 1) % slides.length)}>
        {effect}: next
      </button>
    </ImageTransition>
  );
}

function ScrollStory() {
  const ref = useRef(null);
  const progress = useScrollProgress(ref, { range: "within" });
  return (
    <section ref={ref} style={{ height: "300vh" }}>
      <ImageTransition
        className="card"
        style={{ position: "sticky", top: 0 }}
        images={slides}
        effect="wipe"
        progress={progress * (slides.length - 1)}
      />
    </section>
  );
}

createRoot(document.getElementById("root")).render(
  stress ? (
    <Stress count={stress} />
  ) : (
    <>
      <ShaderGradient className="card">
        <h1>Glimmer on React</h1>
      </ShaderGradient>
      <ShaderGradient className="card" colors={["#0f766e", "#22d3ee", "#a7f3d0"]} speed={1.5}>
        <h1>Another palette</h1>
      </ShaderGradient>
      <ImageDistortion className="card" src="/demo.png" alt="Demo artwork" />
      <TiltCard className="card" src="/demo.png" alt="Demo artwork" />
      <ImageReveal className="card" src="/demo.png" revealSrc="/demo-alt.png" alt="Two test patterns" />
      <LensImage className="card" src="/demo-alt.png" alt="Warm test pattern" />
      <Aurora className="card">
        <h1>Aurora</h1>
      </Aurora>
      <DotGrid className="card" style={{ background: "#f1f3f7" }}>
        <h1 style={{ color: "#1a1538" }}>DotGrid</h1>
      </DotGrid>
      <LiquidMetal className="card">
        <h1>LiquidMetal</h1>
      </LiquidMetal>
      <Particles className="card" style={{ background: "#fafafa" }}>
        <h1 style={{ color: "#0e0d12" }}>Particles</h1>
      </Particles>
      <HalftoneImage className="card" src="/demo-spheres.png" alt="Spheres as a halftone" />
      <PixelImage className="card" src="/demo-spheres.png" alt="Spheres as a mosaic" />
      <MeshGradient className="card"><h1>MeshGradient</h1></MeshGradient>
      <Silk className="card"><h1>Silk</h1></Silk>
      <Caustics className="card"><h1>Caustics</h1></Caustics>
      <ContourLines className="card" style={{ background: "#fafafa" }}><h1 style={{ color: "#0e0d12" }}>ContourLines</h1></ContourLines>
      <Starfield className="card"><h1>Starfield</h1></Starfield>
      <Voronoi className="card"><h1>Voronoi</h1></Voronoi>
      <GridFloor className="card"><h1>GridFloor</h1></GridFloor>
      <InkSmoke className="card"><h1>InkSmoke</h1></InkSmoke>
      <GlitchImage className="card" src="/demo-spheres.png" alt="Spheres, glitching" />
      <DitherImage className="card" src="/demo-spheres.png" alt="Spheres in dither" />
      <AsciiImage className="card" src="/demo-spheres.png" alt="Spheres in text" />
      <DuotoneImage className="card" src="/demo-spheres.png" alt="Spheres in duotone" />
      <FogImage className="card" src="/demo-spheres.png" alt="Spheres behind fog" />
      <KaleidoscopeImage className="card" src="/demo.png" alt="Kaleidoscope pattern" />
      <HoloCard className="card" src="/demo-spheres.png" alt="Holographic card" />
      <SpotlightCard className="card" style={{ background: "#0e0d12", padding: 24 }}><h1>SpotlightCard</h1></SpotlightCard>
      <div className="card" style={{ background: "#0e0d12" }}><ShaderButton>ShaderButton</ShaderButton></div>
      <div className="card" style={{ background: "#0e0d12" }}><h1><ShaderText text="ShaderText" /></h1></div>
      <CursorTrail />
      <LightRays className="card"><h1>LightRays</h1></LightRays>
      <Plasma className="card"><h1>Plasma</h1></Plasma>
      <BorderBeam className="card" radius={24} style={{ borderRadius: 24 }}><h1>BorderBeam</h1></BorderBeam>
      <RainImage className="card" src="/demo-alt.png" alt="Pattern behind a rainy window" />
      <RippleImage className="card" src="/demo-spheres.png" alt="Spheres under water" />
      <ScrollImage className="card" src="/demo.png" alt="Test pattern that bends while scrolling" />
      <Slides effect="dissolve" />
      <Slides effect="wipe" />
      <Slides effect="blocks" />
      <Slides effect="ripple" />
      <Slides effect="zoom" />
      <ImageTransition className="card" images={slides} scroll effect="ripple" />
      <ImageReveal className="card" src="/demo.png" revealSrc="/demo-alt.png" scroll alt="Reveals on scroll" />
      <HalftoneImage className="card" src="/demo-video.mp4" alt="Halftone video" />
      <AsciiImage className="card" src="/demo-video.mp4" colored alt="Video in text" />
      <TiltCard className="card" src="/demo-video.mp4" alt="Tilting video" />
      <RainImage className="card" src="/demo-video.mp4" paused alt="Paused video" />
      <ScrollStory />
    </>
  )
);
