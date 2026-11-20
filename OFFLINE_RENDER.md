# Offline fixed-time render

Renders a take, or a turntable of the current specimen, as an **image sequence** on a virtual clock. It does **not** encode video in the browser (real-time clip recording is still in Capture).

## What is exact
- Frame *n* is rendered at `start + n / fps`, whatever the device's speed. Allowed rates: 24, 30, 60.
- Trails history, kaleidoscope, morph timing, camera path and take playback run exactly as live, one fixed step per frame. A take is played back by **timestamp**, so irregular capture rates (for example about 21 samples per second) are handled.
- The virtual clock starts at a fixed origin and live-audio analysis state is reset first, so the same frame number renders **byte-identically** on every run. (Tested: two and three runs produced identical PNG hashes.)

## What is not
- No audio is rendered. The take only *references* its soundtrack. New takes also store `songOffset`, the song position when recording began; older takes (including the first real take) do not, so assume 0 and adjust the ffmpeg `-ss`.
- Live audio cannot be rendered offline (it is not repeatable). Use a take.
- One GPU pass per frame, up to about 8 megapixels. No tiling for video. At most 20,000 frames per run (render in ranges).
- Real-GPU speed and memory behaviour are unmeasured; the test machine uses software rendering.

## Output
- **Folder** (desktop Chrome/Edge, File System Access API): frames are written straight to disk, one file each, so memory stays flat.
- **Zip segments** (everywhere else): frames are packed into uncompressed zip files of N frames (default 120) and downloaded one after another. Each archive is verified with a real `unzip` in the tests.
- `render-manifest.json` records fps, size, frame range, timing rule, take and song references, the flash check and the ffmpeg command.
- Flash check: every frame is screened against the published guideline (flashes of 3 per second or more over about a quarter of the screen). It is a screening aid, not a certification.

## Use
Forge → *Render video · offline, fixed time*. "Test 10 frames" estimates time and size. Cancel is safe; the message tells you which frame to resume from.
Assemble with the manifest's line, for example:
`ffmpeg -framerate 30 -i frame_%06d.png -ss 12.000 -i "song.mp3" -map 0:v -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 14 -c:a aac -shortest output.mp4`
