# Testing on an iPhone 16 Pro

Two tools, because only one of them is a real phone.

## 1. Simulated: `tests/iphone/run.js` (runs in the cloud container, no phone)
`NODE_PATH=$(npm root -g) node tests/iphone/run.js [--shots] [--stress]`

- Engine: **real WebKit** (the engine Safari uses) with Playwright's *iPhone 16 Pro* profile: 402×874 pt screen, 3× pixel ratio, touch, iPhone user agent, WebGL2. `--shots` writes screenshots to `tests/iphone/out/` (git-ignored). `--stress` uses Chromium with the same profile and a 4× CPU slowdown instead.
- Checks: profile is right; no sideways scrolling; phone defaults (flash-guard readback off, sync 0); bottom bar buttons do not overlap or run off screen; a loaded WAV does not flip play/pause; the diagnostics panel opens and its report is valid; the take card is fully on screen; no console errors.
- First-time setup in a fresh container: `npx playwright install webkit && npx playwright install-deps webkit`.
- **Not iOS.** It cannot show audio interruptions, the silent switch, Control Center, home-screen mode, real GPU speed, heat, or memory pressure. Frame rates printed are software GL, meaningless for a phone. A pass here means "no layout/logic problem found", not "works on the phone".

## 2. Real phone: the diagnostics panel
Open the app with `?diag=1` on the end of the address, or tap the small build label five times. A panel shows frame rate, long stalls, audio engine state, the player's play/pause events, flips per second, errors and memory. **Copy report** puts one block of JSON on the clipboard to paste back into the chat. Nothing is sent anywhere. It records only after it is opened.

## Findings so far
- 2026-11-22: at 402 pt width the bottom bar's "CAPTURE" label overlapped "EXPLORE" and the Freeze gem crowded its neighbours (found by this kit, fixed: capture shows ◆ on phones). The top status line is partly hidden behind the "Controlling" chip on phones: still open.
- The song play/pause loop on a real iPhone was **not** reproduced in WebKit here (one play event, then steady). Suspects (flash-guard readback, sync delay) are switched off by default on phones; cause unconfirmed until a diagnostics report from the phone.
