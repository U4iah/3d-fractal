# 3D fractals for real-time rendering: research notes

Everything here is implemented in `index.html`. The shader code is the reference.

## 1. How to draw a 3D fractal in real time

Fractal surfaces have no triangles, so we **ray-march a distance estimator (DE)**:

1. For each pixel, cast a ray `p(t) = ro + t·rd`.
2. `DE(p)` returns a **lower bound on the distance** from `p` to the set.
3. Step `t += DE(p)` (sphere tracing, Hart 1996). Stop when `DE < ε`.
4. `ε` shrinks with distance to the camera (`ε = 0.6 · pixel footprint · t`). Far detail costs no more than near detail, and nothing shimmers.

The normal is the gradient of the DE, taken with a 4-tap tetrahedral stencil. Ambient occlusion comes free from the **step count**: rays that graze crevices take many steps.

### DE for escape-time fractals
For `z → f(z)` iterated until `|z| > R`, the Hubbard–Douady potential gives

```
DE ≈ 0.5 · |z| · ln|z| / |dz/dp|
```

`dz` is the running derivative, updated alongside `z`. Fold-based fractals (Mandelbox, KIFS) use a different, simpler DE: `|z| / |dr|`, where `dr` accumulates the scale factors.

### Orbit traps for colour
Track `min(|z|²)` over the iterations (`gTrap`). It is a smooth scalar that follows the fractal's structure, so we map `log(1 + trap)` through a cosine palette. Hue also rotates with time and treble.

## 1b. Render pipeline (v2)

1. **Scene pass:** the raymarcher writes linear HDR (RGBA16F) at a scalable internal resolution.
2. **Bloom:** bright-pass, then two separable 9-tap Gaussian rounds at ¼ screen resolution.
3. **Composite at full resolution:** kaleidoscope mirror, beat-driven chromatic aberration, noise dissolve to the previous fractal, bloom add, ACES tone map, vignette, dithered grain.
4. **LOD inside the shader:** fold fractals stop iterating once their scale passes the pixel footprint (`sc·ε > 1`). Far or small pixels get far fewer iterations.
5. **Audio-driven space warp.** The whole space is twisted about y and bent by a travelling sine before the fractal is evaluated. The step size is divided by an estimated Lipschitz bound, `1 + |twist|·size + 2.1·|bend|`, so the DE stays safe.
6. **Spectrum painting.** A 64-bin log-FFT texture is sampled with the orbit-trap value, so different surface regions light up with different frequencies.

## 1c. Themes and the realistic shader (v3)

The realistic shading path:
- **Microfacet BRDF:** GGX distribution, Smith–Schlick geometry, Schlick Fresnel, metal and dielectric `F0` mix. Material A or B is chosen from the orbit trap, and roughness varies with it.
- **Lighting:** a sun (direction slowly orbiting, intensity flickering with the beat), a hemispherical sky/ground ambient term, and a procedural sky (horizon-to-zenith gradient plus a sun disk) used as the environment reflection.
- **Occlusion and shadows:** a 5-tap distance-field AO blended with step-count AO, and a soft shadow march.
- **Mirror floor:** an analytic plane the camera ray tests against, with a real reflection march of the fractal (`uReflSteps`). Reflected hits are shaded without shadows or AO. The floor is off for the "inside" fractals (Apollonian, Kleinian).
- **Post:** a higher bloom threshold, tiny aberration, low punch-in exposure and a gentle vignette. The theme table is `THEMES` in the code.

Quality tiers (Low / Medium / High) set the march steps, shadow steps and reflection steps. Phones default to Low.

## 1d. Geometric morphing (v4)

The map function can evaluate two fractals at once:

```
pf = mix(p, abs(p) - 0.3, k) then rotate xy by 1.4k      k = sin(π·t)   (peaks mid-morph)
d  = mix(dA(pf·kA)/kA, dB(pf·kB)/kB, smoothstep(t))
```

- **Shared frame.** Each fractal is rendered at `p·k` with its distance divided by `k`, where `k = bound/1.5`. Every finite fractal then has bounding radius 1.5 and a similar size, so the cross-fade is meaningful. The cost is that morphs between very different fractals (for example a bulb into an infinite foam) are blends of fields that are only approximately compatible.
- **Fold wave.** `k = sin(πt)` is zero at both ends, so the pure fractals are untouched. In the middle, the mirror fold plus twist makes the shape visibly fold in on itself.
- **Safety.** Mixed fields and warped space are not exact distances. The step size is reduced by up to 40% mid-morph.
- **Cost.** Two distance evaluations per step for the duration of the morph (about 4 beats). Auto-res absorbs the dip.
- **Timing.** The duration is four beats, derived from the detected BPM and clamped to 1.4–3.2 s.

