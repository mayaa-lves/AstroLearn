/* Esferas WebGL com rotação longitudinal real. Um único contexto para toda a página.
   As construções das imagens aprovadas permanecem sobre os globos da trilha. */
const canvas = document.createElement('canvas');
canvas.className = 'planet-system';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const gl = canvas.getContext('webgl', { alpha:true, antialias:true, premultipliedAlpha:true, powerPreference:'low-power' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stopped = () => reduced.matches || document.hidden || document.body.classList.contains('astro-motion-off') || document.body.classList.contains('motion-reduced');
import {vertex, fragment} from "../../components/planeta-shaders.js";
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
 gl.uniform1f(uniforms.cloudAngle,-elapsed*Math.PI*2/75+offset);
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
