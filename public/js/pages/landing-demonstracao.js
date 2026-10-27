/* Isolated public demo. All examples stay in memory; no API or account access. */
(() => {
 'use strict';
 const root=document.querySelector('.audience-demo');if(!root)return;
 const $=id=>root.querySelector('#'+id);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const off=()=>reduced.matches||document.body.classList.contains('motion-off');
 const layout=()=>document.dispatchEvent(new Event('landing:layout'));
 const announce=text=>{$('demoAnnouncement').textContent=text;};
 const planets=[...root.querySelectorAll('[data-demo-mission]')];
 const missions=[
  {title:'Missão 1 · Nosso planeta',description:'Investigue como podemos cuidar da água.',deliver:'Uma foto ou um pequeno relato.',guide:'Observe onde a água é usada no seu dia e escolha uma forma de evitar desperdício. Explique sua ideia com suas palavras.'},
  {title:'Missão 2 · Um robô em Marte',description:'Imagine um robô capaz de explorar um terreno com obstáculos.',deliver:'Um desenho do seu robô e uma explicação de como ele se movimenta.',guide:'Pense no caminho do robô: quais obstáculos ele pode encontrar? Escolha rodas, pernas ou esteiras e explique sua decisão.'},
  {title:'Sua próxima descoberta',description:'Algumas missões só ficam disponíveis conforme o aluno avança na trilha.',deliver:'Conclua os passos anteriores para descobrir a próxima proposta. Nesta demonstração, você pode explorar as missões 1 e 2.',locked:true}
 ];
 let infoAnimation;
 function animateCard(card){
  infoAnimation?.cancel();
  if(!off()&&card.animate)infoAnimation=card.animate([{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
 }
 function selectMission(index,notify=true){
  const mission=missions[index];if(!mission)return;
  planets.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  $('demoMissionTitle').textContent=mission.title;
  $('demoMissionDescription').textContent=mission.description;
  $('demoMissionDeliver').textContent=mission.deliver;
  $('demoDeliverLabel').textContent=mission.locked?'Como desbloquear':'O que entregar';
  $('demoMaterialTopic').hidden=Boolean(mission.locked);
  $('demoGuideContent').textContent=mission.guide||'';
  $('demoGuide').hidden=true;$('demoGuideToggle').setAttribute('aria-expanded','false');
  animateCard($('demoMissionInfo'));if(notify)announce(mission.title+'. '+mission.description);layout();
 }
 planets.forEach((button,index)=>button.addEventListener('click',()=>selectMission(index)));
 $('demoTrail').addEventListener('keydown',event=>{
  const index=planets.indexOf(event.target);if(index<0)return;let next;
  if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%planets.length;
  if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+planets.length-1)%planets.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=planets.length-1;
  if(next!==undefined){event.preventDefault();planets[next].focus();selectMission(next);}
 });
 $('demoGuideToggle').addEventListener('click',()=>{
  const open=$('demoGuide').hidden;$('demoGuide').hidden=!open;
  $('demoGuideToggle').setAttribute('aria-expanded',String(open));layout();
 });
 const initial=()=>({
  ana:{name:'Ana',answer:'Minha proposta é reaproveitar a água da chuva para regar as plantas.',grade:'9,0',feedback:'Boa ideia! Explique como seria a coleta.',corrected:false},
  caio:{name:'Caio',answer:'Podemos fechar a torneira enquanto ensaboamos as mãos e verificar se há vazamentos.',grade:'8,5',feedback:'',corrected:false},
  lia:{name:'Lia',answer:'Criei uma campanha com cartazes para lembrar a turma de evitar o desperdício de água.',grade:'10',feedback:'Sua proposta envolve toda a turma. Muito bem!',corrected:true}
 });
 let students=initial(),selected='ana';
 const deliveries=[...root.querySelectorAll('[data-demo-student]')];
 function storeDraft(){students[selected].grade=$('demoGrade').value;students[selected].feedback=$('demoFeedback').value;}
 function renderDeliveries(){deliveries.forEach(button=>{
  const id=button.dataset.demoStudent,student=students[id];
  button.setAttribute('aria-pressed',String(id===selected));button.dataset.corrected=String(student.corrected);
  button.querySelector('.demo-delivery-status').textContent=student.corrected?'Corrigida':'Entregue';
 });}
 function selectDelivery(id,notify=true){
  const student=students[id];if(!student)return;
  selected=id;renderDeliveries();$('demoCorrectionTitle').textContent='Entrega de '+student.name;
  $('demoStudentAnswer').textContent=student.answer;$('demoGrade').value=student.grade;$('demoFeedback').value=student.feedback;
  $('demoGrade').removeAttribute('aria-invalid');$('demoFormFeedback').classList.remove('is-error');$('demoFormFeedback').textContent='';
  $('demoSendFeedback').textContent=student.corrected?'Atualizar devolutiva':'Enviar devolutiva';
  animateCard($('demoCorrection'));if(notify)announce('Entrega de '+student.name+' selecionada.');
 }
 deliveries.forEach(button=>button.addEventListener('click',()=>{storeDraft();selectDelivery(button.dataset.demoStudent);}));
 $('demoGrade').addEventListener('input',()=>{$('demoGrade').removeAttribute('aria-invalid');storeDraft();});
 $('demoFeedback').addEventListener('input',storeDraft);
 $('demoCorrectionForm').addEventListener('submit',event=>{
  event.preventDefault();const raw=$('demoGrade').value.trim(),grade=Number(raw.replace(',','.'));
  if(!/^\d{1,2}(?:[.,]\d{1,2})?$/.test(raw)||!Number.isFinite(grade)||grade<0||grade>10){
   $('demoGrade').setAttribute('aria-invalid','true');$('demoFormFeedback').classList.add('is-error');
   $('demoFormFeedback').textContent='Informe uma nota de 0 a 10, como 8,5.';$('demoGrade').focus();return;
  }
  storeDraft();students[selected].corrected=true;renderDeliveries();
  $('demoFormFeedback').classList.remove('is-error');$('demoFormFeedback').textContent='Devolutiva simulada enviada para '+students[selected].name+'.';
  $('demoSendFeedback').textContent='Atualizar devolutiva';layout();
 });
 $('demoReset').addEventListener('click',()=>{
  students=initial();selectDelivery('ana',false);selectMission(0,false);$('studentTab').click();
  announce('Demonstração reiniciada. As entregas voltaram ao estado inicial.');layout();
 });
 // Existing landing.js owns the accessible role tabs (including arrow keys).
 const roleObserver=new MutationObserver(()=>{layout();sync();});
 roleObserver.observe($('studentPanel'),{attributes:true,attributeFilter:['hidden']});
 roleObserver.observe($('teacherPanel'),{attributes:true,attributeFilter:['hidden']});

 // One WebGL context for the three native demo planets, independent of the journey.
 const trail=$('demoTrail'),canvas=document.createElement('canvas');
 canvas.className='demo-trail-canvas';canvas.setAttribute('aria-hidden','true');trail.prepend(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'});
 let disposed=false,ready=false,visible=false,frame=0,last=0,elapsed=0,program,buffer,dpr=1;
 const textures=[],uniforms={};
 function fallback(){ready=false;root.classList.remove('demo-rendered');cancelAnimationFrame(frame);frame=0;}
 function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Demo shader unavailable');return shader;}
 function draw(){
  if(!gl||!ready||disposed||gl.isContextLost())return;
  gl.useProgram(program);textures.forEach((texture,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);});
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);const parent=trail.getBoundingClientRect();
  planets.forEach((button,index)=>{
   const rect=button.getBoundingClientRect(),size=rect.width;
   gl.viewport(Math.round((rect.left-parent.left)*dpr),Math.round((parent.height-(rect.top-parent.top)-size)*dpr),Math.round(size*dpr),Math.round(size*dpr));
   gl.uniform1f(uniforms.kind,index);gl.uniform1f(uniforms.pixelStyle,document.documentElement.dataset.visualStyle==='pixel'?1:0);gl.uniform1f(uniforms.angle,elapsed*Math.PI*2/130+index*.65);gl.drawArrays(gl.TRIANGLES,0,6);
  });
 }
 function tick(now){frame=0;if(disposed||off()||document.hidden||!visible||$('studentPanel').hidden)return;elapsed+=Math.min(.05,last?(now-last)/1000:0);last=now;draw();frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(off())infoAnimation?.finish();draw();if(ready&&!disposed&&!off()&&!document.hidden&&visible&&!$('studentPanel').hidden)frame=requestAnimationFrame(tick);}
 function resize(){if(!gl||disposed)return;const rect=trail.getBoundingClientRect();if(rect.width<1||rect.height<1)return;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);draw();}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(trail);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(trail);
 document.addEventListener('landing:style',sync);document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 window.addEventListener('resize',resize,{passive:true});window.addEventListener('pageshow',sync);
 window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);if(!event.persisted){disposed=true;roleObserver.disconnect();resizeObserver.disconnect();observer.disconnect();if(gl){textures.forEach(texture=>gl.deleteTexture(texture));gl.deleteBuffer(buffer);gl.deleteProgram(program);}}});
 function init(){
  const vertex='attribute vec2 position;varying vec2 point;void main(){point=position;gl_Position=vec4(position,0.,1.);}';
  const fragment=`precision highp float;varying vec2 point;uniform sampler2D atlas;uniform sampler2D moon;uniform float kind;uniform float angle;uniform float pixelStyle;
   void main(){vec2 xy=(pixelStyle>.5?floor(point*32.)/32.:point)*1.07;float rr=dot(xy,xy);if(rr>1.)discard;float z=sqrt(1.-rr);vec3 n=vec3(xy,z);float c=cos(angle),s=sin(angle);vec3 p=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vec2 uv=vec2(fract(atan(p.z,p.x)/6.2831853+.5),acos(clamp(p.y,-1.,1.))/3.14159265);vec3 color=kind>1.5?texture2D(moon,uv).rgb:texture2D(atlas,vec2(uv.x,(kind+clamp(uv.y,.002,.998))/3.)).rgb;float light=max(0.,dot(n,normalize(vec3(-.6,.7,1.2))));color*=.48+.59*light;if(kind>1.5)color*=.67;float a=1.-smoothstep(.98,1.,rr);if(pixelStyle>.5){color=floor(color*14.+.5)/14.;a=step(.5,a);}
   gl_FragColor=vec4(color*a,a);}`;
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Demo program unavailable');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  ['kind','angle','atlas','moon','pixelStyle'].forEach(name=>uniforms[name]=gl.getUniformLocation(program,name));
  let loaded=0;
  ['public/assets/imagens/aluno/inicial/texturas-planetas.png','public/assets/imagens/landing-mundos/lua-lroc-1k.jpg'].forEach((src,i)=>{
   const image=new Image();image.onload=()=>{if(disposed||gl.isContextLost())return;gl.useProgram(program);const texture=gl.createTexture();textures[i]=texture;gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(i===0?uniforms.atlas:uniforms.moon,i);loaded++;if(loaded===2){ready=true;root.classList.add('demo-rendered');resize();sync();}};image.onerror=fallback;image.src=src;
  });
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 }
 if(gl){canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});canvas.addEventListener('webglcontextrestored',()=>{try{init();}catch{fallback();}});try{init();}catch{fallback();}}else canvas.remove();
})();

