float ka_h(float x){return fract(sin(x*127.1+11.7)*43758.5453);}
float ka_h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
mat2 ka_rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
// time-evolving hash in [0,1]
float ka_th(float i,float t){float f=t*0.35;float k=floor(f);float x=fract(f);x=x*x*(3.-2.*x);return mix(ka_h(i+k*7.3),ka_h(i+(k+1.)*7.3),x);}
// Koch-like stepped length: multi-scale square steps over strand index
float ka_steps(float k,float t){
  float s=0.,amp=0.2;
  for(int i=0;i<5;i++){
    float sc=exp2(float(4-i));          // block size in tubes: 16,8,4,2,1
    float b=floor(k/sc);
    float v=ka_th(b+float(i)*31.,t+float(i)*1.7);
    s+=amp*(v>0.5?1.:0.)*(0.6+0.8*v);
    amp*=0.66;
  }
  return s;
}
vec3 ka_pal(float x,float ph){
  vec3 a,b,c;
  if(ph<0.17||ph>0.83){a=vec3(0.50,0.22,0.85);b=vec3(0.62,0.62,0.18);c=vec3(0.98,0.90,0.62);}
  else if(ph<0.5){a=vec3(0.10,0.62,0.70);b=vec3(0.95,0.52,0.14);c=vec3(1.0,0.88,0.6);}
  else {a=vec3(0.85,0.18,0.62);b=vec3(0.35,0.60,0.95);c=vec3(0.30,0.95,0.95);}
  // blend schemes smoothly between anchors
  float w=ph; vec3 a1=vec3(0.50,0.22,0.85),b1=vec3(0.62,0.62,0.18),c1=vec3(0.98,0.90,0.62);
  vec3 a2=vec3(0.10,0.62,0.70),b2=vec3(0.95,0.52,0.14),c2=vec3(1.0,0.88,0.6);
  vec3 a3=vec3(0.85,0.18,0.62),b3=vec3(0.35,0.60,0.95),c3=vec3(0.30,0.95,0.95);
  float w2=smoothstep(0.,.33,w)*(1.-smoothstep(.33,.66,w)), w3=smoothstep(.33,.66,w)*(1.-smoothstep(.66,1.,w));
  float w1=1.-smoothstep(0.,.33,w)+smoothstep(.66,1.,w); w2=smoothstep(0.,.33,w)-smoothstep(.33,.66,w); w3=smoothstep(.33,.66,w)-smoothstep(.66,1.,w);
  a=a1*w1+a2*w2+a3*w3; b=b1*w1+b2*w2+b3*w3; c=c1*w1+c2*w2+c3*w3;
  x=clamp(x,0.,1.);
  return x<.5?mix(a,b,x*2.):mix(b,c,(x-.5)*2.);
}
vec3 flowScene(vec2 uv,float t,float phase){
  vec3 bg=vec3(0.05,0.047,0.09);
  float vg=smoothstep(1.05,0.15,length(uv*vec2(0.9,1.0)));
  vec3 col=bg*(0.45+0.9*vg)+vec3(0.012,0.008,0.02)*vg;
  // hub, slowly drifting
  vec2 hub=vec2(-0.22+0.05*sin(t*1.05),0.02+0.05*cos(t*0.9));
  vec2 p=uv-hub;
  float r=length(p);
  float rot=0.45*sin(t*1.05)+0.25*sin(t*2.1+1.)-0.55;
  float a=atan(p.y,p.x);
  // swirl/bend: streamlines curve with radius
  float bend=1.1+0.6*sin(t*1.05+0.7);
  float ab=a-rot-bend*r*(1.0+0.25*sin(a*2.+t*1.05))+0.12*log(r+0.05);
  ab=mod(ab+3.14159,6.28318)-3.14159;
  // fan extent
  const float N=11.0;                    // tubes per radian-ish scale
  float span=1.55+0.2*sin(t*2.1);
  float sc=ab*N*1.0;                     // strand coordinate
  float k=floor(sc);
  float ku=sc-k-0.5;                     // across-tube [-0.5,0.5]
  // tube width grows with radius: use arc-length-normalised coordinate
  float rw=max(r,0.08);
  float nt=ab*(26.0*(0.55+0.9*rw));      // tube count across angle
  float kk=floor(nt); float u=fract(nt)-0.5;
  float kidx=kk+floor(rw*3.);            // index for steps (stable-ish)
  float kn=ab/span;                      // -1..1 across fan
  // lengths
  float env=0.78*(1.0-pow(abs(kn),2.6))+0.12;
  float ph=ka_h(kk*1.37+3.)*0.04;
  float rend=env*0.5+ka_steps(floor(ab*52.),t)*1.0+ph-0.05;
  float rin=0.07+0.06*ka_h(floor(ab*40.));
  // blur (DOF): soft in lower-left
  float bl=clamp(0.6*smoothstep(0.1,-0.6,uv.x+uv.y*0.9+0.1)+0.12,0.,1.);
  float pxw=fwidth(nt)+0.0001;
  float soft=pxw+bl*0.9;
  float spx=fwidth(r)*(1.+bl*6.)+0.001;
  float inFan=smoothstep(span,span-0.04-bl*0.1,abs(ab));
  float inR=smoothstep(rend,rend-spx*1.2,r)*smoothstep(rin,rin+0.03,r);
  float cov=inFan*inR;
  if(cov<=0.001) return col;
  // cylinder shading
  float n=clamp(u*2.0,-1.,1.);
  float nz=sqrt(max(1.-n*n,0.));
  vec3 N3=vec3(n,0.,nz);
  vec3 L=normalize(vec3(-0.5,0.6,0.7));
  float dif=max(dot(N3,L),0.)*0.75+0.25;
  float spec=pow(max(dot(reflect(-L,N3),vec3(0,0,1)),0.),24.)*0.5;
  float fres=pow(1.-nz,2.5)*0.35;
  vec3 tubeC=vec3(0.66,0.69,0.67);
  vec3 tc=tubeC*dif+spec+fres*vec3(0.7,0.75,0.85);
  // tube edge/gap
  float edge=1.-smoothstep(1.0-soft*1.2,1.0,abs(n));
  // end cap highlight
  float cap=smoothstep(rend-0.02-bl*0.02,rend,r);
  tc=mix(tc,tc*0.7+vec3(0.12),cap*0.8);
  // inner coloured strand
  float hh=ka_h(kk*3.1+9.);
  float wob=0.18*sin(r*40.*(0.6+hh)+hh*20.+t*1.5);
  float line=1.-smoothstep(0.03,0.14+bl*0.3,abs(u-wob*0.5));
  float g=clamp(r/(rend+0.02),0.,1.);
  vec3 sc3=ka_pal(r*1.7-0.12+0.12*hh-0.15*kn*kn,phase)*0.8;
  sc3*=1.0+0.4*line;
  // translucency: opaque toward the outer end, see-through near hub
  float op=mix(0.2,0.88,smoothstep(0.15,0.55,r));
  op=mix(op,0.95,cap);
  // coloured inner shows as glow behind tube
  vec3 behind=sc3*(0.45+0.55*line);
  vec3 tube=mix(behind,tc,op);
  tube+= sc3*line*0.25*(1.-op);
  // gaps between tubes
  tube*=mix(0.72,1.0,edge);
  tube=mix(tube,tube*0.9+bg,0.0);
  tube*=0.85+0.15*vg;
  float alpha=cov*mix(0.9,1.0,edge)*(1.-0.3*bl);
  col=mix(col,tube,alpha);
  return col;
}
