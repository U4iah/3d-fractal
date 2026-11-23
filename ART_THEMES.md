# Artistic themes (Theme section: Ink, Stained glass, Riso, Thermal, Oil slick, Op-art)

Each is a different way of *drawing* the same mathematics (a shading style in the scene shader, `uArt` 1–6), not a recolour. The four older themes (Neon, Realistic, Cosmic, Clay) are unchanged. Specimens saved earlier still load: the new themes sit after them (ids 4–9).

| Id | Name | Idea |
|---|---|---|
| 4 | Ink & paper | Woodcut: cross-hatching whose density follows the light, outline at grazing angles, one vermilion "seal" colour, warm paper ground |
| 5 | Stained glass | Flat jewel cells cut from the orbit trap, dark lead lines, lit from behind, pulses with the bass |
| 6 | Riso poster | Three spot inks (pink, teal, yellow) as halftone dots on cream, slightly misregistered |
| 7 | Thermal | False-colour heat map from light, cavities and loudness |
| 8 | Oil slick | Thin-film interference swirling over a near-black body |
| 9 | Op-art | Black-and-white contour bands that shimmer with the pulse; one accent colour in the cavities |

Pattern scale follows the picture height, so stills match the screen. **Status:** each renders without shader errors and differs from the others (automated, software GL). Whether they look good on your screen is a judgement only you can make; tell me which to push further.

## What the research said (Consensus; evidence is uneven, see caveats)
- Colours that read as natural/original compositions were preferred, and rotating an artwork's hue gamut reduced liking, including for abstract paintings [Nascimento 2021](https://consensus.app/papers/details/w:c429af82-fa49-4b09-91fb-389478ed9164/), [Altmann 2021](https://consensus.app/papers/details/w:b3ed5d8b-50b6-4f2d-b87f-bf8e4bd7890c/). → palettes stay anchored in warm yellow-red-weighted ranges with accents instead of random hue rotation.
- Top-rated paintings carried more colour variation, though abstract art varied less [Strafforello 2025](https://consensus.app/papers/details/w:219ed23c-b7ff-4daa-8984-7933517dc276/). → Glass, Oil and Riso use many distinct colours; Ink and Op-art deliberately restrict to test the opposite end.
- Beauty of abstract images tracks self-similarity, colour measures and a complexity "sweet spot", and ratings shift by contrast with what was seen just before [Mallon 2014](https://consensus.app/papers/details/w:90699a8d-0008-4e74-93a9-ef9c0a567902/), [Geller 2022](https://consensus.app/papers/details/w:0a12608e-5889-4287-bd41-e4147ba4206a/). → fractals are self-similar by construction; the six themes are made *very different from each other* so switching feels like a change of medium.
- Music-to-colour matching is mediated by emotion: faster, major music → lighter, more saturated, yellower; slower, minor → darker, bluer [Palmer 2013](https://consensus.app/papers/details/w:0c173cc4-2e30-41df-ba58-cae6f4ee5339/), [Whiteford 2018](https://consensus.app/papers/details/w:9ca02c2a-f2ae-4160-914f-eb18cb6bde9e/); loudness maps to saliency, pitch to lightness [Anikin 2018](https://consensus.app/papers/details/w:5329520c-d9db-4281-8eb0-ad5d5144285a/). → not yet wired: a future "mood-follow" option could lighten/saturate with tempo and energy. Not built tonight.
- Caveats: these are mostly small lab studies on paintings and short excerpts, not on live fractals; effects are modest; taste varies a lot between people.

## Also added with this change
- **Full screen (F, or Forge → Full screen):** browser full screen plus hidden controls, fractal only. Esc, F, H or the faint ✕ returns. Pointer hides after 2.5 s. iPhone Safari has no full-screen API: it falls back to hiding the controls (a home-screen app is already full screen).
- **Figure skin nodes:** clicking a node opens that node's controls in a popover next to it (the section is moved there and put back on close; Esc, ✕, clicking the node again or clicking away closes it). The Figure skin now starts with the side menu closed; Explore/Sculpt/Perform/Forge and ☰ still open the full menu. Specimen-bench skin and phones are unchanged.
