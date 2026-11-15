# Mathematical specimens

A **specimen** is a reproducible configuration of a discovered structure, not a screenshot. It lives in **Forge → Specimens**.

## Format (`*.fps.json`, `format: "fractal-pulse-specimen"`, `v: 1`)
```jsonc
{
  "format": "fractal-pulse-specimen", "v": 1,
  "id": "sp-m3k2x1-ab12", "name": "Rosette A", "collection": "Candy", "notes": "…",
  "created": "ISO-8601", "modified": "ISO-8601",
  "parent": "sp-…" | null,                              // lineage: set by Duplicate and Variation
  "implementation": {                                   // provenance
    "app": "fractal-pulse", "appVersion": "fp-2026.11.14", "shaderRev": 1,
    "formula": { "index": 14, "name": "Icosahedral IFS", "rev": 1 },
    "scene2d": null | { "index": 2, "name": "…" }
  },
  "source": { "kind": "live" | "take" | "variation" | "duplicate" | "look-slot" | "import",
              "take": { "created", "song", "t", "duration" } /* when captured from a performance take */ },
  "audio": { "live", "bass", "mid", "high", "beat", "snare", "hat", "bright", "pitch", "bpm", "drop", "energy" },   // what the music was doing at capture
  "state": { /* exportState(): formula, theme, palette/material look, formula pins, iterations, cut-away, twist, bend, material override,
                symmetry, camera az/el/zoom, spin angles, shape/detail/sparkle, hue, warp, kaleidoscope, bloom/glow/trails, frozen, T … */ },
  "thumb": "data:image/jpeg;base64,…"                   // ~192 px preview
}
```
Collections: `{"format":"fractal-pulse-specimen-collection","v":1,"specimens":[…]}` (`*.fpc.json`).

## What is preserved, and how
- **Frozen state / time:** *Freeze + save* stores `frozen: 1` and the animation clock `T`, so a restore holds exactly that moment.
- **Audio-derived geometry is baked.** If music (or chaos) was shaping the structure at capture, the effective bass/mid/high values are written into the manual Shape / Detail / Sparkle values (clamped to 0–1.2). A frozen restore uses exactly those values, so the sculpture looks the same without audio. The raw snapshot is kept under `audio` for provenance.
- **Formula parameters** (power, Julia constants, Mandelbox scale, fold limits, …) are stored as `pins`, and the whole geometry set (iterations, cut-away, twist, bend, symmetry) is in `state`.
- **Capture from a take:** while a performance take plays or is scrubbed, **Capture specimen here** freezes the current moment, records the take's created time, song and timestamp in `source`, and files it under "From takes".
- **Lineage:** Duplicate makes an exact copy. Variation applies a small random mutation (hue, shape, detail, azimuth, and up to two of the formula's own parameters within their ranges). Both record `parent`.
- **Look slots** are temporary UI state with no provenance. Convert slot → specimen, or copy a specimen's state into a slot (provenance is not kept in slots).

## Reproduction and migration policy
- **No claim of exact cross-version reproduction.** `shaderRev` is bumped whenever shading or fractal math changes in a way that alters appearance, and `formula.rev` when a single formula changes. A specimen whose revisions differ from the running app is flagged **⚠ drift** (in its card and details), and a restore says so. It restores the same parameters and does not promise the same pixels.
- **Version policy:** `v: 1` is current. Files with a newer `v` are rejected rather than half-read. Future migrations chain in `migrateSpecimen` (`v1 → v2 → …`), and drift is recomputed on every load.
- Within the same revision, a restore reproduces every stored value to its stored precision (checked by the regression suite, which compares type, geometry, symmetry, camera, material and the pinned parameter).
- **Storage:** the library is kept in browser storage (about 4–10 KB per specimen with thumbnail). If storage fills, the app tells you to export. Export your collection to keep it safely.
