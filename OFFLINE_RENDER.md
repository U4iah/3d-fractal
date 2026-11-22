# Offline fixed-time render

Renders a take, or a turntable of the current specimen, as an **image sequence** on a virtual clock. It can also write a finished **MP4 video** of a whole take in one click (see below).

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
The image-sequence controls now live under *Advanced* in Forge → *Make a video of a take*. "Test 10 frames" estimates time and size. Cancel is safe; the message tells you which frame to resume from.
Assemble with the manifest's line, for example:
`ffmpeg -framerate 30 -i frame_%06d.png -ss 12.000 -i "song.mp3" -map 0:v -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 14 -c:a aac -shortest output.mp4`


## Video of a take (MP4)

Stop a recording and a card appears showing the take's length with **Make video**. Takes are also kept in the browser (newest 12, IndexedDB), listed as *Latest · name · length* in Forge → *Make a video of a take*. Pick one and press **Make video of the whole take**; no seconds or frame numbers to choose.

- Status: **tested here (software GL)**: H.264 yuv420p MP4, exact frame count and duration (ffprobe), decodes cleanly; Opus audio track within 0.02 s of the video when the same song is loaded (song offset stored per take). Memory: the whole file is held in memory before saving.
- **Not verified**: AAC audio path, speed and memory at 1080p60 on real devices. QuickTime may not play Opus-in-MP4.
- Needs browser WebCodecs H.264 (Chrome/Edge/Safari 16.4+); otherwise use the image-sequence option.
- If the graphics card runs out of memory the export stops with a message and the page is not reloaded. Zip segments are also capped by size (~100 MB).
- A banner offers a reload when a newer version of the page is published (stale cached copies were a suspected cause of the "old UI" the user saw; unconfirmed).
