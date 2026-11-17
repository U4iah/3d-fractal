# Figure FP·I — the instrument drawn as a signal-flow figure

Design DNA taken from the U4 Engine UI handoff (diagram, not dashboard; one ink, one ground, one heat; alien in form, ordinary in behaviour), applied to Fractal Pulse **without** copying that product's layout. Fractal Pulse keeps its own identity: the mathematical artwork is the centerpiece and the figure is drawn around it.

## Node map (as built)
| # | Node | Drawn as | Real control underneath |
|---|---|---|---|
| 1 | The Director | goo blob with a live dot | toggles the Director checkbox, opens *Performance* |
| 2 | Source | ink well with dashed ring (breathes when audio is live) | opens *Audio* (import audio/video, mic, tab, demo) |
| 3 | Formula | goo blob with the fractal's name in serif italic | opens *Fractal* |
| 4 | Matter | slightly rotated paper chip with the theme name | opens *Theme* |
| 5 | Core | breathing Julia-set button; heat follows the music | Freeze / Resume (also **Z**) |
| 6 | Archive | circular specimen shards (recent four) | tap a shard to restore it; the label opens *Specimens* |

Conduits (calligraphic ribbons) run 1→2→3→4→5 and 5→6, recomputed every frame from the real DOM boxes. Pulses travel only while music is really playing or a take is playing. Idle shows one slow pulse. A dashed thread appears from the Director to the formula while it is awake. The numbered legend (top right) pings the matching node.

## Behaviour rules kept
- Every node is a real `<button>` with a title, focus ring and keyboard access. Nothing is hidden behind novelty.
- Below 900 px or on touch, the figure collapses: only the bottom instrument bar (organ buttons + core) remains, so the artwork stays edge-to-edge.
- Clean view (◻ / **H**) hides the whole figure. `prefers-reduced-motion` stops all ambient animation.
- Fonts (Instrument Serif, Syne, DM Mono) load from Google Fonts with system fallbacks, so the app still works offline.

## Performance notes (added after a laptop crash report)
- No `backdrop-filter` anywhere over the live canvas.
- The organ loop runs at ~33 fps, the conduit canvas at ~30 fps, the 96 px core at ~15 fps, all paused when the tab is hidden or the element is not visible.
- The start-screen shader runs at half resolution and releases its WebGL context as soon as the app starts.
- Extra WebGL contexts: one tiny one for the core. Measured only in software GL; real-GPU cost is unverified.

## Not done / honest gaps
- No second (paper) skin toggle in the UI yet; the tokens exist (`data-theme="paper"`).
- Real-iPhone behaviour untested.
- The goo organ buttons are used on the bar, nodes and start screen only, not on every panel button.
