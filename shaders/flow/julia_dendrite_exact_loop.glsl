// Escape-time Julia "feather" scene: z -> z^2 + C with C near the dendrite end of the Mandelbrot set,
// zoomed into a repelling fixed point z0 (exact self-similarity: zoom |2 z0|, rotate arg(2 z0) per loop => seamless).
// Colour = smooth stripe-average (angular stripes, 3*arg z) -> pinnate strands; interior = ink voids.
// signature: flowScene(uv centred, y in [-.5,.5]; t seconds; phase 0..1 copper/white -> dark copper -> indigo)
vec2 fd_cmul(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }
vec2 fd_csqrt(vec2 z){ float r=length(z); return vec2(sqrt(.5*(r+z.x)), sign(z.y+1e-9)*sqrt(max(.5*(r-z.x),0.))); }
float fd_h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }

vec3 fd_pal(float x, float ph){
  x = clamp(x,0.,1.);
  vec3 ink = vec3(0.035,0.015,0.045);
  // palette 0: copper / cream / blue-grey
  vec3 a1=vec3(0.30,0.12,0.07), a2=vec3(0.80,0.43,0.19), a3=vec3(0.97,0.92,0.86), a4=vec3(0.62,0.68,0.78);
  // palette 1: dark copper
  vec3 b1=vec3(0.06,0.025,0.04), b2=vec3(0.30,0.13,0.10), b3=vec3(0.72,0.40,0.22), b4=vec3(0.52,0.36,0.40);
  // palette 2: indigo / violet
  vec3 c1=vec3(0.05,0.03,0.14), c2=vec3(0.17,0.12,0.45), c3=vec3(0.36,0.30,0.68), c4=vec3(0.78,0.48,0.28);
  float p = fract(ph)*3.;
  float w0=max(0.,1.-min(p,3.-p)), w1=max(0.,1.-abs(p-1.)), w2=max(0.,1.-abs(p-2.));
  float ws=w0+w1+w2; w0/=ws; w1/=ws; w2/=ws;
  vec3 k1=a1*w0+b1*w1+c1*w2, k2=a2*w0+b2*w1+c2*w2, k3=a3*w0+b3*w1+c3*w2, k4=a4*w0+b4*w1+c4*w2;
  vec3 c = x<.25 ? mix(ink,k1,x/.25) : x<.5 ? mix(k1,k2,(x-.25)/.25) : x<.75 ? mix(k2,k3,(x-.5)/.25) : mix(k3,k4,(x-.75)/.25);
  return c;
}

vec3 flowScene(vec2 uv, float t, float phase){
  const float PERIOD = 14.0;                 // seconds per self-similar loop
  const vec2 C = vec2(-0.10, 0.88);          // near the dendrite: few, thin voids
  vec2 z0 = 0.5*(vec2(1.,0.) - fd_csqrt(vec2(1.,0.)-4.*C));   // repelling fixed point
  vec2 m = 2.*z0;
  float lm = log(length(m)), am = atan(m.y,m.x);
  float ph = fract(t/PERIOD);
  float ang = -am*ph + 0.9;
  vec2 w = uv*1.3*exp(-lm*ph);
  w = fd_cmul(w, vec2(cos(ang),sin(ang)));
  vec2 z = z0 + w;
  const float B = 1e6;
  float s=0., sp=0., n=0.;
  bool esc=false;
  for(int i=0;i<100;i++){
    z = fd_cmul(z,z)+C;
    sp = s; s += 0.5+0.5*(0.65*sin(3.*atan(z.y,z.x))+0.35*sin(9.*atan(z.y,z.x)));
    n += 1.;
    if(dot(z,z)>B){ esc=true; break; }
  }
  vec3 ink = vec3(0.035,0.015,0.045);
  vec3 col = ink;
  float f = 1.-log2(log(dot(z,z))/log(B));
  if(esc){
    float nn = n + clamp(f,0.,1.) - 1.;
    float v = mix(sp/(n-1.), s/n, clamp(f,0.,1.));
    float x = 0.26+(v-0.30)*1.9;
    x = clamp(x,0.,1.);
    col = fd_pal(x, phase);
    // dark halo hugging the voids / deep detail
    col = mix(col, ink*2., smoothstep(30.,80.,nn)*0.6);
  }
  // sparks: tiny streaks in the dark
  vec2 sp2 = uv*vec2(60.,60.) + vec2(floor(t*0.)*0.);
  vec2 id = floor(sp2); vec2 fu = fract(sp2)-.5;
  float hh = fd_h(id);
  float dotm = step(0.985,hh) * smoothstep(0.12,0.,length(fu*vec2(1.,3.)));
  float darkness = 1.-smoothstep(0.02,0.2,dot(col,vec3(.33)));
  col += vec3(.9,.9,1.)*dotm*darkness*0.8;
  return col;
}
