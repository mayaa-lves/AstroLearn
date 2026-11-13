import {vertex,fragment} from './professor-planeta-material.js';
// A single GPU context serves all cards; each visible card keeps its own image.
const targets=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const surface=document.createElement('canvas');surface.width=surface.height=256;
let gl,program,uniforms,ready=false,frame=0,last=0,elapsed=0;
const paused=()=>document.hidden||reduced.matches||document.body.classList.contains('astro-motion-off')||document.body.classList.contains('motion-reduced');
function wake(){if(!frame){last=0;frame=requestAnimationFrame(draw);}}
function draw(now){
 frame=0;
 if(!ready)return;
 if(last&&!paused())elapsed+=Math.min(now-last,100)/1000;
 last=now;
 gl.clearColor(0,0,0,0);
 for(const [canvas,item] of targets){
  if(!canvas.isConnected){targets.delete(canvas);continue;}
  const rect=canvas.getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight||rect.width===0)continue;
  const index=item.index;
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(uniforms.extent,1.2,1.2);
  gl.uniform1f(uniforms.kind,index%6===0?0:1);
  gl.uniform1f(uniforms.variant,index);
  gl.uniform1f(uniforms.angle,elapsed*Math.PI*2/(42+index%7*4)+index*.71);
  gl.uniform1f(uniforms.cloudAngle,-elapsed*Math.PI*2/75+index*.71);
  gl.drawArrays(gl.TRIANGLES,0,6);
  item.context.clearRect(0,0,256,256);
  item.context.drawImage(surface,0,0);
  if(!canvas.classList.contains('is-rendered'))canvas.classList.add('is-rendered');
 }
 if(targets.size&&!paused())frame=requestAnimationFrame(draw);
}
function initialize(){
 try{
  gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,powerPreference:'low-power'});
  if(!gl)return;
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  uniforms=Object.fromEntries(['extent','kind','variant','angle','cloudAngle','atlas'].map(n=>[n,gl.getUniformLocation(program,n)]));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  const image=new Image();
  image.onload=()=>{
   gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.uniform1i(uniforms.atlas,0);gl.viewport(0,0,256,256);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);ready=true;wake();
  };
  image.src=new URL('../../assets/imagens/professor/mural-texturas.png',import.meta.url).href;
 }catch(error){console.warn('Planetas: usando visual estático.',error);}
}
export function registrarPlaneta(canvas,index){
 const context=canvas.getContext('2d');if(!context)return;
 targets.set(canvas,{index,context});wake();
}
surface.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;cancelAnimationFrame(frame);frame=0;});
surface.addEventListener('webglcontextrestored',initialize);
reduced.addEventListener('change',wake);
document.addEventListener('visibilitychange',wake);
new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',wake,{passive:true});
initialize();
