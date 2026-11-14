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
- URL hash options: `#type=4&scale=0.5&orbit=0&auto=0&pal=2&kal=8&director=1&theme=1&look=2&q=0`.

## Themes
- **Neon**: the original look, frozen as a named theme. Cosine palettes, volumetric halo, heavy bloom and chromatic aberration on a dark void. Palettes: Rainbow, Sunset, Ocean, Ember, Vapor, Toxic.
- **Realistic**: GGX physically based materials under a procedural sky and sun, with ambient occlusion, soft shadows, a mirror-pool floor that reflects the fractal, and restrained bloom. Looks: Bronze · golden hour, Marble · overcast, Gold · dusk, Ice · moonlight. The music drives geometry, sun flicker, roughness, and ember glow in the crevices.
- **Custom ★**: "Save my look" stores your current theme, palette, hue and sliders, and Custom ★ restores them.
- **T** switches theme and **C** cycles the palette or look.

## Morphing between fractals
Switching fractal now **morphs** by default. The two distance fields are cross-faded while space itself mirror-folds and twists, peaking mid-transition, so the first fractal folds in on itself and unfolds into the next. It lasts about four beats (derived from the detected BPM). Every fractal is rendered in one shared normalised frame so the blend lines up, and each keeps its own live audio parameters during the blend. The "Transition" menu also offers Dissolve (noise dissolve between frames) and Cut. Auto-cycle and the drop detector both use whichever mode is selected.

## iPhone Pro tuning
Detected automatically (iPhone/iPad with a 2× or 3× screen). Compared with generic phones:
- Canvas at up to 2× device pixels (was 1×).
- Fractal pass at 0.62 of that, which is roughly 0.5 megapixels on a Pro-size screen.
- An unsharp pass in the composite restores edge crispness lost to the lower scene resolution. Its strength follows the current render scale.
- Quality Medium, with a 60 fps cap, since ProMotion would otherwise try for 120 and double the load. Frame cap is a menu option (30 / 60 / Max).
- Auto-res adapts the scene scale to hold the frame-rate target. It lowers resolution if frames get slow and creeps it back up if there is headroom.
- Old low-resolution settings saved by earlier versions are discarded automatically (settings schema version).
- If it runs smoothly, raise **Resolution** or **Quality** in the menu. The status line shows fps and scene size.

## Phone / tablet
- Touch layout with a ☰ menu and bottom sheet. One finger orbits and two fingers pinch-zoom. The screen is kept awake while audio plays.
- Phones default to Quality = Low and render scale 0.5, and Auto-res keeps the frame rate up. Raise Quality or Resolution in the menu on a fast phone.
- On phones, use the demo beat, a file, or the microphone (needs HTTPS). Tab/system-audio capture isn't available on mobile browsers, so that button is hidden.
- On iOS, Web Audio follows the ringer switch, so unmute if you hear nothing.

## Fractals
Mandelbulb · Juliabulb · Tricorn bulb · Burning-ship bulb · Quaternion Julia · Mandelbox · Menger sponge · Sierpinski tetrahedron · Apollonian packing · Box-folded bulb · Octahedron KIFS · Pseudo-Kleinian · Quaternion Mandelbrot · Menger×Tetra hybrid.

See **RESEARCH.md** for the math, the audio mapping, and notes on what was and wasn't tested.

## Hacking
- `index.html` has two parts: the GLSL in `<script id="fs">`, and the audio analysis plus `params()` in the main script.
- To add a fractal: write `deMyThing(vec3 p)`, which must set `gTrap` and return a distance, then branch to it in `map()`. Add an entry to `TYPES` and a `case` in `params()`.
