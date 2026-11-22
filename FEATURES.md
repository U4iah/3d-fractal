# Fractal Pulse: feature inventory

The single source of truth for what exists. **Status key:** ✅ implemented and checked in the simulated regression suite (`tests/regression.js`, software GL, simulated input) · 📱 implemented but **needs real iPhone/desktop-GPU testing** · 🧪 partly verified · 📝 proposed only (not built) · ⛔ known gap.

Baseline checkpoint before the Quinn Proxy expansion: commit `c117de0` (local annotated tag `checkpoint-pre-expansion-c117de0`; pushing tags is blocked in this environment, but the commit is in the remote branch history, so `git checkout c117de0` recovers it).

## Instrument
| Area | Capability | Status |
|---|---|---|
| 3D fractals (21) | Mandelbulb, Julia bulb, Tricorn bulb, Burning-ship bulb (abs-first), Quaternion Julia, Mandelbox, Menger sponge, Sierpinski tetrahedron, Apollonian, Folded bulb, Octahedron KIFS, Pseudo-Kleinian, Quaternion Mandelbrot, Menger×Tetra, Icosahedral IFS, Negative Mandelbox, Julibox, Bristorbrot, Cubic Quaternion Julia, 3D Burning Ship (reference formula), 3D Burning Ship Julia | ✅ render (all 21 in the full suite) |
| 2D flow scenes (12) | Herringbone-IFS feather, noise-erosion frond, exact-loop Julia dendrite, two Koch-ribbon scenes, Burning Ship zoom, Seahorse, Julia, Radiant fans, Spiral gate, Kali bubbles, Marble clouds; each its own lazily compiled shader | ✅ compile and render; how close they are to the reference videos is documented in `VISUALS.md` |
| Themes | Neon (original look), Realistic (GGX PBR, sky, mirror floor, metal self-reflection), Cosmic (nebula, thin-film), Clay (matte, soft sky ambient); plus a user "Custom ★" slot | ✅ |
| Reference scenes | 9 one-tap scenes (3 clay Burning Ship, 3 candy rosettes, 3 Mandelbox mandalas) | ✅ apply; ⚠ visual match is approximate |
| Transitions | Geometric morph (2 fields cross-faded through a folding space), dissolve, cut; 3D mirror symmetry (0–16); post kaleidoscope; feedback trails; bloom | ✅ |
| Dive | GPU depth read-back, focus re-anchoring | 🧪 works in software GL; 📱 1-pixel `readPixels` may hitch on iOS |
| Audio | Demo beat, file, mic, tab capture (desktop); iOS audio-session switching; BPM, drops, snare/hat/brightness/pitch; Feel presets | ✅ mic path simulated; 📱 real mic, real music, ringer-switch behaviour untested |
| Touch | Spin with inertia, pinch, twist, 3-finger chaos, double-tap pulse, thumb XY pad, tilt, shake | 🧪 synthetic pointer events only; 📱 real fingers/gyro untested |
| Automation | Director, Show mode, morph timeline, auto-cycle | ✅ logic; 📱 with real music untested |
| Looks and sharing | 6 look slots, share-link state, JSON state, `window.FractalPulse` API, postMessage, optional WebSocket bridge, coordinator events | ✅ |
| Performance takes v1 | Record, play, scrub, trim, event delete, re-skin, JSON in/out, observation track | ✅ (`PERFORMANCE.md`) |
| Capture | Real-time clip recorder, PNG screenshot of the viewport | 🧪 recorder checked in headless Chromium; 📱 iOS share sheet untested |
| Delivery | PWA manifest, service worker, icons, `.nojekyll` | 📱 not deployed to GitHub Pages yet |

## Known gaps (as of the baseline)
- ⛔ The `message` listener accepts any sender; no origin or schema checks. (Addressed in the integration phase.)
- ✅ (resolved in Phase 1) Freeze / Resume.
- ✅ (resolved in Phase 1) Formula-specific parameters are directly editable.
- ✅ (resolved in Phase 2) Specimens are the versioned artwork format. Look slots remain temporary UI state.
- ⛔ Still export is a viewport screenshot.
- ⛔ Takes store post-envelope analysis (sculpt and chaos contributions mixed in), so the original source analysis cannot be separated.
- ⛔ The README's old count of fractals was out of date (now 21).

## Expansion roadmap status (Quinn Proxy brief, 2026-11-14)
See the "Expansion status" section at the end of this file, updated as phases land.

## Expansion status (Quinn Proxy brief)
| Phase | Status | Notes |
|---|---|---|
| 0 Protected baseline | ✅ | `c117de0`, regression suite `tests/regression.js`, this inventory |
| 1 Sculpt: Freeze / Resume + formula parameters | ✅ simulated | ❄ button (also **Z**) holds time, envelopes, camera, spin, hue, Director, Show, cycle, chaos, pulse and dives; orbit/sculpt/pins stay editable. 21 formulas expose only their own parameters (1–4 each) with pin / ↺ unpin; geometry: iterations, cut-away position, twist, bend, material override. 📱 real-finger feel untested |
| 2 Specimens + workspaces | ✅ simulated | Versioned specimen format (`SPECIMENS.md`): save, restore, duplicate, variation, overwrite, export/import (single + collection), capture from a take, look-slot conversion, collections, thumbnails, renderer-drift flag. Four workspaces (Explore / Sculpt / Perform / Forge) group the menu. 📱 real-device storage limits untested |
| 3 Still art + E-PAPER NODE 000 | ✅ simulated (commit: see `git log`, "Phase 3") | Forge → **Still art**: size presets/custom (16–16384 px per side, refused above the browser's probed canvas cap, 16.8 MP here), 1×/2×/3× supersample, transparent background (floor hidden with shadow kept, or floor kept), independent bloom/glow, automatic tiling with overlap margin, progress + cancel, state frozen and restored. Tiled output matches single-pass (mean abs diff 0.56/255 in test). **E-PAPER NODE 000**: exactly 384×184, B/W or B/W/R, threshold, none/Floyd–Steinberg/Atkinson/Bayer, invert, black/white background, optional caption strip, actual-pixel + enlarged previews, Save PNG. Details: `STILL_EXPORT.md`. 📱 real-iPhone memory limits and the label's real appearance are untested |
| 5 Offline fixed-time render | ✅ simulated | Virtual-clock image-sequence render of a take or a turntable; exact timing, byte-identical reruns, folder or zip output, manifest, ffmpeg line, flash screening. `OFFLINE_RENDER.md`. No audio, in-browser MP4 video of a take via WebCodecs (see OFFLINE_RENDER.md). 📱 real-device speed/memory untested |
| 7 3D mesh export (experimental) | ✅ simulated | Distance-field sampling + surface nets → OBJ/STL with a watertightness report. `MESH_EXPORT.md`. Approximation, not print-ready. |
