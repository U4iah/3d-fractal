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

## Performance takes (record the performance, not the pixels)
**Record take** stores the music analysis, camera, spin, dive, fractal changes, theme/material changes and sculpt moves as data at 30 Hz, plus an observation track for external trackers. **Play take** replays it with no audio needed. Load the same song and it plays in sync. Untick *Take's look* to **re-skin** the same performance in your own theme and materials. You can scrub, jump to or delete events, trim, save as `*.fpx.json`, copy as JSON, load or paste a take, and drop a `.json` onto the page. Format, playback rules and the roadmap (offline 4K render, a multi-track editor, a hand-mapping layer) are in **PERFORMANCE.md**.

## Dive mode
**Dive in** (button, or **D**) flies the camera into the fractal's surface. The shader writes ray depth into the alpha channel of the HDR buffer; the page reads back one pixel of it, re-anchors the focus onto the surface under that pixel, and eases the camera toward it, faster on bass hits. Iteration caps rise as you go deeper, so the Menger sponge keeps revealing holes within holes. It cycles in → hold → out → in at a new spot. The fractal's spin is damped while diving. Pinch adjusts distance. Limit: about 100× magnification, where 32-bit floats run out of precision.

## Themes
Neon, Realistic and **Cosmic** (T cycles). Cosmic is a nebula-and-stars sky with iridescent thin-film surfaces that mirror the nebula. In Realistic, metals now reflect the rest of the fractal (one bounce), not just the sky.

## Trails
The **Trails** slider adds video feedback: the previous frame zoomed, rotated and hue-rotated, then decayed. Chaos adds trails automatically.

## Slots, sharing and Show mode
- **Slots 1–6** store a whole look (fractal, theme, palette, sculpt, camera, kaleidoscope, trails…). Tap an empty slot to save and a filled slot to load. Turn on *Store mode* to overwrite.
- **Copy share link** encodes the current state in the URL hash (`#s=…`) for anyone to open. **Copy state JSON** is for tools.
- **Show mode** runs an autonomous VJ set: on beats it changes fractal (with morphs), theme, palette, kaleidoscope and trails; starts and ends dives; and fires chaos bursts, which are bigger on detected drops.

## Events out (for Quinn / coordinators)
The page emits `{fractalPulseEvent:{type,…}}` for `beat`, `drop`, `type` and a `state` snapshot every 0.5 s. It sends them to `window.parent.postMessage`, to any callback registered with `FractalPulse.on(fn)`, and over the WebSocket if `#ws=` is set. `FractalPulse.exportState()` and `applyState(obj)` read and restore a whole look.

## Touch controls
- **One finger:** spin. It has inertia, so a flick keeps going.
- **Two fingers:** pinch to zoom and twist to roll the fractal.
- **Three or more fingers: CHAOS.** The more fingers, and the harder you wiggle, the wilder it gets. It ramps up smoothly (a bar across the top shows the level) and calms when you lift off. Chaos injects audio-like energy into the shape, fires rapid spin kicks, multiplies the space warp, spins the hue, flips on a kaleidoscope, shakes the camera and, if you hold it, morphs into a different fractal every few seconds.
- **Double-tap:** fire a pulse.
- **Sculpt pad:** a thumb XY pad (on by default on phones; toggle in the menu). Shape on X, Detail on Y. It has its own touch, so one thumb can sculpt while the other hand spins.
- **Without music** the fractal holds perfectly still. Shape, Detail, Sparkle and Hue sliders also add on top of music. **Idle motion** brings back gentle drift.
- **Tilt control** (button in the menu): tilt the phone to look around, and shake to pulse. It needs a motion-permission prompt, so it only works when the page is hosted on its own address (see "Hosting" below).

## Morph timeline
A beat-synced journey through fractals. Add steps (fractal + length in beats), then **Play journey**. Each step change is a geometric morph. Options: loop, new palette per step, **All fractals**, **Shuffle**. A detected drop advances the journey early (after at least 4 beats). Your timeline is saved on the device.

## Record clips
**● Record clip** captures the canvas at full resolution together with whatever audio is playing (demo, file, mic or tab), as MP4 where the browser supports it and WebM otherwise. Then **Save clip** opens the iOS share sheet (Save Video, AirDrop, Messages) or downloads the file. Needs the standalone page (see "Hosting").

## Hosting on GitHub Pages (unlocks tilt, recording, mic, installing to the home screen)
1. On GitHub: repo → **Settings → Pages**.
2. **Build and deployment → Source: Deploy from a branch.** Pick the branch (this work is on `claude/vibrant-ramanujan-duq5yk`, or `main` after you merge) and folder **/ (root)**. Save.
3. After about a minute the site is at `https://<your-username>.github.io/3d-fractal/`.
4. On iPhone: open that URL in Safari, then **Share → Add to Home Screen** for a fullscreen app icon. It works offline after the first load.

The repo includes `manifest.webmanifest`, `sw.js`, icons and `.nojekyll` for this.

## Controlling it from outside (for Quinn or any host page)
`window.FractalPulse` exposes `state`, `apply({...})`, `setType(i)`, `setTheme(0|1)` and `pulse()`. `apply` also takes `chaos` (0–1) and `view:{yaw,pitch}` in radians (set `view:null` to release), so a face/hand/eye tracker can drive the camera and the chaos level directly. For a tracker running as a separate program, open the page with `#ws=ws://localhost:8765` and send JSON `{"fractalPulse":{...}}` over a WebSocket. Safari blocks `ws://` from HTTPS pages, so for that case use `postMessage` from a host page, or run the tracker's bridge page over HTTPS. The page also listens for `postMessage({fractalPulse:{type, theme, palette, look, shape, detail, sparkle, hue, zoom, az, el, pulse}}, '*')`. All values are clamped. This makes it easy to drive the visualizer from a coordinator, a dashboard, or a controller page.

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
Mandelbulb · Juliabulb · Tricorn bulb · Burning-ship bulb · Quaternion Julia · Mandelbox · Menger sponge · Sierpinski tetrahedron · Apollonian packing · Box-folded bulb · Octahedron KIFS · Pseudo-Kleinian · Quaternion Mandelbrot · Menger×Tetra hybrid · Icosahedral IFS (dodecahedra at the φ² scale) · Negative-scale Mandelbox · Julibox · Bristorbrot · Cubic Quaternion Julia.

See **RESEARCH.md** for the math, the audio mapping, and notes on what was and wasn't tested.

## Hacking
- `index.html` has two parts: the GLSL in `<script id="fs">`, and the audio analysis plus `params()` in the main script.
- To add a fractal: write `deMyThing(vec3 p)`, which must set `gTrap` and return a distance, then branch to it in `map()`. Add an entry to `TYPES` and a `case` in `params()`.
