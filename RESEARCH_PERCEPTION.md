# Research notes: perception, fractals and performance (via Consensus, 2026-11-20)

Five literature searches (about 40 papers) on what the science says about the things Fractal Pulse does. Only claims directly supported by the abstracts are listed; the "so what" lines are our interpretation, not the papers' conclusions. Most citations are to abstracts, not full texts.

## 1. Mapping music to visuals
- People consistently match high pitch with small, bright objects placed high up [S11], and louder with larger and brighter [S7]. Higher pitch also tends to look brighter and yellower, lower pitch larger [S7]. Timbre semantics (bright, dark, warm) predict the lightness and saturation of colours picked for instruments [S1].
- Specific note-to-colour mappings vary a lot between individuals [S7]. The best-supported account of music/colour affinity is mediation by emotion [S3, S6]; dissonance tracks roughness, colour warmth and brightness [S8].
- **So what:** pitch/loudness → size and brightness is safe; fixed pitch → hue is not. The app already maps bass to size, spectral centroid ("brightness") to a slow hue drift, and snare/hat flux to detail. Brightness-to-luminance is not mapped yet.

## 2. Why the "demon faces" appear (pareidolia)
- Faces are the most reported percept in noise patterns with natural-scene statistics; **vertically symmetric patterns produced the most animate percepts** [P3]. Pareidolia rates depend on structure across many scales and orientations, not one [P1, P4].
- Percepts form fastest and in greatest number near **fractal dimension about 1.3** [P5]. Highly creative people see more forms, across a wider range of contrast and dimension [P2].
- Face pareidolia recruits the same visual circuitry as real faces, including social-attention mechanisms [P7, P8].
- **So what:** your find (negative Mandelbox, 12-fold symmetry, side-on) fits these findings. A single left-right mirror (2-fold) may give stronger faces; "Ref 14 · Face finder" is that experiment. Whether it actually does is untested.

## 3. Fractal aesthetics
- Intermediate fractal dimension is preferred on average, with strong individual differences [F2, F4]. Preferred D values reported: about 1.26 [F6], 1.25-1.5 [F7], contour fractals about 1.1 and cluster fractals 1.5-1.7 [F1]. One study found preference rising with D [F3, F5].
- For exact (computer-made) fractals, symmetry can stand in for deep recursion: with mirror or radial symmetry, fewer iterations were enough to drive high preference [F3].
- **So what:** the Detail/Iterations controls span the "moderate complexity" zone; symmetry is a cheap way to make shallow recursion look rich. There is no single best setting, so keep it adjustable and shareable.

## 4. Audio-visual timing
- Audio delayed 0 to roughly 175 ms behind the picture is generally judged synchronous; the point of subjective simultaneity sits around +40 ms of audio lag. Delay itself is detectable at about 29 ms (video late) / 85 ms (audio late), but **jitter in timing is detectable at about 40 ms even with an overall delay** [T5]. Tolerance also varies by content (music vs speech) and by person [T1].
- **So what:** a steady frame rate matters more than a perfect one (the auto-resolution control serves this). Picture lags sound by at least a frame, so the app now routes file and demo audio through a small delay (default 40 ms, "Sync" control) while the analysis taps the signal before it. This is a starting point from the literature, not a measured fit for any device; Bluetooth speakers add their own delay.

## 5. Beat detection
- Spectral flux is the standard robust onset signal for music with or without prominent drums [B2, B3]; adaptive thresholds can be calibrated per user [B4]; real-time systems can recover beat context and stability each frame [B1]; spectrum-based onset detectors have variable, unpredictable delay, and combining a time-domain detector improved timing by about 3 ms on average [B7].
- **So what:** the app already uses spectral flux for snare and hat; its main beat uses a bass energy peak with an adaptive threshold. A flux-based main onset would be more robust for bass-light music; not done, listed as a candidate.

## 6. Designing a live instrument
- Good instruments pair initial ease of use with long-term potential for virtuosity, and need low, low-variance latency [I3]. Mappings must balance control between instrument and player and be easy for player and audience to understand [I1]. Experienced users favour simple, robust mappings, and unintended triggering hurts expression [I5].
- **So what:** supports the "what is controlling the artwork" status line, making the Director's kaleidoscope opt-in (an unintended trigger), and the one-tap "Back to plain 3D". A visible map of which audio feature drives which visual parameter would help audiences; not built.