## 1e. Sculpt mode (v5)

Audio features are split into an *envelope* (from the analyser) and a *manual offset* (from the Shape / Detail / Sparkle sliders). `A.bass = E.bass + man.bass`, and likewise for mid and high. With no audio the envelopes decay to zero and all time-based animation (the master clock, auto-orbit, hue drift, spin) is gated off, so the picture is deterministic and still. The touch gestures write straight into the same sliders.

## 1f. Audio features (v6)

On top of the three bands and the kick detector:
- **Spectral flux** (positive frame-to-frame change in the spectrum) over 1.5–6 kHz fires a *snare* event, and over 7–14 kHz a *hat* event. Snares add a soft pulse, a fold-twist and bulb-power bump, and a spin kick. Hats drive the sparkle band.
- **Spectral centroid** (the "brightness" of the sound, 100 Hz–8 kHz, log-scaled) gently shifts the hue.
- **Pitch follower:** the strongest spectral peak between 150 Hz and 1.8 kHz (when it clears a magnitude gate) is smoothed and mapped log-scale to 0–1. It nudges the fold angle and the Julia constants, so melodic lines bend the shapes.
- **Feel presets** change attack and release speed and how strongly snares and pitch act: Balanced, Punchy, Smooth, Melodic.
- These are heuristics tuned on the synthetic demo track, not on a corpus of real music. Expect to retune thresholds.

## 1g. Chaos, timeline, recording

- **Chaos** is a smoothed scalar `C` (0..1), set by the number of fingers (3+) and finger speed, or by `apply({chaos})`. It adds `C`-scaled sine-modulated energy to bass, mid and high, bumps the drop envelope (flash, bloom, aberration), fires spin kicks at a rate rising with `C`, multiplies the warp by `1 + 3C`, spins the hue, enables a kaleidoscope above `C = 0.6`, and above `C = 0.85` triggers a morph every ~3.4 s.
- **Timeline:** a list of `(fractal, beats)` steps. A beat counter advances at the detected BPM (110 if none) and each step ends when its beat count is reached.
- **Recording:** `canvas.captureStream(60)` plus an audio tap taken from the shared analyser node (every source passes through it), fed to `MediaRecorder` at 10 Mbit/s.

## 1h. Dive, Cosmic, feedback and compile-time engineering (v7)

- **Dive:** the scene pass writes `t` (ray depth) or −1 into alpha. Each ~6 frames one pixel is read back with `readPixels` (RGBA/FLOAT from the RGBA16F target). The focus `F` is moved to `P = cam + rd·t`, and the orbit angles and radius are recomputed from `cam − F` so the camera does not jump. The radius then decays exponentially (faster with bass). Orbit-trap and iteration caps rise with the dive depth. A synchronous 1-pixel read can stall tile-based mobile GPUs, so it is rate-limited. A PIXEL_PACK_BUFFER with a fence would be the next step.
- **Cosmic theme:** an `fbm3` value-noise nebula on the view direction (two layers tinted by the palette), hashed-cell stars, and a thin-film iridescence term `0.5+0.5cos(2π(phase + N·V·1.7 + trap·0.22))` blended with the palette colour. The nebula is also the reflection environment.
- **Metal self-reflection:** one secondary ray per shaded metal pixel, shaded with a lightweight version of the PBR shader (GLSL forbids recursion). The mirror floor and metal share the same secondary-ray code path.
- **Feedback trails:** the composite is rendered to a ping-pong full-resolution buffer, with the previous frame sampled through a small rotation and zoom plus a channel rotation, multiplied by the trail amount, and max-blended. The result is blitted to the screen.
- **Shader compile time.** The first version inlined `map()` about 40 times, each containing three copies of all 18 fractals, and took 37 s to compile on a software GPU (the context was lost). Restructuring fixed it: (1) one evaluation loop in `map` instead of separate single and morph branches (non-constant loop bound `uNW` so it is not unrolled); (2) `calcN` and `calcAO` as loops with a non-constant bound (`4+uZero`) to prevent unrolling; (3) one normal, orbit-trap and shadow evaluation shared by all three themes; (4) one secondary-ray site shared by the metal and floor mirrors. That gave 3.2 s, roughly 12× faster, and a fraction of the code size. Real phones compile with a different backend, but code size scales the same way.

## 2. The fractals

