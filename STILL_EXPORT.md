# Still-art export and E-PAPER NODE 000

**Status:** implemented and regression-tested in software GL (SwiftShader). Not yet tested on a real iPhone or desktop GPU. Hardware label upload is **not implemented**.

## How the still renderer works
- `renderStill(opts)` freezes the on-screen look (live audio is baked into the sculpt values first), renders, then restores your exact live state, including on cancel or error.
- Camera projection, vignette, grain and bloom lookups use full-frame coordinates (`uOrigin`/`uFull`), so a tiled render lines up with a single-pass one.
- If the target does not fit one pass (GPU texture limit, >8 MP, or buffer allocation probe fails) it is split into tiles with a margin of ~96 px × supersample so bloom crosses tile borders.
- Supersampling is a box filter over ss×ss samples. Transparent export writes coverage alpha, then un-premultiplies; glow adds alpha so halos survive.
- Limits are probed on the device: output canvas cap (iOS Safari is commonly ~16.7 MP) and GPU buffer allocation. A request above the cap is refused with the reason; 4K is never assumed.

## Known limits (honest)
- Kaleidoscope is switched off for tiled exports (it mixes distant parts of the frame). Trails and dissolve are always off in exports.
- 2D flow scenes are opaque; the transparent option is ignored for them.
- Ray-marched images are **images**, not meshes. See `research/` for mesh feasibility.
- Reproducing the identical image across shader revisions is not promised; see `SPECIMENS.md`.
- This is not a print-readiness guarantee for apparel (no colour profile, bleed or DPI metadata). It gives high-resolution isolated artwork with negative space as a starting point.

## E-PAPER NODE 000
- Target: Hanshow Nebular-350R-N M3HG, 384×184, black/white (red optional). Output is an exact 384×184 PNG using only palette colours (tested).
- Controls: palette (B/W or B/W/R), threshold, dither (none, Floyd–Steinberg, Atkinson, Bayer 4×4), invert, background, optional caption (e.g. a specimen id) stamped crisp after quantising.
- Red only appears if the artwork has red-dominant areas; with the B/W/R palette a mostly cool image may show none.
- **Nothing is sent to a label.** First physical goal (one image on one retired label) needs a separate, unverified upload step.
