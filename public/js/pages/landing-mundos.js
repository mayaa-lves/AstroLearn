/* Student trail artwork + real globe rotation, scoped to the landing. */
(() => {
 'use strict';
 const section=document.getElementById('como-funciona'),windowEl=section?.querySelector('.journey-window');
 if(!windowEl)return;
 const planets=[...section.querySelectorAll('.student-world')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const off=()=>reduced.matches||document.body.classList.contains('motion-off');
 const layout=()=>document.dispatchEvent(new Event('landing:layout'));
 let repaint=()=>{},disposed=false;
 // Globes only: no static observatory, rover or terrain cutouts.
 section.querySelectorAll('.world-structure').forEach(node=>node.remove());
 const captions=[...section.querySelectorAll('.journey-caption')];
 const panelButtons=[...section.querySelectorAll('[data-planet]')];
 const previews=[
  ['trilha-aluno.webp','Trilha do aluno','A trilha reúne os planetas, as missões e o progresso do aluno.','Ver a trilha'],
  ['atividade-aluno.webp','Atividade e entrega','Instruções, materiais e espaço para organizar a entrega da atividade.','Ver uma atividade'],
  ['equipe-aluno.webp','Minha equipe','Um espaço para acompanhar a equipe e organizar o trabalho em conjunto.','Ver a equipe'],
  ['correcao-professor.webp','Correção do professor','O professor consulta o trabalho, os anexos e registra sua devolutiva.','Ver uma correção']
 ];
 const panels=[],openStates=[],closing=new Set(),animations=new Set();
 const animate=(element,frames,options)=>{
  const animation=element.animate(frames,options);animations.add(animation);
  animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));return animation;
 };
 function applyState(index,open){
  const caption=captions[index];openStates[index]=open;
  caption.classList.toggle('is-previewing',open);panels[index].hidden=!open;
  section.classList.toggle('has-platform-preview',openStates.some(Boolean));
  const image=panels[index].querySelector('img');
  if(open&&!image.getAttribute('src'))image.src=image.dataset.src;
  panelButtons.filter(b=>Number(b.dataset.planet)===index).forEach(b=>b.setAttribute('aria-expanded',String(open)));
  caption.querySelector('.journey-details').textContent=open?'Recolher prévia ↑':previews[index][3]+' ↗';
  layout();repaint();
 }
 async function toggle(index){
  if(closing.has(index))return;
  if(!openStates[index]||off()||!planets[index].animate){applyState(index,!openStates[index]);return;}
  closing.add(index);
  const planet=planets[index],overview=captions[index].querySelector('.world-overview');
  const first=planet.getBoundingClientRect();
  const relevant=panelButtons.filter(b=>Number(b.dataset.planet)===index);
  relevant.forEach(button=>button.disabled=true);
  try{
   const fades=[
    animate(panels[index],[{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(18px) scale(.97)'}],{duration:230,easing:'ease-in',fill:'forwards'}),
    animate(planet,[{opacity:1},{opacity:0}],{duration:230,easing:'ease-in',fill:'forwards'})
   ];
   await Promise.all(fades.map(animation=>animation.finished.catch(()=>{})));
   fades.forEach(animation=>animation.cancel());
   applyState(index,false);
   if(off())return;
   const last=planet.getBoundingClientRect();
   const dx=first.x+first.width/2-last.x-last.width/2;
   const dy=first.y+first.height/2-last.y-last.height/2;
   const scale=first.width/last.width;
   await Promise.all([
    animate(planet,[{transform:`translate(${dx}px,${dy}px) scale(${scale})`,opacity:0},{opacity:.6,offset:.45},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:680,easing:'cubic-bezier(.2,.75,.25,1)'}).finished.catch(()=>{}),
    animate(overview,[{opacity:.35,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'ease-out'}).finished.catch(()=>{})
   ]);
  }finally{closing.delete(index);relevant.forEach(button=>button.disabled=false);repaint();}
 }
 document.addEventListener('landing:motion',()=>{if(off())animations.forEach(animation=>{try{animation.finish();}catch{}});});
 captions.forEach((caption,index)=>{
  const [file,title,description,action]=previews[index];
  const panel=document.createElement('figure');panel.className='platform-preview';panel.id='worldPreview'+index;panel.hidden=true;
  const image=document.createElement('img');image.dataset.src='public/assets/imagens/landing-previas/'+file;
  image.width=1366;image.height=768;image.alt=title+' do AstroLearn: '+description;image.decoding='async';
  const captionText=document.createElement('figcaption');captionText.textContent=title+' · Tela em evolução';
  const link=document.createElement('a');link.href=image.dataset.src;link.target='_blank';link.rel='noopener noreferrer';link.className='preview-original';link.textContent='Ver em tamanho maior ↗';link.setAttribute('aria-label','Abrir imagem da '+title.toLocaleLowerCase('pt-BR')+' em tamanho maior, em outra aba');
  const error=document.createElement('p');error.className='preview-error';error.hidden=true;error.textContent='Não foi possível carregar esta prévia. Atualize a página ou abra a imagem pelo link abaixo.';error.setAttribute('role','status');
  image.onload=()=>{error.hidden=true;layout();repaint();};image.onerror=()=>{error.hidden=false;layout();};
  const schoolLink=document.createElement('a');schoolLink.href='#planos';schoolLink.className='preview-school-link';schoolLink.textContent='Conhecer os planos para minha escola ↗';
  const links=document.createElement('div');links.className='preview-links';links.append(link,schoolLink);
  panel.append(image,captionText,error,links);caption.insertBefore(panel,caption.querySelector('.journey-details'));
  caption.querySelector('.journey-details').textContent=action+' ↗';
  const overview=document.createElement('div');overview.className='world-overview';
  [caption.querySelector('.step-number'),caption.querySelector('h3'),caption.querySelector('p'),caption.querySelector('.journey-details')].forEach(node=>{if(node)overview.append(node);});
  caption.prepend(overview);panels.push(panel);openStates.push(false);
 });
 panelButtons.forEach(button=>{const index=Number(button.dataset.planet);button.setAttribute('aria-controls','worldPreview'+index);button.setAttribute('aria-expanded','false');if(button.classList.contains('student-world'))button.setAttribute('aria-label',previews[index][3]);button.addEventListener('click',()=>toggle(index));});
 section.addEventListener('keydown',async event=>{if(event.key!=='Escape')return;const index=panels.findIndex(panel=>panel.contains(event.target)&&!panel.hidden);if(index<0)return;event.preventDefault();await toggle(index);captions[index].querySelector('.journey-details').focus();});

 const canvas=document.createElement('canvas');canvas.className='journey-planet-system';canvas.setAttribute('aria-hidden','true');windowEl.prepend(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'});
 if(!gl){canvas.remove();return;}
const vertex = `attribute vec2 position; varying vec2 point; void main(){point=position;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
varying vec2 point;
uniform sampler2D atlas;
uniform sampler2D moonAtlas;
uniform sampler2D mercuryAtlas;
uniform vec2 extent;
uniform float angle;
uniform float cloudAngle;
uniform float kind;
uniform float worldOpacity;
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
 vec2 xy=point*extent;vec2 bodyXY=xy;float rr=dot(bodyXY,bodyXY);float z=-100.;float alpha=0.;vec3 color=vec3(0.);
 bool sphere=rr<=1.;
 if(sphere){
  z=sqrt(max(0.,1.-rr));vec3 n=vec3(bodyXY,z);
  vec3 surface=rotateY(rotateZ(n,.06),angle);
  vec2 uv=vec2(fract(atan(surface.z,surface.x)/(2.*PI)+.5),acos(clamp(surface.y,-1.,1.))/PI);
  float row=kind>2.5?2.:(kind>.5?1.:0.);
  vec2 tex=vec2(uv.x,(row+clamp(uv.y,.002,.998))/3.);
  color=texture2D(atlas,tex).rgb;
  if(kind>1.5&&kind<2.5){
   // Equirectangular lunar color map: NASA Scientific Visualization Studio.
   color=texture2D(moonAtlas,uv).rgb;
  }
  if(kind>2.5){
   vec3 mercury=texture2D(mercuryAtlas,uv).rgb;
   float relief=dot(mercury,vec3(.3,.59,.11));
   // Artistic blue palette; preserve the original crater and surface contrast.
   color=mix(vec3(.055,.16,.31),vec3(.45,.77,.95),clamp(relief*1.3,0.,1.));
  }
  float light=max(0.,dot(n,normalize(vec3(-.6,.7,1.2))));
  color*=kind>2.5?(.31+.76*light):(.54+.57*light);
  color*=vec3(1.025,.99,.97);
  if(kind<.5){
   float rim=pow(1.-z,3.);color=mix(color,vec3(.65,.78,1.),rim*.22);
  }
  alpha=1.-smoothstep(.985,1.,rr);
 } else if(rr<1.08 && kind<.5){alpha=(1.-smoothstep(1.,1.08,rr))*.16;color=vec3(.69,.8,1.);}
 // Camada esférica externa: sem projeção plana, faixas ou costura na frente.
 if(kind<.5 && rr<1.2321){
  float cz=sqrt(max(0.,1.2321-rr));
  vec3 cn=rotateY(vec3(xy,cz)/1.11,cloudAngle);
  float density=smoothstep(.56,.77,clouds3(cn*vec3(5.,6.5,5.)));
  float ca=density*.42*(1.-smoothstep(1.17,1.2321,rr));
  vec3 cc=vec3(1.,.97,.96)*(.83+.17*max(0.,dot(normalize(vec3(xy,cz)),normalize(vec3(-.6,.7,1.2)))));
  float combined=ca+alpha*(1.-ca);
  if(combined>.001)color=(cc*ca+color*alpha*(1.-ca))/combined;
  alpha=combined;
 }
 // Sparse orbiting grains for Mars / Moon, projected in 3D and occluded by the globe.
 if(kind>.5&&kind<2.5){
  for(int i=0;i<28;i++){
   float seed=float(i),phase=seed*2.39996+angle*(kind<1.5?1.7:-1.2);
   float radius=1.12+.12*fract(seed*.618);
   vec3 grain=rotateZ(vec3(cos(phase)*radius,sin(phase)*radius*.26,sin(phase)*radius*.96),-.22);
   if(!sphere||grain.z>z){
    float dotRadius=.006+.007*fract(seed*.37);
    float distance=length(xy-grain.xy);
    float dustAlpha=(1.-smoothstep(dotRadius*.2,dotRadius*2.8,distance))*.42;
    vec3 dustColor=kind<1.5?vec3(.77,.47,.28):vec3(.63,.65,.72);
    float combined=dustAlpha+alpha*(1.-dustAlpha);
    if(combined>.001)color=(dustColor*dustAlpha+color*alpha*(1.-dustAlpha))/combined;
    alpha=combined;
   }
  }
 }
 if(alpha<.001)discard;
 gl_FragColor=vec4(color*alpha,alpha)*worldOpacity;
}`;
 let program,uniforms,texture,moonTexture,mercuryTexture,buffer,ready=false,visible=true,frame=0,last=0,elapsed=0,dpr=1;
 function fallback(){ready=false;document.body.classList.remove('worlds-rendered');cancelAnimationFrame(frame);frame=0;}
 function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return shader;}
 function init(){
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program unavailable');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  uniforms=Object.fromEntries(['extent','angle','cloudAngle','kind','atlas','moonAtlas','mercuryAtlas','worldOpacity'].map(name=>[name,gl.getUniformLocation(program,name)]));
  let loaded=0;const loadedOne=()=>{loaded++;if(loaded===3){ready=true;document.body.classList.add('worlds-rendered');resize();sync();}};
  function loadMap(src,unit,name,setTexture){
   const image=new Image();image.onload=()=>{
    if(disposed||gl.isContextLost())return;
    gl.useProgram(program);const map=gl.createTexture();setTexture(map);
    gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,map);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(uniforms[name],unit);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);loadedOne();
   };image.onerror=fallback;image.src=src;
  }
  const base='public/assets/imagens/';
  loadMap(base+'aluno/inicial/texturas-planetas.png',0,'atlas',map=>texture=map);
  loadMap(base+'landing-mundos/lua-lroc-1k.jpg',1,'moonAtlas',map=>moonTexture=map);
  loadMap(base+'landing-mundos/mercurio-2k.jpg',2,'mercuryAtlas',map=>mercuryTexture=map);
 }
 function draw(){
  if(!ready||disposed||gl.isContextLost())return;
  gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,moonTexture);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,mercuryTexture);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  const parent=windowEl.getBoundingClientRect();
  planets.forEach((element,index)=>{
   const rect=element.getBoundingClientRect();if(rect.right<parent.left||rect.left>parent.right||rect.bottom<0||rect.top>innerHeight)return;
   const factor=index===0?1.04:1.18;
   const cell=element.closest('.journey-world').getBoundingClientRect();
   // Fit the complete render (including dust) inside its cell and canvas.
   const availableHeight=Math.max(1,parent.height-16);
   const size=Math.max(1,Math.min(rect.width*factor,cell.width-12,availableHeight));
   const renderHeight=size;
   const centerX=rect.left-parent.left+rect.width/2;
   const centerY=Math.max(renderHeight/2+8,Math.min(parent.height-renderHeight/2-8,rect.top-parent.top+rect.height/2));
   const x=centerX-size/2,y=centerY-renderHeight/2;
   gl.viewport(Math.round(x*dpr),Math.round((parent.height-y-renderHeight)*dpr),Math.round(size*dpr),Math.round(renderHeight*dpr));
   const kind=index,extent=index===0?1.18:1.35;
   gl.uniform2f(uniforms.extent,extent,extent*renderHeight/size);gl.uniform1f(uniforms.kind,kind);gl.uniform1f(uniforms.worldOpacity,Number(getComputedStyle(element).opacity));
   gl.uniform1f(uniforms.angle,elapsed*Math.PI*2/120+index*.71+Number(element.dataset.rotation||0)*Math.PI/180);
   gl.uniform1f(uniforms.cloudAngle,index===2?-1:-elapsed*Math.PI*2/90+index*.71);
   gl.drawArrays(gl.TRIANGLES,0,6);
  });
 }
 function tick(now){frame=0;if(disposed||off()||document.hidden||!visible)return;elapsed+=Math.min(.05,last?(now-last)/1000:0);last=now;draw();frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;draw();if(ready&&!disposed&&!off()&&!document.hidden&&visible)frame=requestAnimationFrame(tick);}
 function resize(){const rect=windowEl.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));draw();}
 repaint=draw;
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(windowEl);
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});visibility.observe(windowEl);
 document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',sync);document.addEventListener('landing:layout',resize);window.addEventListener('resize',resize,{passive:true});window.addEventListener('scroll',()=>{if(off())draw();},{passive:true});reduced.addEventListener('change',sync);
 window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);if(!event.persisted){disposed=true;resizeObserver.disconnect();visibility.disconnect();gl.deleteTexture(texture);gl.deleteTexture(moonTexture);gl.deleteTexture(mercuryTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}});window.addEventListener('pageshow',sync);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});canvas.addEventListener('webglcontextrestored',()=>{try{init();}catch{fallback();}});
 try{init();}catch{fallback();}
})();
