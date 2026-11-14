# Performance takes: an editable visual performance

A take stores the performance as data, not pixels:

```
Song           → metadata (name, duration) + optional sync to the same file
+ Fractal timeline   → events: type changes (the morphs re-simulate on playback)
+ Hand observations  → observation track (any external tracker, via FractalPulse.observe)
+ Camera movement    → frames: orbit, zoom, spin, dive focus/depth, dive phase, chaos
+ Material changes   → events: theme, palette, realistic material "look", look sliders
+ Musical analysis   → frames: bass/mid/high, beat envelope, snare, hat, brightness, pitch, BPM, drop, onset
= Editable visual performance
```

Because the analysis is stored, a take plays back **without the audio**. It also plays back **under a different theme or material**.

## File format (`*.fpx.json`, `format: "fractal-pulse-performance"`, `v: 1`)

```jsonc
{
  "format": "fractal-pulse-performance", "v": 1, "created": "ISO-8601", "duration": 183.4,
  "song": { "name": "track.mp3", "duration": 183.5 } /* or null */,
  "start": { /* FractalPulse.exportState() at record start: type, theme, palIdx, realIdx, sculpt, warp, kal, bloom, glow, trail, camera… */ },
  "cols": ["t","az","el","zoom","a0","a1","a2","hue","T","fx","fy","fz","diveR","dive","chaos","kal",
           "bass","mid","high","beat","snare","hat","bright","pitch","bpm","drop","energy","onset"],
  "frames": [ [0.0, 0.6, 0.35, 1, …], … ],        // ~30 Hz, 3-decimal precision, one row per `cols`
  "events": [ [1.20, "type", 6], [2.40, "slider", ["sMB", 0.55]], [3.40, "theme", 2],
              [4.40, "look", 1], [4.40, "pal", 3], [5.0, "dive", 1], [6.1, "pulse", 1] ],
  "observations": [ [3.40, "hand", { "x": 0.4, "y": 0.6, "pinch": 0.8 }] ]
}
```

| Column | Meaning |
|---|---|
| `az, el, zoom` | orbit camera |
| `a0..a2` | fractal spin (Euler) |
| `hue`, `T` | hue drift and the animation clock that drives the parameter breathing |
| `fx,fy,fz, diveR, dive` | dive focus point, radius, phase (0 idle, 1 in, 2 hold, 3 out) |
| `chaos`, `kal` | chaos level and the effective kaleidoscope segment count |
| `bass…energy`, `onset` | the musical analysis (the post-envelope values the visuals actually used, including sculpt/chaos contributions) |

**Event kinds:** `type` (fractal index), `theme` (0 Neon, 1 Realistic, 2 Cosmic), `pal` (Neon/Cosmic palette), `look` (Realistic material look), `dive` (0/1), `pulse`, `slider` (`[id, value]` for `sMB sMM sMH sWarp sHue sKal sBloom sGlow sTrail cSlice`).

## Playback semantics

- **Analysis track overrides the live audio features**, so a take plays with no song loaded. If you load the same song (same name and duration within 1.5 s) it plays in sync, including seeking.
- **Camera / clock:** `playApplyCam` sets orbit, spin, dive state and the clock after the simulation step each frame. The dive's GPU read-back is skipped, so the recorded focus is used.
- **Events** fire at their time. Fractal changes morph exactly as live (the morph length follows the recorded BPM).
- **Re-skinning:** untick *Take's look* and the take's theme, palette, material, hue, kaleidoscope, bloom, glow and trails are ignored, so the same performance plays in *your* look. Untick *take's camera* to fly it yourself.
- **Scrubbing** jumps (no morph) to the exact state at any time by re-applying events from the start.
- Auto-cycle, the journey timeline, the Director and Show mode are paused during playback, because their decisions are already in the take.

## Editing (in the app)

- Event list: jump to an event (▶) or delete it (✕).
- Trim: keeps `[a, b]`, shifts time to 0, and folds earlier events into the new start state.
- Since it is plain JSON you can also edit it by hand or with Quinn.

## Hand / face / eye tracking

`FractalPulse.observe(kind, data)` stores an observation in the take (while recording) and emits `{fractalPulseEvent:{type:"observation",kind,data}}` live. On playback the stored observations are re-emitted (with `replay:true`) at their original times. Nothing in the visuals consumes them yet. The intended next step is a mapping layer (hand position → shape/detail, pinch → zoom, two hands → chaos, head pose → camera view, gaze → focus) that is itself part of the take.

## Known limits (v1)

- Sampled at 30 Hz and interpolated. Playback is close to the original but not bit-exact: the fractal parameters are recomputed from the recorded analysis and clock, and the palette cross-fades are re-simulated.
- The built-in demo beat is random each run, so its audio can't be re-created. The take still plays because the analysis is stored, but silently.
- The song is not embedded, only referenced.
- The event editor changes and deletes events but has no drag-to-move or multi-track timeline yet.
- Takes are stored in `localStorage` (last one only) and as files. Long takes can reach ~1 MB per 3 minutes.

## Roadmap

1. **Offline render:** replay a take at exact fixed timestamps at any resolution and frame rate (4K / 60) with no real-time constraint. This is the main payoff of storing the performance.
2. A multi-track timeline editor: drag events, per-track mute and solo, a camera-curve editor, a re-analysable analysis track.
3. A hand/face/eye mapping layer that records its own mapping.
4. Stem-aware analysis (drums / bass / vocals) as separate tracks.
5. Export the beat grid and events as MIDI or OSC for other tools.