| # | Fractal | Map | Notes |
|---|---|---|---|
| 0 | **Mandelbulb** (White & Nylander, 2009) | `z → zⁿ + p` in spherical "triplex" coordinates | n = 8 is the classic. Here n breathes between ~4 and 15. |
| 1 | **Juliabulb** | `z → zⁿ + c`, with `c` fixed | `c` is animated. Near the connectedness boundary the shape melts into dust. |
| 2 | **Tricorn bulb** | `z → conj(z)ⁿ + p` | In triplex form the conjugate reflects the azimuth, `φ → −φ`. It is the 3D analogue of the 2D Tricorn/Mandelbar. |
| 3 | **Burning-ship bulb** | `z → (\|x\|,\|y\|,\|z\|)ⁿ + p` | The absolute value before the power gives the jagged hulls. Its DE is approximate, so it uses a safety factor. |
| 4 | **Quaternion Julia** (Norton, 1982) | `q → q² + c`, `c ∈ ℍ` | This is a true 4D set, drawn as the 3D slice w = 0. Quaternion multiplication is non-commutative, so `dz → 2·z·dz`, in that order. `c` drifts through all four components. |
| 5 | **Mandelbox** (Tom Lowe, 2010) | box fold → sphere fold → `z = s·z + p` | Scale `s` of about 2 gives the classic form. Its bounding radius grows as `s` falls, so the bound is generous. |
| 6 | **Menger sponge** (Menger, 1926) | KIFS: `abs`, axis sort, `×3`, translate | Volume → 0 and surface area → ∞. Hausdorff dimension ln 20 / ln 3 ≈ 2.727. |
| 7 | **Sierpinski tetrahedron** | 3 mirror folds, `×2`, translate to the vertex | Dimension 2, with zero volume. |
| 9 | **Box-folded bulb** (hybrid) | box fold on every other iteration, then the triplex power | Fold limit pulses with the bass. The escape test runs *before* the fold. Folding first lets escaping points fold back in, which makes the set solid. |
| 10 | **Octahedron KIFS** | abs + sort, `×2`, translate to the vertex `(s,0,0)` | Octahedral analogue of the gasket. |
| 11 | **Pseudo-Kleinian** (Knighty-style) | box fold + sphere inversion `p·max(1/\|p\|²,1)` | DE is `0.3·\|z\|/dr` on the folded plane. Exposure is lowered because the camera sits inside the foam. |
| 12 | **Quaternion Mandelbrot** | `q → q² + (p, w)`, `z₀ = 0` | The 4th coordinate `w` is the slice plane, and it scrolls with the music. `dz → 2·z·dz + 1`. |
| 14 | **Icosahedral IFS** | fold across the three non-coordinate mirror planes of the icosahedral group (normals from the golden ratio), `p·S − O·(S−1)` with `S = φ² ≈ 2.618`, `O ∝ (1,1,1)`, end primitive a small sphere | A dodecahedron built from dodecahedra. The offset and scale were found by rendering variants and choosing by eye. At `S = 2` the copies overlap completely and the result is a plain dodecahedron. |
| 15 | **Negative-scale Mandelbox** | Mandelbox with `s ≈ −1.5 … −2.8` | Same code as the Mandelbox. The DE already uses `\|s\|`. |
| 16 | **Julibox** | Mandelbox with a fixed constant `c` instead of the point `p` | Julia-style variant. Its bounding radius is guessed from renders. |
| 17 | **Bristorbrot-style quadratic** | `(x²−y²−z², y(2x−z), z(2x+y)) + p` | The map is from memory of the community formula. The DE is the generic power-2 estimate, so it is approximate. |
| 18 | **Cubic quaternion Julia** | `q → q³ + c`, `c ∈ ℍ`, 3D slice | `dz → 3·q²·dz`. Gives a nautilus-like shell. |
| 13 | **Menger × Sierpinski hybrid** | alternate Menger (×3) and Sierpinski (×2) folds | The DE is approximate (box SDF scaled to the mixed shape). |
| 8 | **Apollonian packing** | `p → −1 + 2·fract(0.5p + 0.5)`, then inversion `p·s/\|p\|²` | Sphere-inversion IFS in a periodic cell. The camera sits inside the foam. |

### Other candidates (not built)
These are the next ideas, in rough order of effort:
- **Kleinian / Mandelbulb-hybrid IFS.** These are limit sets of Möbius groups. Mandelbulber and Fragmentarium both ship them.
- **Amazing Surf / Amazing Box / Mandelbolt** (Jesse, Tglad). They are variants of the box-fold family.
- **Hybrid fractals.** Alternate formulas per iteration, for example Mandelbox then Mandelbulb. This is the main trick behind most "wow" renders.
- **Mandelbrot/Julia in higher dimensions via the Cayley–Dickson construction.** Octonions are one example.
- **Quaternion Mandelbrot, w-slice animation.** Scrolling the slice plane through 4D (here we scroll `c` instead).
- **Mengerbulb / Sierpinski-Menger blends.**

