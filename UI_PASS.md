# Instrument UI / presentation pass

**Status:** implemented and checked in software GL with simulated input (desktop 1440×900, phone portrait 390×844, phone landscape 844×390 viewports). **Not yet accepted on a real iPhone.** Mobile acceptance needs U4 (checklist at the end).

## What changed (and what did not)
Presentation only. No shader, audio-analysis, mathematics, take-format, or external-API changes. Every existing element id is kept, so saved settings, looks, slots, specimens and takes still load.

## Workspace navigation
- A persistent **instrument strip** (bottom): ❄ Freeze · ● Record take · ▶ Play take · 💎 Capture specimen · **Explore / Sculpt / Perform / Forge** · ◻ Clean view.
- Tapping a workspace opens its panel; tapping the active one closes it. `index.html#forge` etc. deep-links a workspace.
- Desktop: the panel docks as a full-height right sidebar (artwork stays centred and large); the strip floats bottom-centre. Phone: the panel is a bottom sheet above the strip (drag handle expands/shrinks); landscape puts the sheet at the right so the artwork stays visible.
- Every section header collapses; collapsed state is remembered.
- **Clean view** (◻ or `H`) hides all chrome without touching your state; a faint ✕ (or `H`/`Esc`) returns.

## "What is controlling the artwork?"
A status line at the top reads, e.g. `Controlling · Show mode · ♪ beat · manual sculpt`, `FROZEN`, `● REC TAKE 0:12`, or `TAKE PLAYBACK 0:41/1:53 · re-skinned · Director paused`. Amber means recording or playing. FIELD input appears when an external view/chaos is active.

## Design system (proposed, not an accepted brand)
- Surfaces: graphite `#0f0e15`-ish panels, fine 1 px lavender-tinted borders.
- Accent: lavender `#b9a8ff` for structure/selection. Signal: amber `#ffb454` only for live, recording, playing and unsaved states.
- Type: system UI, small caps-style section labels, mathematical identifiers `FP·XXXXXX`.
- No text glow; the only glow is a very small one on the sculpt-pad dot. Motion is minimal and disabled under `prefers-reduced-motion`.
- Panels are translucent dark so they stay readable over Neon, Realistic, Clay and Cosmic.

## Explore
Fractal picker became a thumbnail grid. **Honest note:** a card shows a preview only after you have stayed on that fractal for ~2 s (previews are remembered locally); unvisited ones show their name only.

## Sculpt
Prominent Freeze, grouped controls (existing), **Hold to compare** with the saved specimen, and an "● unsaved changes" mark whenever the loaded specimen differs from the sculpture. Nothing overwrites a specimen unless you press Overwrite.

## Perform
Mode pills (LIVE / REC TAKE · data / REC VIDEO · pixels / PLAYING TAKE) and a take **timeline**: ruler, playhead, recorded onsets, fractal/scene markers, appearance markers, sculpt **gestures** (consecutive events from one control ≤0.6 s apart drawn as one bar; the raw events remain in the take), pulses, FIELD observations ("none recorded" when empty), camera zoom path. Wheel/± zoom, drag pan, tap to inspect or seek. Display only: the timeline does not edit or invent beat grids or keyframes.

## Forge
Capability list that says plainly what exists (specimen, still, e-paper file, real-time clip) and what does not (offline fixed-time video, mesh export).

## Media import
Picker accepts `audio/*`, `video/*` and explicit extensions (mp3, wav, m4a, aac, flac, ogg, opus, aif, caf, mp4, mov, webm), so iOS no longer greys out ordinary audio. Undecodable files give a named, specific message. Takes record source-media metadata and state that the media itself is not embedded.

## Known gaps
- Real-iPhone behaviour is untested (safe areas, sheet gestures, file picker).
- Undo is not implemented beyond Hold-to-compare and non-destructive specimen handling.
- Take editing (move/trim events from the timeline) is Phase 4; the timeline is read-only.
- Desktop panel width is fixed (340 px), not resizable.

## Physical acceptance checklist for U4 (iPhone)
1. Open from the home screen. Is the artwork edge-to-edge with only the strip and status line on top?
2. Tap Import media and pick an audio-only file (WAV/MP3/M4A from FL Studio). Is it selectable and does it drive the fractal?
3. Orbit with one finger, pinch/twist with two, three-finger chaos, double-tap pulse, sculpt pad: all unchanged and not triggered by tapping the strip or sheet?
4. Open each workspace; drag the sheet handle; rotate to landscape. Anything cut off by the notch, home bar or browser chrome?
5. Tap 💎: is a specimen captured in one action and visible in Forge?
6. Record a take (●), stop, play it back (▶). Are recording/playback states obvious? Does the timeline show your moves?
7. Clean view: does ◻ give a clean screen and the faint ✕ bring controls back?
8. Anything that got in your way?