/* Moving decorative points: independent from UI and globe rendering. */
(() => {
 'use strict';
 const root=document.querySelector('.audience-demo');if(!root)return;
 const canvas=document.createElement('canvas');canvas.className='demo-stars';canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.remove();return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const off=()=>reduced.matches||document.body.classList.contains('motion-off');
 const pointer={x:-9999,y:-9999,vx:0,vy:0,time:0};
 let width=0,height=0,frame=0,last=0,clock=0,visible=false,disposed=false;
 const points=[],created=[];const colors=['#9a70e5','#9075d3','#46cbb4','#56cdbd'];
 function makePoint(x,y,large=false){return{x,y,phase:Math.random()*Math.PI*2,r:large?2.5:.8+Math.random()*1.7,speed:19+Math.random()*22,offsetX:0,offsetY:0,forceX:0,forceY:0,color:colors[Math.floor(Math.random()*colors.length)],diamond:large||Math.random()<.17};}
 function resize(){
  const rect=root.getBoundingClientRect(),oldWidth=width,oldHeight=height;width=rect.width;height=rect.height;
  if(width<1||height<1)return;const dpr=document.documentElement.dataset.visualStyle==='pixel'?.3:Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!points.length){for(let i=0;i<(width<700?35:65);i++)points.push(makePoint(Math.random()*width,Math.random()*height));}
  else if(oldWidth&&oldHeight)points.forEach(p=>{p.x=p.x/oldWidth*width;p.y=p.y/oldHeight*height;});
  draw(performance.now(),true);schedule();
 }
 function draw(now,still=false){
  if(!still)frame=0;if(disposed)return;
  const running=!off()&&!still,dt=Math.min(.04,Math.max(0,last?(now-last)/1000:0));last=now;
  if(running)clock+=dt;ctx.clearRect(0,0,width,height);
  points.forEach(p=>{
   const wave=Math.sin(clock*.38+p.phase)*7;
   if(running){
    p.x-=p.speed*dt;if(p.x<-20)p.x=width+20;
    const dx=p.x+p.offsetX-pointer.x,dy=p.y+wave+p.offsetY-pointer.y,d=Math.hypot(dx,dy);
    if(d<130){const falloff=1-d/130,angle=d>.1?Math.atan2(dy,dx):p.phase;p.forceX+=(Math.cos(angle)*1050+pointer.vx*.85)*falloff*dt;p.forceY+=(Math.sin(angle)*1050+pointer.vy*.85)*falloff*dt;}
    p.forceX=(p.forceX-p.offsetX*3.8*dt)*Math.exp(-dt*2.7);p.forceY=(p.forceY-p.offsetY*3.8*dt)*Math.exp(-dt*2.7);
    p.offsetX=Math.max(-180,Math.min(180,p.offsetX+p.forceX*dt));p.offsetY=Math.max(-180,Math.min(180,p.offsetY+p.forceY*dt));
   }
   ctx.save();ctx.translate(p.x+p.offsetX,p.y+wave+p.offsetY);ctx.fillStyle=p.color;ctx.globalAlpha=.43+Math.sin(clock*.5+p.phase)*.14;
   ctx.beginPath();if(p.diamond){ctx.moveTo(0,-p.r*1.5);ctx.lineTo(p.r,0);ctx.lineTo(0,p.r*1.5);ctx.lineTo(-p.r,0);ctx.closePath();}else ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  if(running){pointer.vx*=Math.exp(-dt*6);pointer.vy*=Math.exp(-dt*6);}
  if(running&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
 }
 function schedule(){if(!frame&&!disposed&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}}
 function resetPointer(){pointer.x=pointer.y=-9999;pointer.vx=pointer.vy=0;pointer.time=0;}
 root.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||off())return;const rect=root.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,now=performance.now(),dt=Math.max(.012,(now-pointer.time)/1000);
  pointer.vx=pointer.time&&dt<.2?Math.max(-1200,Math.min(1200,(x-pointer.x)/dt)):0;
  pointer.vy=pointer.time&&dt<.2?Math.max(-1200,Math.min(1200,(y-pointer.y)/dt)):0;
  pointer.x=x;pointer.y=y;pointer.time=now;schedule();
 },{passive:true});
 root.addEventListener('pointerleave',resetPointer);
 root.addEventListener('click',event=>{
  if(off()||event.target.closest('button,a,input,textarea,select,label,.demo-info,.demo-deliveries'))return;
  const rect=root.getBoundingClientRect(),p=makePoint(event.clientX-rect.left,event.clientY-rect.top,true);
  p.phase=0;p.y-=Math.sin(clock*.38)*7;points.push(p);created.push(p);
  if(created.length>20){const old=created.shift(),index=points.indexOf(old);if(index>=0)points.splice(index,1);}schedule();
 });
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(off())resetPointer();draw(performance.now(),true);schedule();}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(root);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;resetPointer();}else schedule();});observer.observe(root);
 reduced.addEventListener('change',sync);document.addEventListener('landing:style',resize);document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else sync();});
 window.addEventListener('pageshow',sync);window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);if(!event.persisted){disposed=true;resizeObserver.disconnect();observer.disconnect();}});
 resize();
})();
