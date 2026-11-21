# Fractal Pulse — handoff (as of 2026-11-21, commit `b83da85`+)

Single-file, no-build WebGL2 music-reactive 3D fractal instrument (`index.html`). Repo U4iah/3d-fractal. Work branch `claude/vibrant-ramanujan-duq5yk` (nothing merged to main, no PRs). The GitHub Pages bookmark can only be serving this branch (main holds only a README). Build label on screen: `build fp-2026.11.17-audio` (start screen and top of the full panel).

**Last full quick regression: 110/110 passed** (`NODE_PATH=$(npm root -g) node tests/regression.js --quick`; Playwright + software GL, simulated input). Nothing is verified on a real iPhone or a real laptop GPU.

## Status against the Quinn Proxy expansion brief
| # | Item | State |
|---|---|---|
| 0–3 | Baseline, Freeze + formula parameters, Specimens, still export + e-paper | done (simulated) |
| 4 | Editable performance tracks / timeline editing / re-embodiment | **not started** (timeline is a read-only view) |
| 5 | Offline fixed-time render | **done (simulated)**: virtual clock, byte-identical reruns, folder or zip image sequences, manifest, ffmpeg line, flash screening. `OFFLINE_RENDER.md`. No audio, no in-browser video encoding |
| 6 | FIELD mapping layer + secure host interface | **not started**. Known issue: the `message` listener accepts any origin |
| 7 | 3D mesh export | **done (experimental, simulated)**: distance-field sampling + surface nets → OBJ/STL, watertightness report. `MESH_EXPORT.md`. Approximation, not print-ready |
| 8 | Cathedral identity + host integration doc | emblem + design-preview card only; no integration, no host doc |
| UI | Instrument UI pass; Figure skin (U4 Engine design DNA); Specimen Bench skin (original); `B` switches skins | done (simulated); iPhone acceptance pending |

## Added since the first handoff
- Audio: broad import types, clear errors, first-tap audio unlock for iPhone home-screen apps, tap-to-wake button, sync delay (default 40 ms).
- Never trapped: "Back to plain 3D" button + `X`; Director kaleidoscope opt-in; skin key moved K → B.
- Safety: real-time flash guard (screens 8×5 thumbnails against the published 3-flashes-per-second guideline) + Calm mode. **Found and fixed during testing:** it had silently never sampled (disallowed GPU copy, and a seconds/milliseconds mix-up). Verified on a simulated clock: strobe trips it, gentle flicker does not, it releases.
- Research: `RESEARCH_PERCEPTION.md`, `RESEARCH_ROADMAP.md` (lanes, evidence levels, experiments) from about 14 Consensus searches. Evidence is uneven; see the roadmap's labels.
- Pareidolia Lab (blind trials, reports stored apart from measured image statistics). Findable from the bench Lab buttons and Figure-skin node 7.
- New fractals: U4 fractal logotype (21), Cathedral of Becoming (22), **Text sculpture (23)**: type a word, each letter gets its own fractal pattern (`TEXT_SCULPTURE.md`). Presets Ref 10 (demon faces), 11–14.
- Demon-faces find saved exactly (`specimens/demon-faces.fps.json`, Ref 10); Ref 14 tests a single mirror plane.

## Known gaps and honest limits
- Not tested on real devices: audio unlock on iPhone, speed and memory of offline render and mesh export, GPU cost.
- The old laptop crash report (suspected blurred panels) had no confirmation; blur was removed.
- Text sculpture patterns are moderate, not dramatic; fonts differ by device; short words in heavy fonts work best.
- Mesh export is an offset-shell approximation; not print-ready.
- Pareidolia Lab results describe one viewer and say nothing about 3D fractals in general.
- Takes recorded before this version have no saved song position (assume 0 in the ffmpeg `-ss`).
- U4's real take file is **not** in the repo and must not be published without approval.
- One earlier commit trailer has a mistyped session ID (harmless; history not rewritten).

## Suggested next steps
1. Real-device pass on iPhone and a laptop: audio unlock, text sculpture, Specimen Bench, offline render speed (checklist at the end of `UI_PASS.md`).
2. Phase 4 (editable performance tracks), then 6 (secure FIELD interface; fix the open message listener), then 8 (host integration doc).
3. "Describe it" text prompt with a small vocabulary and honest feedback about unknown words.
4. Remaining research lanes: timbre → angularity mapping, tension proxy, music-structure analyzer, benchmarks, mapping profiles.
