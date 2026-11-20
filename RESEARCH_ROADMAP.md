# Research roadmap: from findings to experiments (2026-11-20)

Companion to `RESEARCH_PERCEPTION.md` (first pass) and `RESEARCH_EXPANSION.md` (this pass: evidence, citations, caveats).
Status words are used strictly: **Supported** = stated by a peer-reviewed abstract. **Hypothesis** = plausible, untested here. **Engineering** = our interpretation. **Artistic** = a creative bet. **Implemented** = code exists. **Verified** = a test or measurement passed. Nothing is "verified" on a real device until U4 confirms it there.

| # | Lane | Evidence | Experiment we can run | Status |
|---|---|---|---|---|
| S | Photosensitivity and comfort | Supported (flash ≥3 Hz, ≥20 cd/m², ≥25% of screen, red transitions, stripes; 15-20 Hz worst) | Real-time flash guard + Calm mode; synthetic strobe test | see below |
| 9 | Perceptual sync | Supported (jitter detectable ~40 ms) | Sync Lab: measure latency and frame jitter, user calibration | see below |
| 4+5 | Pareidolia lab and complexity | Supported for 2D noise; **not** shown for 3D fractals; 2D projection beats 3D measures for perceived 3D complexity | Blind A/B trials, report percepts, log geometry + projection statistics | see below |
| 3 | Music structure | Supported (novelty peaks across features and scales; EDM = energy/rhythm/timbre; live vs offline differ) | Causal multi-scale novelty detector vs an offline (centred) version | see below |
| 2 | Tension | Supported at population level (r≈.60); not individual emotion | "Tension proxy" from loudness, roughness proxy, pitch height, onset density; labelled as a model | see below |
| 1 | Timbre → geometry | Supported (round/spiky ↔ spectral balance and temporal continuity; roughness → pointed) | "Angularity" mapping (centroid, flux, noisiness) with A/B toggle | see below |
| 8 | Camera and comfort | Supported in VR headsets (speed, density, depth motion and roll/pitch raise vection); not tested on phone/desktop | Comfort caps in Calm mode; phrase-aware camera later | partly |
| 10 | Rendering performance | Thin (literature is about primitive/neural SDFs) | In-app benchmark that exports per-fractal frame times for U4's devices | planned |
| 6 | Morphogenesis | Supported for 2D affine IFS morphing; none for 3D escape-time fractals; attractors can vanish at thresholds | Measure morph continuity (largest frame-to-frame jump) | planned |
| 7 | Lighting/materials | No literature pass this round | Per-formula material presets as artistic experiments | planned |
| 11 | Live instrument | Supported (simple robust mappings, low variance latency) | Saveable mapping profiles (audio feature × visual parameter matrix) | planned |
| 12 | Cross-project | None; no integration exists | `EXCHANGE.md`: what could be shared (specimens, mapping profiles, GLSL formula snippets, takes) | planned |

## Order of work
1. Safety guard and Calm mode (safety first).
2. Pareidolia Lab with geometric logging.
3. Sync Lab (measure, then recommend).
4. Structure analyzer, tension proxy, angularity mapping (audio analysis experiments), all behind clear labels and an off switch.
5. Benchmarks, morph continuity, mapping profiles, exchange notes.
Each step: tests, a doc entry, and a commit. Results and limits are written down whether or not they flatter the idea.

## Status update (offline render, mesh export, lab discoverability)
- **Offline fixed-time render: Implemented; Verified in software GL** (byte-identical reruns, exact timestamps, cancel, limits, zip validity). Not measured on real hardware. See `OFFLINE_RENDER.md`.
- **3D mesh export: Implemented (experimental); Verified in software GL** on a sphere and on a Mandelbulb (essentially watertight, not strictly). Not print-ready. See `MESH_EXPORT.md`.
- **Pareidolia lab, video render, mesh export and comfort controls** now open from the Lab buttons on the bench rail and from node 7 in the Figure skin.
