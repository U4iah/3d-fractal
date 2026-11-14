# Visual catalogue

Everything worth keeping is saved three ways: **in the app** (selectable), **as source** (`shaders/flow/*.glsl` for the 2D scenes, plus the shader inside `index.html`), and **as a rendered still** (`gallery/`). The renders are software-GL stills at low resolution, so a real GPU is crisper.

When a new visual turns up during experiments: (1) add a `<script id="flowX" data-name="…" type="x-shader/x-fragment">` block to `index.html` defining `vec3 flowScene(vec2 uv, float t, float phase)`, (2) copy the GLSL to `shaders/flow/`, (3) render a still into `gallery/`, (4) add a line here.

## 2D flow scenes (the "feathery tissue" video)
Open the menu, tap **🌀 2D flow scenes** (or press **G**), then pick one in the **2D scene** list (or press **V** to cycle). URL: `#flow=1&fv=<index>`. Drag rotates, pinch zooms, bass drives the zoom speed, beats and treble drive the sparks, and the palette cycles copper/white → dark copper → indigo. Trails (video feedback) come on automatically for the radial smear.

The reference was a Reddit post (u/TrippySunny_, "How is it made?"). The method is unknown, so three independent explorers each tried a different family of techniques. All three found feather-like structure. None is an exact match.

| # | Scene | Technique | Honest notes |
|---|---|---|---|
| 0 | **Feather frond · herringbone IFS** | Log-polar fan of strands. Six levels of slanted periodic barbs, where each barb's axis becomes the next level's stem. Pixel-footprint fade for anti-aliasing. | The closest to the reference's fine serrated texture, and cheap. Too regular and chevron-like, with fewer big ink voids. |
| 1 | **Frond & swirl · noise erosion** | Hierarchical folded barbs on a fan of spines (7 levels), two noise warps, 4 radial zoom-blur taps, noise-masked ink voids. | Has the big ink voids, swirl eddies and fat cream lobes. More posterised and crisper than the reference. |
| 2 | **Julia dendrite · exact loop** | Julia set of `z² + C`, `C = (−0.10, 0.88)`, zoomed into its repelling fixed point. Stripe-average colouring `0.65·sin(3·arg z) + 0.35·sin(9·arg z)`. | Loops exactly (RMSE 0 over 14 s). Silky strands and fine black dendrites. Smoother and sparser than the reference, with a single visible hub. |
| 3 | Burning Ship zoom | 2D Burning Ship at (−1.7625, −0.0285) with smooth colouring. | Fishbone and ladder textures. The zoom restarts each cycle. |
| 4 | Seahorse spiral | Mandelbrot seahorse valley zoom. | Beautiful, but not feathers. |
| 5 | Julia dendrite | Plain Julia `c = (−0.8, 0.156)`. | |
| 6 | Radiant fans | 2D folding IFS with a minimum-distance trap. | Radiating barbs. |
| 7 | Spiral gate | Julia seen through a log-polar map. | |
| 8 | Kali bubbles | Kali set `\|p\|/dot(p,p) − c`. | Bubbly, not feathers. |
| 9 | Marble clouds | Ridged fbm in log-polar coordinates. | Marble or cloud texture. |

Standalone sources of the three explorer scenes: `shaders/flow/`.

### What is still missing versus the video
Fatter cream-white frond cores and fewer, more irregular ink cracks with ragged white-edged boundaries. A copper-to-blue-grey rim gradient along void edges. More varied frond direction. Richer dark and indigo phases. The motion-smear is approximated by the feedback trails, not baked into the scene. Idea for the next pass: blend scene 0's barb texture with scene 1's void structure.

## 3D scenes
- **Clay theme** (matched to the reference photos): `gallery/clay_ref1_sandstone.png`, `clay_ref2_snow.png`, `clay_ref3_terracotta.png`. These use the exact 3D Burning Ship formula from the post. Use the **Reference scenes** buttons.
- **Cosmic**: `gallery/theme_cosmic_mandelbulb.png`.
- **Realistic** with mirror metal: `gallery/theme_realistic_bronze_menger.png`.
- **Neon**: `gallery/theme_neon_quaternion_julia.png`.
