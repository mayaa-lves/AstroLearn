/* Mesmo material e atmosfera na trilha e na atividade. */
export const vertex = `attribute vec2 position; varying vec2 point; void main(){point=position;gl_Position=vec4(position,0.,1.);}`;
export const fragment = `
precision highp float;
varying vec2 point;
uniform sampler2D atlas;
uniform vec2 extent;
uniform float angle;
uniform float cloudAngle;
uniform float kind;
uniform float variant;
const float PI=3.14159265359;
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float clouds3(vec3 p){return noise3(p)*.55+noise3(p*2.03+7.)*.27+noise3(p*4.09+13.)*.13+noise3(p*8.1)*.05;}
vec3 rotateY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rotateZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){
 vec2 xy=${document.documentElement.dataset.astroTema==="pixel"?"(floor(point*56.)+.5)/56.":"point"}*extent;float rr=dot(xy,xy);float z=-100.;float alpha=0.;vec3 color=vec3(0.);
 bool sphere=rr<=1.;
 if(sphere){
  z=sqrt(max(0.,1.-rr));vec3 n=vec3(xy,z);
  vec3 surface=rotateY(rotateZ(n,kind>1.5?-.15:.06),angle);
  vec2 uv=vec2(fract(atan(surface.z,surface.x)/(2.*PI)+.5),acos(clamp(surface.y,-1.,1.))/PI);
  float family=mod(variant,6.);
  float row=kind>1.5?2.:(kind>.5?1.:0.);
  if(variant>=0.)row=(family==2.||family==5.)?1.:((family==0.||family==3.)?0.:1.);
  // Pequena filtragem do material, sem borrar o contorno da esfera.
  vec2 texUV=vec2(uv.x,(row+clamp(uv.y,.008,.992))/3.);
  vec2 tap=vec2(.0022,.0011);
  vec3 texel=texture2D(atlas,texUV).rgb; if (${document.documentElement.dataset.astroTema==="pixel"?"false":"true"}) { texel *= .5;
  texel+=texture2D(atlas,vec2(fract(texUV.x+tap.x),texUV.y)).rgb*.125;
  texel+=texture2D(atlas,vec2(fract(texUV.x-tap.x),texUV.y)).rgb*.125;
  texel+=texture2D(atlas,texUV+vec2(0.,tap.y)).rgb*.125;
  texel+=texture2D(atlas,texUV-vec2(0.,tap.y)).rgb*.125;
  } color=texel;
  if(variant>=0.){
    float l=dot(texel,vec3(.299,.587,.114));
    if(family==1.)color=mix(vec3(.24,.058,.028),vec3(1.,.59,.23),smoothstep(.085,.7,l));
    if(family==2.){
      // Crosta de gelo contínua em 3D: manchas de geada e fissuras suaves.
      // Independe da textura de faixas do gigante gasoso anterior.
      float frost=smoothstep(.29,.73,clouds3(surface*3.8));
      float fissure=1.-smoothstep(.014,.050,abs(noise3(surface*11.)-.5));
      color=mix(vec3(.16,.42,.57),vec3(.82,.94,.97),frost);
      color=mix(color,vec3(.32,.62,.73),fissure*.22);
      color=mix(color,vec3(.89,.97,1.),pow(abs(surface.y),3.)*.16);
    }
    if(family==3.)color=mix(vec3(.18,.27,.47),vec3(.91,.98,1.),smoothstep(.1,.71,l));
    if(family==4.){float lava=1.-smoothstep(.025,.105,abs(noise3(surface*5.)-.49));color=mix(vec3(.17,.1,.18)+texel*.29,vec3(.99,.38,.065),lava);}
    if(family==5.)color=mix(vec3(.25,.08,.34),vec3(1.,.68,.75),smoothstep(.36,.84,l));
    if(variant>=6.){float h=fract(floor(variant/6.)*.381966)*6.283185;vec3 axis=normalize(vec3(1.));color=clamp(color*cos(h)+cross(axis,color)*sin(h)+axis*dot(axis,color)*(1.-cos(h)),0.,1.);}
  }
  float light=max(0.,dot(n,normalize(vec3(-.6,.7,1.2))));
  if(variant>=0.){
    // Contraste mais próximo do céu suave da interface.
    color=mix(color,vec3(dot(color,vec3(.299,.587,.114))),.055);
    color=mix(color,vec3(.78,.78,.82),.035);
    color*=.66+.42*light;
    // Sombra de contato no terreno logo abaixo da construção fixa.
    vec2 base=(xy-vec2(0.,.57))/vec2(.28,.085);
    float contact=exp(-dot(base,base)*1.6)*.15;
    color*=1.-contact;
  }else color*=.54+.57*light;
  color*=vec3(1.025,.99,.97);
  if(kind<.5){
   float rim=pow(1.-z,3.);color=mix(color,vec3(.65,.78,1.),rim*.35);
  }
  alpha=1.-smoothstep(.985,1.,rr);
 } else if(rr<1.08 && kind<.5){alpha=(1.-smoothstep(1.,1.08,rr))*.16;color=vec3(.69,.8,1.);}
 // Camada esférica externa: sem projeção plana, faixas ou costura na frente.
 if(kind<.5 && rr<1.2321){
  float cz=sqrt(max(0.,1.2321-rr));
  vec3 cn=rotateY(vec3(xy,cz)/1.11,cloudAngle);
  float density=smoothstep(.548,.698,clouds3(cn*vec3(6.5,9.,6.5)));
  float ca=density*.58*(1.-smoothstep(1.17,1.2321,rr));
  vec3 cc=vec3(1.,.97,.96)*(.83+.17*max(0.,dot(normalize(vec3(xy,cz)),normalize(vec3(-.6,.7,1.2)))));
  float combined=ca+alpha*(1.-ca);
  if(combined>.001)color=(cc*ca+color*alpha*(1.-ca))/combined;
  alpha=combined;
 }
 // Névoa translúcida na atmosfera. Usa ângulo oposto ao da superfície.
 if(variant>=0. && kind<1.5 && rr<1.1449){
  float mz=sqrt(max(0.,1.1449-rr));
  vec3 mn=rotateY(vec3(xy,mz)/1.07,cloudAngle*1.12+variant*.43);
  float mist=smoothstep(.43,.69,clouds3(mn*vec3(4.,11.,4.)));
  float ma=mist*.18*(1.-smoothstep(1.06,1.1449,rr));
  vec3 mc=mix(vec3(.83,.89,1.),vec3(1.,.96,.91),.5+.5*mn.y);
  float combined=ma+alpha*(1.-ma);
  if(combined>.001)color=(mc*ma+color*alpha*(1.-ma))/combined;
  alpha=combined;
 }
 if(kind>1.5){
  vec3 normal=normalize(vec3(-.28,.90,.34));
  float rz=-dot(normal.xy,xy)/normal.z;
  float ringRadius=length(vec3(xy,rz));
  if(ringRadius>1.24&&ringRadius<2.17&&rz>z){
   float bands=.5+.3*sin(ringRadius*223.)+.2*sin(ringRadius*83.);
   vec3 ringColor=mix(vec3(.69,.59,.72),vec3(.97,.80,.67),bands*.5+.25);
   float gap=1.-smoothstep(.012,.025,abs(ringRadius-1.73));
   float ringAlpha=(.35+.35*bands)*(1.-gap*.8)*smoothstep(1.24,1.3,ringRadius)*(1.-smoothstep(2.1,2.17,ringRadius));
   if(sphere){color=mix(color,ringColor,ringAlpha);alpha=1.;}
   else {color=ringColor;alpha=ringAlpha;}
  }
 }
 // Fragmentos num anel inclinado: profundidade comparada com a esfera.
 // A face traseira desaparece atrás do globo, sem objetos atravessando o chão.
 if(variant>0.){
  float family=mod(variant,6.);
  for(int j=0;j<7;j++){
   float seed=float(j), phase=cloudAngle*(.6+seed*.027)+seed*.8976+variant;
   float radius=1.095+mod(seed,3.)*.023;
   vec3 rock=vec3(cos(phase)*radius,sin(phase)*.32-.055,sin(phase)*1.075);
   float size=.020+mod(seed*7.,4.)*.008;
   vec2 delta=(xy-rock.xy)/size;
   float shape=dot(delta,delta);
   if(shape<1. && rock.z>z){
    float grain=.82+.18*noise3(vec3(delta*5.,seed));
    vec3 stone=mix(vec3(.42,.33,.29),vec3(.86,.73,.60),family/5.);
    if(family==2.||family==3.)stone=vec3(.72,.83,.94);
    float light=.52+.48*max(0.,dot(normalize(vec3(delta,sqrt(max(0.,1.-shape)))),normalize(vec3(-.6,.7,1.2))));
    float ra=(1.-smoothstep(.65,1.,shape))*.94;
    float combined=ra+alpha*(1.-ra);
    color=(stone*light*grain*ra+color*alpha*(1.-ra))/max(combined,.001);
    alpha=combined;
   }
  }
 }
 if(alpha<.001)discard;
 if(kind>1.5){alpha*=.64; color=mix(color,vec3(.84,.74,.81),.13);}
 gl_FragColor=vec4(color*alpha,alpha);
}`;

/* astro-tema-v2 */