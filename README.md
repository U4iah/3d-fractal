# Fractal Pulse

Real-time, music-reactive 3D fractals. It is a single file with no build step and no dependencies.

**Run it:** open `index.html` in a modern desktop browser (WebGL2). Chrome, Edge and Firefox work. A GPU is strongly recommended.
Or serve the folder: `python3 -m http.server`, then open http://localhost:8000.

## Use it
- Pick an audio source on the start screen: built-in demo beat, audio file, microphone, or tab/system audio. Tick "Share audio" in the browser's picker for the last one.
- **1–9, 0** pick a fractal (the rest via the panel), **C** cycles palette, **R** randomizes the look, **K** cycles kaleidoscope, **←/→** step, **Space** toggles auto-cycle on beat, **H** hides the panel, **F** is fullscreen, **P** saves a PNG.
- Drag to orbit, scroll to zoom, double-click to toggle the panel.
- The sliders cover sensitivity, motion, glow and resolution. "Cut-away" slices the fractal open. "Auto-res" holds the frame rate.
- Evolved features: HDR bloom, audio-driven twist/bend warp, kaleidoscope, dissolve transitions, BPM tracking, drop detection, **Director** (auto camera/look), saved settings.
- URL hash options: `#type=4&scale=0.5&orbit=0&auto=0&pal=2&kal=8&director=1`.

## Fractals
Mandelbulb · Juliabulb · Tricorn bulb · Burning-ship bulb · Quaternion Julia · Mandelbox · Menger sponge · Sierpinski tetrahedron · Apollonian packing · Box-folded bulb · Octahedron KIFS · Pseudo-Kleinian · Quaternion Mandelbrot · Menger×Tetra hybrid.

See **RESEARCH.md** for the math, the audio mapping, and notes on what was and wasn't tested.

## Hacking
- `index.html` has two parts: the GLSL in `<script id="fs">`, and the audio analysis plus `params()` in the main script.
- To add a fractal: write `deMyThing(vec3 p)`, which must set `gTrap` and return a distance, then branch to it in `map()`. Add an entry to `TYPES` and a `case` in `params()`.
