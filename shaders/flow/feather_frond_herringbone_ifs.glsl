float h11(float n){return fract(sin(n*127.1+13.7)*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
vec3 pal(float x,float ph,float bm){
  vec3 ink=vec3(.04,.02,.05), cu=vec3(.78,.42,.18), cr=vec3(.95,.90,.85), bg=vec3(.55,.62,.75);
  vec3 dc=vec3(.42,.2,.15), vi=vec3(.25,.18,.6);
  vec3 A=mix(cu,dc,smoothstep(.3,.6,ph)), B=mix(cr,bg,.0);
  A=mix(A,vi*.8,smoothstep(.6,.9,ph)); B=mix(cr,mix(bg,vec3(.45,.4,.85),smoothstep(.6,.9,ph)),bm);
  x=clamp(x,0.,1.);
  return x<.5?mix(ink,A,smoothstep(0.,.5,x)):mix(A,B,smoothstep(.5,1.,x));
}
// recursive herringbone feather: each level = periodic slanted barbs about the parent's axis
vec2 feather(float u,float v,float co,float fp){
  float id=floor(v); float x=fract(v)-.5; float W=1.0;
  float shade=0., amp=1., tot=0.; float dark=0.;
  float uu=u; float spine=0.;
  for(int i=0;i<6;i++){
    float h=W/3.8;
    float ax=abs(x);
    float sl=1.5*(.65+.7*h11(id*2.3+1.));
    float q=(uu-sl*ax)/h+h11(id)*7.+.6*vn(vec2(uu,ax*3.)/h*.5+id);
    float n=floor(q); float g=fract(q);
    float tf=ax/(.5*W);
    float len=(.5+.8*h11(id*3.1+n))*(i==0?co*.8+.55:1.)*(i==0?1.:co*.6+.75);
    float m=smoothstep(len,len-.2,tf);
    if(i==0) spine=(1.-tf);
    float ramp=pow(g,.8);
    float vis=smoothstep(.25,1.5,h/fp);   // fade levels finer than a pixel
    float a=amp*vis;
    float sh=mix(ramp,1.-tf,.35);
    shade+=a*sh+(amp-a)*.5; tot+=amp;
    dark+=a*(1.-m)+(amp-a)*.3;
    id=h11(id*1.7+n*5.3+float(i))*100.;
    uu=ax; x=(g-.5)*h; W=h; amp*=.7;
  }
  return vec2(shade/tot+.6*spine*spine*(.5+co*.6),dark/tot);
}
vec3 flowScene(vec2 uv,float t,float phase){
  vec2 c=vec2(-.9,-.8);
  vec2 p=uv-c; float ang=.55+.04*sin(t*.3)+t*.01; float ca=cos(ang),sa=sin(ang); p=mat2(ca,sa,-sa,ca)*p;
  float r=length(p), a=atan(p.y,p.x);
  float fp=4.5*fwidth(r)/r*1.0; // footprint in u units
  float u=log(r)*4.5 - t*.45, v=a*4.2+t*.02;
  v+=.9*vn(vec2(u*.4,v*.35))+.35*vn(vec2(u*1.1,v*.8)+3.)+.12*vn(vec2(u*3.,v*2.)+9.);
  float co=vn(vec2(u*.35,v*.45)+7.)*1.5-.05;
  vec2 f=feather(u,v,co,fp);
  float s=f.x*.82+(co-.5)*.3-.1;
  float bm=smoothstep(.35,.65,vn(vec2(u*.3,v*.4)+31.))*.9;
  vec3 col=pal(s-f.y*.8,phase,bm);
  // sparks: small radial streaks in voids
  vec2 sg=vec2(u*25.,v*22.); vec2 si=floor(sg); vec2 sf=fract(sg)-.5;
  float hh=h21(si);
  float sp=step(.93,hh)*smoothstep(.5,.0,abs(sf.y+(h21(si+3.)-.5)*.5)*3.)*smoothstep(.5,.1,abs(sf.x));
  float voidness=smoothstep(.45,.1,s-f.y*.8);
  col+=sp*voidness*vec3(.9,.9,1.)*.9;
  return col;
}
