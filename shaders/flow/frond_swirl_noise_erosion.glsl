// Pinnate (feather) frond field via hierarchical folded barbs on a fan of spines.
mat2 fnRot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float fnH(float n){return fract(sin(n*127.1)*43758.5453);}
float fnH2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float fnVn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(fnH2(i),fnH2(i+vec2(1,0)),f.x),mix(fnH2(i+vec2(0,1)),fnH2(i+vec2(1,1)),f.x),f.y);}

// p.x along the spine, p.y across (cell width 1). Each level: mirror about spine,
// barbs lean forward; next level lives inside the barb (barb = child frond).
float fnFrond(vec2 p){
  float a=p.x,b=p.y,h=0.,w=1.,tot=0.;
  for(int i=0;i<7;i++){
    float cid=floor(b+.5),x=b-cid,ax=abs(x);
    float r=fnH(cid*1.37+float(i)*7.1);
    float tent=1.-2.*ax;
    h+=w*pow(max(tent,0.),.45); tot+=w;
    float m=a*2.2-ax*3.+r*8.;
    a=ax*1.8*(1.+.5*r); b=m;
    w*=.92*pow(max(tent,0.),.35);
  }
  return h/tot;
}
vec3 fnPal(float x,float ph){
  float s=ph*3.; int i=int(floor(s)); float f=smoothstep(.2,.8,fract(s)); i=i-3*(i/3);
  vec3 I0,D0,C0,R0,B0,I1,D1,C1,R1,B1;
  if(i==0){I0=vec3(.04,.02,.05);D0=vec3(.50,.25,.10);C0=vec3(.82,.46,.20);R0=vec3(.95,.90,.85);B0=vec3(.62,.68,.80);
           I1=vec3(.03,.01,.03);D1=vec3(.20,.09,.07);C1=vec3(.58,.28,.20);R1=vec3(.80,.47,.32);B1=vec3(.62,.50,.55);}
  else if(i==1){I0=vec3(.03,.01,.03);D0=vec3(.20,.09,.07);C0=vec3(.58,.28,.20);R0=vec3(.80,.47,.32);B0=vec3(.62,.50,.55);
           I1=vec3(.02,.01,.06);D1=vec3(.12,.07,.32);C1=vec3(.30,.20,.66);R1=vec3(.55,.48,.88);B1=vec3(.45,.52,.72);}
  else {I0=vec3(.02,.01,.06);D0=vec3(.12,.07,.32);C0=vec3(.30,.20,.66);R0=vec3(.55,.48,.88);B0=vec3(.45,.52,.72);
           I1=vec3(.04,.02,.05);D1=vec3(.50,.25,.10);C1=vec3(.82,.46,.20);R1=vec3(.95,.90,.85);B1=vec3(.62,.68,.80);}
  vec3 ink=mix(I0,I1,f),dk=mix(D0,D1,f),cop=mix(C0,C1,f),cr=mix(R0,R1,f),bg=mix(B0,B1,f);
  vec3 col=mix(ink,dk,smoothstep(.18,.3,x));
  col=mix(col,cop,smoothstep(.3,.45,x));
  col=mix(col,cr,smoothstep(.62,.8,x));
  col=mix(col,bg,smoothstep(.95,1.25,x));
  return col;
}
// returns height-like value x
float fnField(vec2 uv,float t){
  vec2 p=fnRot(.25)*uv;
  vec2 q=p+.08*vec2(fnVn(p*3.+t*.05),fnVn(p*3.+7.));
  vec2 c=q-vec2(-.55,-.75);
  float r=length(c),ang=atan(c.y,c.x);
  vec2 fp=vec2(log(r)*3.+t*.12,ang*3.2+t*.03);
  fp.y+=1.2*(fnVn(q*2.1+1.)-.5)+.5*(fnVn(q*4.3+5.)-.5);
  fp.x+=.8*(fnVn(q*2.7+9.)-.5);
  float h=fnFrond(fp);
  float big=fnVn(q*3.+3.)*.6+fnVn(q*6.7)*.4;
  return h-.22*(1.-smoothstep(.38,.55,big));
}
vec3 flowScene(vec2 uv,float t,float phase){
  float dk=smoothstep(.2,.5,phase)*(1.-smoothstep(.5,.7,phase));
  float x=0.;
  for(int k=0;k<4;k++){ // radial zoom-blur taps
    float s=1.-float(k)*.012;
    x+=fnField(uv*s,t);
  }
  x*=.25;
  x=(x-.5)*1.9+.4-.1*dk;
  vec3 col=fnPal(x,phase);
  // sparks in voids
  vec2 g=uv*45.; vec2 id=floor(g); vec2 f=fract(g)-.5;
  float rn=fnH2(id);
  vec2 d=normalize(uv+1e-4); f=vec2(dot(f,d),dot(f,vec2(-d.y,d.x)));
  float sp=step(.9,rn)*smoothstep(.08,.0,abs(f.y))*2.*smoothstep(.3,.0,abs(f.x))*smoothstep(.35,.1,x);
  col+=sp*vec3(.9,.9,1.)*.8;
  return col;
}
