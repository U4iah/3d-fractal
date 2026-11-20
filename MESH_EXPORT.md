# 3D mesh export (experimental)

**A ray-marched picture is not a mesh.** This feature builds a real triangle mesh, but it is an approximation, and it is labelled that way everywhere.

## How it works
1. A copy of the scene shader samples the fractal's distance estimate on an N×N×N grid inside the formula's bounding sphere, one slice per frame, in the object's own frame (no camera rotation, current twist/mirror/morph included).
2. The surface where the distance equals a small offset (default 0.8 voxel) is extracted with *naive surface nets*, then wound outward.
3. The mesh is checked: every edge should be shared by exactly two triangles. The app reports open and non-manifold edges and the Euler number.
4. Saved as OBJ or binary STL, scaled so the longest side is the size you set (default 60 mm), optionally Z-up for printers.

## Measured so far (software GL, one test machine)
- Closed sphere test: watertight, Euler number 2, volume within 1% of the true value.
- Mandelbulb at 40³: about 8,000 triangles, 0 open edges, 6 non-manifold edges out of about 12,000, Euler 2. Essentially, but not strictly, watertight.

## Limits you should know
- Detail finer than one voxel is lost; thin features can vanish or thicken. A bigger offset fattens and smooths, a smaller one keeps detail but risks holes.
- The result is the *offset shell* of the fractal, not its exact boundary.
- **Not print-ready:** no wall-thickness, overhang or support analysis, and no guarantee of a manifold mesh in every case. Check in a slicer.
- Needs HDR (float) render buffers; devices without them are refused with a message. 2D scenes are refused.
- Large grids are slow and memory-heavy (160³ is about 16 MB of samples plus the mesh).
