---
"@glimmerui/core": patch
---

Fix hard seams that could appear along the noise grid, most visibly as vertical edges in Aurora's curtains. Some GPU drivers computed a shared grid point differently from each neighbouring cell. ContourLines, Voronoi, Caustics and every other effect built on `noiseChunk` get the same fix. `noiseChunk` now also provides `gridPoint()`: wrap grid points in it before hashing them in your own shaders.
