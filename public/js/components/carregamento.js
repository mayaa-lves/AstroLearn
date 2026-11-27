/* Espera compartilhada: acompanha dados reais, sem esperar imagens decorativas. */
(() => {
 if(!/\/(aluno|professor)\//.test(location.pathname)||document.getElementById('astroPageLoader'))return;
 const root=document.documentElement,teacher=location.pathname.includes('/professor/'),asset=new URL('../../assets/',document.currentScript.src);
 const motion=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('astro-motion-off');
 const pixel=root.dataset.astroTema==='pixel'||root.dataset.visualStyle==='pixel';
 const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
 const layer=make('section');layer.id='astroPageLoader';layer.setAttribute('aria-label','Preparando a página');
 const sky=make('div','loading-sky');sky.setAttribute('aria-hidden','true');
 for(let i=0;i<32;i++){const s=make('i');s.style.cssText=`--x:${(i*37+11)%100}%;--y:${(i*23+7)%100}%;--delay:${i%7*.4}s;--size:${i%3+1}px`;sky.append(s);}
 sky.append(make('span','loading-comet'));layer.append(sky,make('div','loading-window-frame'));
 const peek=make('button','loading-peek');peek.type='button';peek.setAttribute('aria-label','Encontrar outro mascote');
 const sprite=make('span','loading-peek-sprite');sprite.setAttribute('aria-hidden','true');
 sprite.style.backgroundImage=`url("${new URL('tutorial/professor/'+(pixel?'mascotes-poses-pixel.png':'mascotes-poses.png'),asset).href}")`;peek.append(sprite);
 const center=make('div','loading-center'),scene=make('div','loading-orbit-scene');
 const logo=make('img','loading-logo');logo.src=new URL('imagens/marca/astrolearn-livro-simbolo.svg',asset).href;logo.alt='AstroLearn';logo.width=68;logo.height=68;
 for(let i=0;i<2;i++){const ring=make('span','loading-orbit-ring');ring.setAttribute('aria-hidden','true');ring.style.setProperty('--orbit-index',i);ring.append(make('i'));scene.append(ring);}
 const glow=make('span','loading-core-glow');glow.setAttribute('aria-hidden','true');scene.append(glow,logo);
 const constellation=document.createElementNS('http://www.w3.org/2000/svg','svg');constellation.setAttribute('viewBox','0 0 360 270');constellation.setAttribute('aria-hidden','true');constellation.classList.add('loading-constellation');
 const curve=document.createElementNS(constellation.namespaceURI,'path');curve.setAttribute('d','M55 152 Q44 44 122 49 Q211 10 284 87 Q340 155 269 220 Q175 280 55 152');constellation.append(curve);scene.append(constellation);
 const message=make('p','loading-message',teacher?'Preparando sua estação…':'Preparando sua próxima descoberta…');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 const gameHint=make('p','loading-game-hint','Enquanto isso, acenda as estrelas ✦');
 const score=make('span','loading-game-score','0 de 5 estrelas');score.setAttribute('aria-live','polite');
 const positions=[[15.3,56.3],[33.9,18.1],[78.9,32.2],[74.7,81.5],[51,90]],stars=[];let lit=0;
 positions.forEach(([x,y],i)=>{const star=make('button','loading-star');const glyph=make('span','','✦');glyph.setAttribute('aria-hidden','true');star.append(glyph);star.type='button';star.setAttribute('aria-label','Acender estrela '+(i+1));star.setAttribute('aria-pressed','false');star.style.cssText=`left:${x}%;top:${y}%;--star-delay:${i*.25}s`;star.onclick=()=>{
  if(done||star.getAttribute('aria-pressed')==='true')return;star.setAttribute('aria-pressed','true');lit++;score.textContent=`${lit} de 5 estrelas`;burst(star);if(lit===5){gameHint.textContent='Sua constelação está acesa ✦';scene.classList.add('is-complete');moveMascot(3,7);}
 };stars.push(star);scene.append(star);});
 const activity=make('span','loading-activity');activity.setAttribute('aria-hidden','true');activity.append(make('i'));
 const more=make('button','loading-continue','Continuar na página');more.type='button';more.hidden=true;
 center.append(scene,message,activity,gameHint,score,more);layer.append(peek,center);document.body.append(layer);root.classList.add('astro-page-loading');
 const pending=new Set(),effects=new Set();let done=false,sawPrimary=false,quietTimer=0,moveTimer=0,lastCorner=-1,pointerFrame=0;
 const page=document.body.dataset.page,area=document.body.dataset.studentArea;
 const expectsMain=teacher?(page==='rooms'||!!new URLSearchParams(location.search).get('sala')||document.body.classList.contains('profile-page')):['home','atividade','biblioteca','equipe','perfil','quizzes'].includes(area);
 try{const n=sessionStorage.getItem('astrolearn-loading-corner');if(n!==null)lastCorner=Number(n);}catch{}
 function place(corner,pose){lastCorner=corner;peek.dataset.corner=String(corner);sprite.style.backgroundPosition=`${(pose%4)*100/3}% ${pose<4?0:100}%`;try{sessionStorage.setItem('astrolearn-loading-corner',String(corner));}catch{}peek.classList.remove('is-hiding');}
 function moveMascot(corner,pose){
  if(done)return;const choices=[0,1,2,3].filter(n=>n!==lastCorner);corner=corner??choices[Math.floor(Math.random()*choices.length)];pose=pose??corner;
  clearTimeout(moveTimer);if(lastCorner<0||!motion()){place(corner,pose);return;}
  peek.classList.add('is-hiding');moveTimer=setTimeout(()=>{if(!done)place(corner,pose);},180);
 }
 function burst(star){if(!motion())return;for(let i=0;i<6;i++){const spark=make('i','loading-spark');spark.style.cssText=`left:${star.style.left};top:${star.style.top};--dx:${Math.cos(i*Math.PI/3)*46}px;--dy:${Math.sin(i*Math.PI/3)*46}px`;scene.append(spark);const timer=setTimeout(()=>{spark.remove();effects.delete(timer);},650);effects.add(timer);}}
 function pointer(event){if(!motion()||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;if(done)return;sprite.style.setProperty('--look-x',((event.clientX/innerWidth-.5)*14).toFixed(1)+'px');sprite.style.setProperty('--look-y',((event.clientY/innerHeight-.5)*10).toFixed(1)+'px');});}
 peek.onclick=()=>{burst(stars[lit%5]);moveMascot();};layer.addEventListener('pointermove',pointer,{passive:true});
 moveMascot();
 function primary(path){return teacher?path.startsWith('/api/professor/')||document.body.classList.contains('profile-page')&&path==='/api/perfil':path.startsWith('/api/aluno/')||path.startsWith('/api/professor/salas/')||document.body.classList.contains('profile-page')&&path==='/api/perfil';}
 function uiBusy(){const content=document.getElementById('content')||document.getElementById('missionList')||document.getElementById('materialList');return content?.getAttribute('aria-busy')==='true';}
 function request(event){const {phase,id,path,metodo}=event.detail||{};if(done||metodo!=='GET'||typeof path!=='string'||!primary(path))return;if(phase==='start'){sawPrimary=true;pending.add(id);clearTimeout(quietTimer);}else if(phase==='end'){pending.delete(id);check();}}
 function check(){clearTimeout(quietTimer);if(done||pending.size||uiBusy()||expectsMain&&!sawPrimary)return;quietTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!done&&!pending.size&&!uiBusy())finish();else check();})),80);}
 const observer=new MutationObserver(check);const content=document.getElementById('content')||document.getElementById('missionList')||document.getElementById('materialList');if(content)observer.observe(content,{attributes:true,attributeFilter:['aria-busy']});
 function finish(){
  if(done)return;done=true;const wasFocused=layer.contains(document.activeElement);clearTimeout(quietTimer);clearTimeout(moveTimer);clearTimeout(slowTimer);clearTimeout(limit);clearInterval(corners);for(const t of effects)clearTimeout(t);cancelAnimationFrame(pointerFrame);observer.disconnect();window.removeEventListener('astrolearn:request',request);layer.removeEventListener('pointermove',pointer);root.classList.remove('astro-page-loading','astro-teacher-loading');layer.remove();if(wasFocused)document.getElementById('main')?.focus({preventScroll:true});window.dispatchEvent(new Event('astrolearn:page-ready'));
 }
 more.onclick=finish;window.addEventListener('astrolearn:request',request);for(const [id,info]of window.__astroLoadingRequests||[])if(info.metodo==='GET'&&primary(info.path)){sawPrimary=true;pending.add(id);}
 const corners=setInterval(()=>{if(motion()&&lit<5)moveMascot();},2600);
 const slowTimer=setTimeout(()=>{if(done)return;message.textContent='A conexão está demorando um pouco.';more.hidden=false;},3000);
 const limit=setTimeout(finish,7000);
 window.addEventListener('pagehide',finish,{once:true});window.addEventListener('pageshow',event=>{if(event.persisted)finish();});check();
})();
