// Koch-style flow bundle. Tube index s from hub-polar coords; tube length from a
// square-Koch (Minkowski-like) digit-substitution height function evaluated per tube.
float kb_h(float x){return fract(sin(x*127.1+13.7)*43758.5453);}
mat2 kb_rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
// square-Koch generator pattern [0,+1,-1,0] per quarter, 4 levels, ratio 0.42/level
float kb_koch(float x,float amp){
  float H=0.,a=amp;
  for(int i=1;i<=3;i++){
    float k=floor(x*exp2(float(2*i)));
    float d=mod(k,4.);
    H+=a*(d==1.?1.:(d==2.?-1.:0.));
    a*=0.56;
  }
  return H;
}
vec3 kb_pal(float g,float ph){
  vec3 A0=vec3(.45,.20,.80),B0=vec3(.62,.62,.22),C0=vec3(.98,.92,.72);
  vec3 A1=vec3(.10,.65,.70),B1=vec3(.90,.50,.15),C1=vec3(1.,.85,.6);
  vec3 A2=vec3(.85,.15,.65),B2=vec3(.25,.80,.90),C2=vec3(.85,.95,1.);
  float w1=smoothstep(.0,.33,ph)*(1.-smoothstep(.33,.66,ph)),w2=smoothstep(.33,.66,ph)*(1.-smoothstep(.66,1.,ph));
  float w0=1.-w1-w2; if(ph>.66){w2=1.-smoothstep(.66,1.,ph);w0=1.-w2;w1=0.;}
  // simple piecewise selection with blends
  vec3 A,B,C;
  float a=ph*3.;
  if(a<1.){A=mix(A0,A1,a);B=mix(B0,B1,a);C=mix(C0,C1,a);}
  else if(a<2.){A=mix(A1,A2,a-1.);B=mix(B1,B2,a-1.);C=mix(C1,C2,a-1.);}
  else{A=mix(A2,A0,a-2.);B=mix(B2,B0,a-2.);C=mix(C2,C0,a-2.);}
  return g<.5?mix(A,B,g*2.):mix(B,C,(g-.5)*2.);
}
vec3 flowScene(vec2 uv0,float t,float phase){
  vec2 uv=uv0*1.3;
  vec3 bg=mix(vec3(.075,.07,.13),vec3(.03,.03,.06),smoothstep(.1,.8,length(uv)));
  vec2 hub=vec2(-.33+.05*sin(t*1.05),-.03+.05*cos(t*1.05));
  vec2 p=uv-hub;
  float th=.35*sin(t*1.05)+.2*sin(t*2.1+1.);
  p=kb_rot(-th)*p;
  float r=length(p),ang=atan(p.y,p.x);
  float curve=.5*sin(t*1.05+.5)+.45;
  float a2=ang+curve*r*r*.8-.05/(r+.12);
  float span=2.3+.4*sin(t*1.05+2.);
  float s=a2/span+.5;
  const float N=64.;
  float sc=s*N; float id=floor(sc), f=fract(sc);
  float sq=(id+.5)/N;
  float sh=t*.02; // koch pattern drifts
  float amp=.22+.05*sin(t*1.05);
  float L=.5+.1*sin(t*1.05+1.5)+kb_koch(sq+sh,amp)+.025*(kb_h(id)-.5);
  L+= .15*(1.-abs(2.*sq-1.))*.0; 
  float inRange=step(0.,s)*step(s,1.);
  // dof blur: stronger lower-left
  float blur=.004+.02*smoothstep(.1,-.5,p.y+uv.x*.2)*smoothstep(-.9,.2,-uv.x);
  float pxw=fwidth(sc);
  float edgeX=max(blur*N/ max(r,.15)*.5,pxw);
  float edgeR=max(blur,fwidth(r));
  // tube cylinder
  float cx=(f-.5)*2.; // -1..1
  float tubeM=1.-smoothstep(.93-edgeX,.93+edgeX,abs(cx));
  float endM=1.-smoothstep(L-edgeR,L+edgeR,r);
  float startM=smoothstep(.0,.05,r);
  float m=tubeM*endM*startM*inRange;
  float nz=sqrt(max(0.,1.-cx*cx/.78));
  vec3 N3=normalize(vec3(cx*.9,0.,nz));
  vec3 Ld=normalize(vec3(-.4,.6,.7));
  float dif=.45+.55*max(dot(N3,Ld),0.);
  float spec=pow(max(dot(reflect(-Ld,N3),vec3(0,0,1)),0.),24.)*.5;
  float rim=pow(1.-nz,2.5)*.35;
  float cap=smoothstep(.03+edgeR,0.,L-r)*.28; // pale cut face at tube end
  // inner coloured strands
  float s2=sc*3.+ .35*sin(r*14.+id*.7);
  float ln=abs(fract(s2)-.5);
  float lw=.12+edgeX*.5;
  float strand=(1.-smoothstep(lw*.5,lw,ln))*inRange*step(r,L+.02);
  float g=clamp(r/(L+.001)*.9+.15*sin(t+id),0.,1.);
  g=clamp(pow(r/.62,.9)-.1,0.,1.);
  vec3 sc3=kb_pal(g,phase);
  float hubGlow=exp(-r*3.5);
  vec3 tubeBase=vec3(.80,.82,.84)*dif+spec+rim+cap;
  // translucency: strand colour bleeds through tubes, stronger near hub
  float tr=mix(.7,.3,smoothstep(.1,.5,r));
  vec3 inner=sc3*(.55+.7*strand)*(.6+.8*hubGlow);
  vec3 tube=mix(tubeBase*vec3(.92,.94,1.),inner*(.8+.4*dif),tr*(.5+.5*strand)+.2*hubGlow);
  vec3 col=bg;
  // behind tubes: strands visible in gaps
  float gap=inRange*step(r,L)*(1.-tubeM)*step(.04,r);
  col=mix(col,sc3*(.35+.6*strand),gap*.8);
  col=mix(col,tube,m*(.92));
  col+= .05*sc3*hubGlow*inRange;
  col*=1.-.35*smoothstep(.3,.9,length(uv0));
  return clamp(col,0.,1.);
}