## Candidate next steps, ranked by evidence-to-effort
1. Compare Ref 10 (12-fold) with Ref 14 (2-fold) on real faces; keep what looks best.
2. Map spectral brightness to luminance as well as hue (crossmodal), behind a toggle.
3. Spectral-flux main onset, tested on bass-light music.
4. A small "Mapping" view of audio features to visual parameters.
5. Measure frame-time jitter and show it; adapt resolution to hold a steady rate.

## References (Consensus)
- [S1] [Color and tone color: audiovisual crossmodal correspondences with musical instrument timbre](https://consensus.app/papers/details/w:908da59a-b16c-492e-9d10-a3fed8ab5dd3/?utm_source=claude_desktop) (Reymore & Lindsey, 2025, Frontiers in Psychology)
- [S3] [Coloured hearing, colour music, colour organs…](https://consensus.app/papers/details/w:af3b47eb-92a5-468b-9557-d43b24d7ca66/?utm_source=claude_desktop) (Spence et al., 2022, i-Perception)
- [S6] [Assessing the Role of Emotional Mediation in Explaining Crossmodal Correspondences Involving Musical Stimuli](https://consensus.app/papers/details/w:a322e5dd-1bea-4492-a5f7-73fd412bf4c8/?utm_source=claude_desktop) (Spence, 2019, Multisensory Research)
- [S7] [The color of music: Emotion-mediated associations to Bach's Well-tempered Clavier](https://consensus.app/papers/details/w:f60f5ed6-c642-42ad-84d0-710a9c418044/?utm_source=claude_desktop) (Isbilen et al., 2016)
- [S8] [Associating (dis)consonance of harmonic intervals with emotional valences…](https://consensus.app/papers/details/w:6b9d93bd-6cb0-4cca-ae94-ca38d47643c6/?utm_source=claude_desktop) (Pillay et al., 2026)
- [S11] [Crossmodal correspondences: A tutorial review](https://consensus.app/papers/details/w:b2517c96-fbbe-40d9-9f25-cd3d955e86ea/?utm_source=claude_desktop) (Spence, 2011, Attention, Perception & Psychophysics)
- [P1] [Face pareidolia is sensitive to spectral power and orientation energy](https://consensus.app/papers/details/w:d52df373-5d29-49a1-8257-1f7972cfa69c/?utm_source=claude_desktop) (Balas, 2025, i-Perception)
- [P2] [Processing visual ambiguity in fractal patterns: Pareidolia as a sign of creativity](https://consensus.app/papers/details/w:deac9726-3bb4-4537-8c87-6c5f07cd4497/?utm_source=claude_desktop) (Bellemare-Pepin et al., 2022, iScience)
- [P3] [Image primitives supporting perception of animate forms](https://consensus.app/papers/details/w:441735f4-f2b7-4d00-9296-30dcdd7f0c3e/?utm_source=claude_desktop) (Peterson et al., 2025, Cognition)
- [P4] [The tuning of face pareidolia to orientation statistics](https://consensus.app/papers/details/w:5e7f7ecf-2d6b-4b7f-8859-cf65f688c0cf/?utm_source=claude_desktop) (Balas et al., 2024, Journal of Vision)
- [P5] [Percepts from noise patterns: The role of fractal dimension in object pareidolia](https://consensus.app/papers/details/w:1f60ae1e-1b0c-4f79-bb1a-3e72af54481e/?utm_source=claude_desktop) (Bies et al., 2016, Journal of Vision; meeting abstract)
- [P7] [Face Pareidolia Recruits Mechanisms for Detecting Human Social Attention](https://consensus.app/papers/details/w:ceae1167-bb20-4024-b859-c87f193b23ae/?utm_source=claude_desktop) (Palmer et al., 2020, Psychological Science)
- [P8] [The neural basis of face pareidolia with human intracerebral recordings](https://consensus.app/papers/details/w:a80b5607-0f17-49c4-96cc-44f218179a60/?utm_source=claude_desktop) (Cerrahoğlu et al., 2025, Imaging Neuroscience)
- [F1] [Using composite fractal patterns to investigate the aesthetic perception of nature's scenery](https://consensus.app/papers/details/w:c23b4c21-e723-45d2-9eb2-b8d8e800a8a7/?utm_source=claude_desktop) (Owen et al., 2026)
- [F2] [A Complex Story: Universal Preference vs. Individual Differences Shaping Aesthetic Response to Fractals Patterns](https://consensus.app/papers/details/w:770a27bf-003c-4553-9313-8b56e8f01c83/?utm_source=claude_desktop) (Street et al., 2016)
- [F3] [Aesthetic Responses to Exact Fractals Driven by Physical Complexity](https://consensus.app/papers/details/w:2d8a61fe-2579-4b27-823e-e7b1b1264be6/?utm_source=claude_desktop) (Bies et al., 2016)
- [F4] [Preference for Fractal-Scaling Properties Across Synthetic Noise Images and Artworks](https://consensus.app/papers/details/w:7761b1fe-9f85-4299-b56d-7e6559264230/?utm_source=claude_desktop) (Viengkham et al., 2018)
- [F5] [Parametric Cortical Representations of Complexity and Preference for Artistic and Computer-Generated Fractal Patterns…](https://consensus.app/papers/details/w:6b59d511-8e34-4219-baaf-04dfd586d731/?utm_source=claude_desktop) (Rawls et al., 2021, NeuroImage)
- [F6] [Quantifying Aesthetic Preference for Chaotic Patterns](https://consensus.app/papers/details/w:96b4c8ec-6ce6-4306-aea2-b11cc9db78a7/?utm_source=claude_desktop) (Aks & Sprott, 1996)
- [F7] [Fractals in art and nature: why do we like them?](https://consensus.app/papers/details/w:4be45597-3186-4ea8-b820-80a698a779a8/?utm_source=claude_desktop) (Špehar et al., 2013)
- [T1] [Perceived synchrony for realistic and dynamic audiovisual events](https://consensus.app/papers/details/w:d3bb8b05-2f4e-438a-b430-fb157e8a8fc1/?utm_source=claude_desktop) (Eg et al., 2015)
- [T5] [Sensitivity to auditory-visual asynchrony and to jitter in auditory-visual timing](https://consensus.app/papers/details/w:227da51d-8dd0-42c4-8c15-85e5262fa193/?utm_source=claude_desktop) (van de Par et al., 2000)
- [B1] [A Real-Time Beat Tracking System with Zero Latency and Enhanced Controllability](https://consensus.app/papers/details/w:fa705bea-a6d5-4c0e-a80c-351594398753/?utm_source=claude_desktop) (Meier et al., 2024)
- [B2] [Evaluation of the Audio Beat Tracking System BeatRoot](https://consensus.app/papers/details/w:803d2291-6c30-49f9-99a0-25c9ab552154/?utm_source=claude_desktop) (Dixon, 2007)
- [B3] [An Audio-based Real-time Beat Tracking System for Music With or Without Drum-sounds](https://consensus.app/papers/details/w:ee329f1c-823a-44c1-b78c-82ad819d82f2/?utm_source=claude_desktop) (Goto, 2001)
- [B4] [A rhythm practice support system with annotation-free real-time onset detection](https://consensus.app/papers/details/w:92788894-d104-4d14-b0df-34d1011bdee0/?utm_source=claude_desktop) (Yamada et al., 2017)
- [B7] [Hard real-time onset detection of percussive sounds](https://consensus.app/papers/details/w:8da73117-1166-41d0-9b5b-9edd4f5bdd52/?utm_source=claude_desktop) (Turchet, 2018)
- [I1] [Making Mappings: Design Criteria for Live Performance](https://consensus.app/papers/details/w:8bd4cdb4-95df-4c3c-940a-2db2ef6f8559/?utm_source=claude_desktop) (West et al., 2021, NIME)
- [I3] [Problems and Prospects for Intimate Musical Control of Computers](https://consensus.app/papers/details/w:89c9a136-d128-4779-8329-5f32f6e27788/?utm_source=claude_desktop) (Wessel & Wright, 2002, Computer Music Journal)
- [I5] [Simple mappings, expressive movement…](https://consensus.app/papers/details/w:08ba06bd-7eb4-4033-ba0c-1e3b0d45dd67/?utm_source=claude_desktop) (Brown et al., 2018, Digital Creativity)
