# Text sculpture

Type a short word and it becomes inflated 3D letters, each carrying **its own** fractal pattern. It is the "U4 logotype" idea generalised to any text.

## How it works
1. The browser draws your text (up to 16 characters, control characters stripped) in a heavy system font onto a canvas.
2. An exact Euclidean distance transform turns the glyphs into a signed distance field (negative inside), stored in a texture together with a letter index per pixel.
3. The shader inflates that field into a pillow-shaped solid (flat at the outline, full thickness inside) and combines it with a mirror-tiled negative Mandelbox. With "Letters differ" on, each letter samples a different region and scale of the Mandelbox, so every letter gets a different pattern.
4. **Fractal skin** slides from carved (negative: the Mandelbox's chambers are cut into the letters; the default) through smooth to raised relief (positive). Fractal zoom, Box scale and Inflate reshape it.

It is a real 3D object: orbit it, save it as a specimen (text, font and per-letter setting are stored), render it offline, or export a mesh.

## Limits
- Best with short words in heavy fonts. Thin or small type melts into the fractal; more than about 8 letters gets small.
- Fonts come from your device, so the same text can look different on different machines.
- Raised relief is deliberately gentle: stronger relief made the distance field too steep for the ray marcher, which produced blown-out holes. Carving shows more structure.
- Measured only in software rendering on one test machine; real-GPU speed is unmeasured.
- Not a text-prompt-to-image system: it renders the words you type, it does not interpret descriptions.
