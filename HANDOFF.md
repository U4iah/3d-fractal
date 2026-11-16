# Fractal Pulse — handoff (as of 2026-11-16)

Single-file, no-build WebGL2 music-reactive 3D fractal instrument. `index.html` is the app. Repo: U4iah/3d-fractal. Work branch: `claude/vibrant-ramanujan-duq5yk` (nothing merged to main; no PRs opened). Private phone preview: https://claude.ai/artifact/CQoiEH4BzBEaNNsp3EedqP (last republished at `5009113`, i.e. plate skin; **not** yet with the blur-removal fix `10f730c`).

## Commit map (newest first)
| Commit | What |
|---|---|
| `10f730c` | Perf: removed backdrop blur over the live canvas (reported laptop crash), chrome updates pause when tab hidden. **Regression run on this commit had not finished when this was written.** |
| `5009113` | Phone specimen label clear of status chip; 59/59 on plate skin |
| `b02b410` | PLATE skin: system serif/mono, § numbering, hairline sliders/switches, live readouts, Director named in status |
| `e4ceeec` | UI_PASS.md: validation against U4's real take |
| `65ef4da`…`ada0622` | UI pass screenshots (before/after) and layout fixes |
| `e55fd5f` | UI pass: instrument strip, control-ownership status line, clean view, collapsible sections, fractal cards, specimen unsaved/compare, take timeline, identity assets |
| `dc334d0` | Media import: audio/video MIME + extensions, clear decode errors, source-media metadata in takes |
| `382e7a4` | Phase 3: tiled/supersampled/transparent still export + E-PAPER NODE 000 |
| `ba19fe0` | Phase 2: versioned specimens, library, workspaces |
| `3669dcc` | Phase 1: Freeze/Resume, formula parameters with pins |
| `481b7ef` | Phase 0: protected baseline, regression suite, feature inventory |
| `c117de0` | Protected baseline (iOS mic fix) |

## Status against the Quinn Proxy expansion brief
| # | Item | State |
|---|---|---|
| 0 | Baseline + verification | done |
| 1 | Freeze + formula parameters | done (simulated) |
| 2 | Specimens | done (simulated) |
| 3 | Still export + E-PAPER NODE 000 | done (simulated); no hardware upload exists or is claimed |
| 4 | Editable performance tracks / timeline editing / re-embodiment | **not started** (timeline is read-only view) |
| 5 | Offline fixed-time render proof | **not started** |
| 6 | FIELD mapping layer + secure host interface | **not started**. Known issue: the existing `message` listener accepts any origin |
| 7 | Mesh extraction | research only (feasible via sampled DE grid + marching cubes); **not moved into the repo yet** |
| 8 | Cathedral identity + host integration doc | emblem + design-preview card in `identity/`; **no integration doc**, no Lab integration |
| UI | Instrument UI pass + plate skin | done (simulated); iPhone acceptance pending |
| Media | Audio-only import | fixed (desktop-tested with WAV/MP3/FLAC/OGG/M4A/MP4); iPhone picker cause unconfirmed |

## Testing
`NODE_PATH=$(npm root -g) node tests/regression.js --quick` (Playwright + SwiftShader software GL, simulated input). Last full-suite result: **59/59** at `5009113`. Groups G1–G11 incl. G9 (still/e-paper), G10 (media), G11 (UI). Not run: non-`--quick` mode since early phases.
Everything is **simulated**; nothing has run on a real iPhone or a real laptop GPU.

## Open issue: laptop crash report (2026-11-16)
U4 said the app is "crashin my laptop". Not reproduced. Suspect: full-height docked panel + strip with `backdrop-filter` blur over the live canvas. Removed in `10f730c`. Need from U4: page freeze vs whole-laptop, browser, GPU, when it starts, whether the Artifact still does it. Fallbacks: lower Resolution/Quality, bloom/trails off; possible auto resolution safety.

## Needs U4 / real devices
- Real-iPhone pass: use the checklist at the end of `UI_PASS.md`.
- Confirm file-picker behaviour for audio-only files on iPhone Safari.
- Real take `performance-1794708619119.fpx.json` was validated locally (4 gestures from 45 slider events; 21.4 samples/s). It is **not** in the repo and must not be published without U4's approval.
- Branch policy: only the dev branch is pushed; extra remote branches (e.g. a tag for `c117de0`) need U4's OK.

## Key design decisions
- No framework, no build. Protected baseline `c117de0`; all existing ids preserved.
- Specimens are versioned (`SPECIMENS.md`); renderer drift is flagged, not hidden; edits never overwrite silently.
- Takes are timestamp-based; v1 files still load; media is referenced, not embedded.
- Honest labelling: Forge lists what does not exist (offline video, mesh export).
- Visual identity (proposed, not final): graphite, lavender structure, amber for live/recording/unsaved, serif italic names + monospace data, § numbering.

## Where things are
`index.html` (app) · `tests/` · `FEATURES.md` (inventory + status) · `SPECIMENS.md` · `STILL_EXPORT.md` · `UI_PASS.md` · `PERFORMANCE.md` · `VISUALS.md` · `RESEARCH.md` · `identity/` · `gallery/` (+ `gallery/ui`, `gallery/phase3`).

## Suggested next steps
1. Confirm the laptop crash is fixed (or collect the details above).
2. Re-run the quick suite on `10f730c`; republish the Artifact.
3. Phase 4 (performance tracks, non-destructive edits, re-embodiment), then 5, 6, 7 (move research in), 8 (host integration doc).
4. "Application fix" pass: storage-quota and error handling, offline cache (`sw.js`), accessibility, optional auto-resolution safety.
