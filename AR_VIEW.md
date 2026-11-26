# AR view (option 1: camera behind the fractal)

Press **AR** (top right on phones) or Forge → Capture → *AR view*. The back camera appears behind the fractal; turning the phone turns the view so the fractal seems to float in the room. A soft shadow falls on an invisible floor beneath it. **Re-centre AR** puts the fractal straight ahead again. Drag still spins the fractal, pinch resizes it, and the music still drives it.

## How it works
- Camera: `getUserMedia` (back camera, up to 1280×720), uploaded as a texture each frame and mixed in the final pass: `camera × (1 − coverage) + fractal light`. Fractal coverage comes from the scene's alpha (the same transparent mode the still export uses); the floor is shadow-only.
- Motion: `deviceorientation` → rotation matrix (same convention as three.js `DeviceOrientationControls`) → yaw, pitch, roll relative to the moment AR started (roll is absolute so the fractal stays upright in the room). Smoothed. iPhone asks for motion permission on first start.
- AR turns off Tilt control, the video-feedback trail and the mirror-floor reflection.

## Status
- **Tested (automated, Chromium fake camera, simulated motion):** camera starts and uploads; background becomes the camera; 20° right turn moves the view target right and 10° up lifts it; roll is tracked; stopping releases the camera. Screenshots checked by eye (turn left/right, roll direction derived from the maths and the shader).
- **Not tested on a real iPhone:** camera permission flow in Safari / home-screen mode, motion permission, real sensor drift, speed and heat (camera + fractal at once; your phone already ran hot with the earlier builds: use `?diag=1`), whether the shadow reads well outdoors.
- **Limits:** no surface tracking, so no anchoring to a table and it drifts; the fractal is drawn live, not placed as a model. Option 2 (place a mesh with AR Quick Look) is not built: needs the mesh export converted to USDZ.