Alternatives to the 3D Mandelbrot exist because **no true 3D analogue of the complex numbers exists**. Triplex algebra is not a field, since it has no multiplicative inverse. The Mandelbulb is the *best-looking* generalisation, not a canonical one.

## 3. Making it react to music

### Analysis (Web Audio `AnalyserNode`, FFT 2048)
- **Three bands:** bass 30–150 Hz, mid 150–2000 Hz, treble 2–10 kHz.
- **Auto gain.** Each band is divided by its own slow-decaying peak (6 s half-life), then multiplied by the Sensitivity slider. Quiet and loud tracks both fill the range.
- **Envelope followers.** Fast attack (~35 ms) and slow release (~200 ms). Visuals punch on hits and fall smoothly.
- **Beat detection.** A bass onset fires when the bass level exceeds its running mean × 1.25 + 0.12, with a 200 ms refractory period.

### Beat intelligence (v2)
- **BPM estimate:** median of recent inter-onset intervals, folded into 75–165 bpm.
- **Beat phase-lock:** a soft phase-locked loop keeps a continuous beat phase `uPulse` that stays in time between detected hits.
- **Drop detector:** a fast energy envelope compared with a slow one. A quiet passage (short < 0.55 × long) followed within a second by a surge (> 1.25 × long) fires a drop. A drop flashes, boosts bloom and aberration, kicks the spin hard, and can force an auto-cycle switch. The demo track has a breakdown every 8 bars to exercise this.
- **Director mode:** on a beat, at most every 14 s, it picks a camera move (orbit, dive in and out, low sweep), a kaleidoscope setting, a palette, and sometimes a new fractal.

### Mapping: every fractal parameter has a musical driver
| Musical feature | Visual effect |
|---|---|
| Bass | Bulb power, Mandelbox scale, Menger offset, Apollonian `s` (the shape *breathes*), plus surface brightness |
| Mids | Fold twist angle (Menger, Sierpinski), Julia constant drift, orbit speed |
| Treble | Hue rotation speed, quaternion `w`, rim light |
| Beat | Random angular impulse added to the 3D spin (decays at 2.2/s), camera dolly punch, FOV punch, crease flash, hue kick |
| Energy | Spin speed, glow intensity |

The time-based sine terms keep the shapes moving between beats, so silence never freezes the picture.

### Sources
Built-in generative demo (128 bpm kick, clap, hats, acid bass, arp, delay), file or drag-and-drop, microphone, tab or system audio via `getDisplayMedia`.

## 4. Performance

- WebGL2, one full-screen triangle, one fragment shader. All fractals share it, selected by a uniform.
- Bounding-sphere ray clip skips empty space, and the pixel-footprint ε gives free level of detail.
- 150 steps max, 12–14 iterations. A 24-step soft shadow is the main extra cost.
- **Dynamic resolution scaling** keeps the frame time under ~26 ms. Disable it for fixed-quality captures.
- Expect 60 fps at ~0.7× scale on a mid-range discrete GPU, and less on integrated GPUs. Turn **Resolution** down if it stutters.

## 5. What was verified, and what wasn't

- Verified: the shader compiles, and all 14 fractals render with live audio-driven uniforms. Tested in headless Chromium with software WebGL, using the built-in demo audio and screenshots.
- **Not verified on a device:** Dive's pixel read-back on iOS, Show mode with real music, compile time on Apple GPUs.
- **iPhone 16 Pro:** the device detection and defaults were checked with an emulated iPhone. Actual frame rate and the best resolution/quality settings on the device itself are unmeasured.
- **Not verified on real hardware.** Frame rate is untested on a real GPU, and so are mic input and tab capture, since they need a browser prompt.
- - **Not verified:** the drop detector on real music. It is tuned by reasoning and the demo track only.
- Both new hybrids (Folded bulb, Menger×Tetra) use approximate DEs.
- The Menger and Sierpinski folds include an audio twist. At twist = 0 they are the exact sponge and gasket, and with twist they become warped hybrids. The DE is then only approximately conservative, which is why the step factor is 0.85.

## 6. References
- J. Hart, *Sphere Tracing: a geometric method for the antialiased ray tracing of implicit surfaces* (1996).
- D. White and P. Nylander, Mandelbulb (2009). The Fractal Forums thread "Bulb" is the usual citation.
- T. Lowe, Mandelbox (2010).
- A. Norton, *Generation and display of geometric fractals in 3-D*, SIGGRAPH 1982 (quaternion Julia).
- M. Hvidtfeldt Christensen, *Distance Estimated 3D Fractals* (Syntopia blog series), and the Fragmentarium software.
- I. Quilez (iquilezles.org), articles on distance functions and the Apollonian shader.
- Mandelbulber and Mandelbulb3D (open-source and freeware 3D fractal renderers).
