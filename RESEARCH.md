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

- Verified: the shader compiles, and all 9 fractals render with live audio-driven uniforms. Tested in headless Chromium with software WebGL, using the built-in demo audio and screenshots.
- **Not verified on real hardware.** Frame rate is untested on a real GPU, and so are mic input and tab capture, since they need a browser prompt.
- The Menger and Sierpinski folds include an audio twist. At twist = 0 they are the exact sponge and gasket, and with twist they become warped hybrids. The DE is then only approximately conservative, which is why the step factor is 0.85.

## 6. References
- J. Hart, *Sphere Tracing: a geometric method for the antialiased ray tracing of implicit surfaces* (1996).
- D. White and P. Nylander, Mandelbulb (2009). The Fractal Forums thread "Bulb" is the usual citation.
- T. Lowe, Mandelbox (2010).
- A. Norton, *Generation and display of geometric fractals in 3-D*, SIGGRAPH 1982 (quaternion Julia).
- M. Hvidtfeldt Christensen, *Distance Estimated 3D Fractals* (Syntopia blog series), and the Fragmentarium software.
- I. Quilez (iquilezles.org), articles on distance functions and the Apollonian shader.
- Mandelbulber and Mandelbulb3D (open-source and freeware 3D fractal renderers).
