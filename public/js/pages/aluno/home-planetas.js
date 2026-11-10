/* Esferas WebGL com rotação longitudinal real. Um único contexto para toda a página.
   As construções das imagens aprovadas permanecem sobre os globos da trilha. */
const canvas = document.createElement('canvas');
canvas.className = 'planet-system';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const gl = canvas.getContext('webgl', { alpha:true, antialias:true, premultipliedAlpha:true, powerPreference:'low-power' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stopped = () => reduced.matches || document.hidden || document.body.classList.contains('astro-motion-off') || document.body.classList.contains('motion-reduced');
const vertex = `attribute vec2 position; varying vec2 point; void main(){point=position;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
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
 vec2 xy=point*extent;float rr=dot(xy,xy);float z=-100.;float alpha=0.;vec3 color=vec3(0.);
 bool sphere=rr<=1.;
 if(sphere){
  z=sqrt(max(0.,1.-rr));vec3 n=vec3(xy,z);
  vec3 surface=rotateY(rotateZ(n,kind>1.5?-.15:.06),angle);
  vec2 uv=vec2(fract(atan(surface.z,surface.x)/(2.*PI)+.5),acos(clamp(surface.y,-1.,1.))/PI);
  float family=mod(variant,6.);
  float row=kind>1.5?2.:(kind>.5?1.:0.);
  if(variant>=0.)row=(family==2.||family==5.)?2.:((family==0.||family==3.)?0.:1.);
  vec3 texel=texture2D(atlas,vec2(uv.x,(row+clamp(uv.y,.002,.998))/3.)).rgb;
  color=texel;
  if(variant>=0.){
    float l=dot(texel,vec3(.299,.587,.114));
    if(family==1.)color=mix(vec3(.24,.058,.028),vec3(1.,.59,.23),smoothstep(.085,.7,l));
    if(family==2.)color=mix(vec3(.055,.19,.48),vec3(.58,.93,.98),smoothstep(.40,.82,l));
    if(family==3.)color=mix(vec3(.18,.27,.47),vec3(.91,.98,1.),smoothstep(.1,.71,l));
    if(family==4.){float lava=1.-smoothstep(.025,.105,abs(noise3(surface*5.)-.49));color=mix(vec3(.17,.1,.18)+texel*.29,vec3(.99,.38,.065),lava);}
    if(family==5.)color=mix(vec3(.25,.08,.34),vec3(1.,.68,.75),smoothstep(.36,.84,l));
    if(variant>=6.){float h=fract(floor(variant/6.)*.381966)*6.283185;vec3 axis=normalize(vec3(1.));color=clamp(color*cos(h)+cross(axis,color)*sin(h)+axis*dot(axis,color)*(1.-cos(h)),0.,1.);}
  }
  float light=max(0.,dot(n,normalize(vec3(-.6,.7,1.2))));
  color*=.54+.57*light;
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
  float ca=density*.77*(1.-smoothstep(1.17,1.2321,rr));
  vec3 cc=vec3(1.,.97,.96)*(.83+.17*max(0.,dot(normalize(vec3(xy,cz)),normalize(vec3(-.6,.7,1.2)))));
  float combined=ca+alpha*(1.-ca);
  if(combined>.001)color=(cc*ca+color*alpha*(1.-ca))/combined;
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
 if(alpha<.001)discard;
 if(kind>1.5){alpha*=.64; color=mix(color,vec3(.84,.74,.81),.13);}
 gl_FragColor=vec4(color*alpha,alpha);
}`;
let program, uniforms, ready=false, frame=0, last=0, elapsed=0, dpr=1, planets=[];
function fallback(){document.body.classList.remove('planets-ready');for(const e of planets){const art=e.querySelector('.planet-art');if(art){art.style.transform='';art.style.opacity='';}}}
function compile(type, source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
function init(){
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 uniforms=Object.fromEntries(['extent','angle','cloudAngle','kind','atlas','variant'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const image=new Image();
 image.onload=()=>{
  if(gl.isContextLost())return;
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  gl.uniform1i(uniforms.atlas,0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  ready=true;document.body.classList.add('planets-ready');resize();sync();
 };
 image.onerror=()=>{fallback();canvas.remove();};
 image.src=new URL('../../../assets/imagens/aluno/inicial/texturas-planetas.png',import.meta.url).href;
}
function resize(){dpr=Math.min(devicePixelRatio||1,1.35);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);draw();}
function sphere(rect, kind, offset=0, moon=false,variant=-1){
 if(rect.x+rect.w<0||rect.x>innerWidth||rect.y+rect.h<0||rect.y>innerHeight)return;
 gl.viewport(Math.round(rect.x*dpr),Math.round((innerHeight-rect.y-rect.h)*dpr),Math.round(rect.w*dpr),Math.round(rect.h*dpr));
 const modPeriod=(Math.max(0,variant)*7)%24;
 const extent=kind===2?2.4:1.18;
 gl.uniform2f(uniforms.extent,extent,extent*rect.h/rect.w);
 gl.uniform1f(uniforms.kind,kind);gl.uniform1f(uniforms.variant,variant);
 gl.uniform1f(uniforms.angle,elapsed*Math.PI*2/(kind===2?180:42+modPeriod)+offset);
 gl.uniform1f(uniforms.cloudAngle,moon?-1:-elapsed*Math.PI*2/75+offset);
 gl.drawArrays(gl.TRIANGLES,0,6);
}
function draw(){
 if(!ready||gl.isContextLost())return;
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 const skyWidth=innerWidth<801?440:680;
 sphere({x:innerWidth-skyWidth*.76,y:innerWidth<801?-45:-38,w:skyWidth,h:skyWidth*.63},2);
 for(const element of planets){
  const rect=element.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;
  const i=Number(element.dataset.indice),s=rect.width*1.04;
  sphere({x:rect.left-rect.width*.02,y:rect.top+rect.height*.08,w:s,h:s},i%6===0?0:1,i*.71,i===2,i);

 }
 canvas.dataset.angle=String(elapsed*3.6%360);
 canvas.dataset.cloudAngle=String(-elapsed*4.8%360);
}
function tick(now){frame=0;if(stopped())return;const dt=Math.min(.05,last?(now-last)/1000:0);last=now;elapsed+=dt;draw();frame=requestAnimationFrame(tick);}
function sync(){cancelAnimationFrame(frame);frame=0;last=0;draw();if(ready&&!stopped())frame=requestAnimationFrame(tick);}
function collect(){planets=[...document.querySelectorAll('.step:not(.locked) .planet')];draw();}
if(gl){
 try{init();}catch{fallback();canvas.remove();}
 document.addEventListener('astrolearn:planets',collect);
 new MutationObserver(collect).observe(document.getElementById('missionList'),{childList:true});
 document.addEventListener('astrolearn:motion',sync);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',sync);
 window.addEventListener('resize',resize,{passive:true});
 window.addEventListener('scroll',()=>{if(stopped())draw();},{passive:true});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);last=0;});
 window.addEventListener('pageshow',sync);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;cancelAnimationFrame(frame);fallback();});
 canvas.addEventListener('webglcontextrestored',()=>{init();collect();});
 collect();
}else canvas.remove();
