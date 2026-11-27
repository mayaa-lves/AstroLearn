/* Primeiro carregamento: acompanha consultas, sem repetir requisições nem escrever dados. */
(() => {
 if(!/\/(aluno|professor)\//.test(location.pathname)||document.getElementById('astroPageLoader'))return;
 const root=document.documentElement,teacher=location.pathname.includes('/professor/');
 const asset=new URL('../../assets/',document.currentScript.src),pending=new Set();
 const layer=document.createElement('section');layer.id='astroPageLoader';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');layer.setAttribute('aria-label','Carregando página');
 const peek=document.createElement('div');peek.className='loading-peek';peek.setAttribute('aria-hidden','true');
 const sprite=document.createElement('div');sprite.className='loading-peek-sprite';peek.append(sprite);
 const pixel=root.dataset.astroTema==='pixel'||root.dataset.visualStyle==='pixel';
 sprite.style.backgroundImage=`url("${new URL('tutorial/professor/'+(pixel?'mascotes-poses-pixel.png':'mascotes-poses.png'),asset).href}")`;
 const center=document.createElement('div');center.className='loading-center';
 const logo=document.createElement('img');logo.src=new URL('imagens/marca/astrolearn-livro-simbolo.svg',asset).href;logo.alt='';logo.width=54;logo.height=54;
 const message=document.createElement('p');message.textContent=teacher?'Preparando sua estação…':'Preparando sua próxima descoberta…';
 const dots=document.createElement('span');dots.className='loading-dots';dots.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)dots.append(document.createElement('i'));
 const more=document.createElement('button');more.type='button';more.textContent='Continuar na página';more.hidden=true;more.onclick=()=>finish();
 center.append(logo,message,dots,more);layer.append(peek,center);document.body.append(layer);
 root.classList.add('astro-page-loading');
 let done=false,loaded=document.readyState==='complete',fontsReady=!document.fonts,quietTimer=0,lastActivity=performance.now(),lastCorner=-1,sawPrimary=false;
 const page=document.body.dataset.page,area=document.body.dataset.studentArea;
 const expectsMain=teacher?(page==='rooms'||!!new URLSearchParams(location.search).get('sala')||document.body.classList.contains('profile-page')):['home','atividade','biblioteca','equipe','perfil','quizzes'].includes(area);
 try{const value=sessionStorage.getItem('astrolearn-loading-corner');if(value!==null)lastCorner=Number(value);}catch{}
 function moveMascot(){
  const choices=[0,1,2,3].filter(c=>c!==lastCorner);lastCorner=choices[Math.floor(Math.random()*choices.length)];peek.dataset.corner=String(lastCorner);
  sprite.style.backgroundPosition=`${lastCorner*100/3}% 0%`;try{sessionStorage.setItem('astrolearn-loading-corner',String(lastCorner));}catch{}
 }
 moveMascot();
 function primary(path){
  if(teacher)return path.startsWith('/api/professor/')||(document.body.dataset.page==='profile'||document.body.classList.contains('profile-page'))&&path==='/api/perfil';
  return path.startsWith('/api/aluno/')||path.startsWith('/api/professor/salas/')||document.body.classList.contains('profile-page')&&path==='/api/perfil';
 }
 function request(event){
  const {phase,id,path,metodo}=event.detail||{};if(done||metodo!=='GET'||typeof path!=='string'||!primary(path))return;
  if(phase==='start'){sawPrimary=true;pending.add(id);lastActivity=performance.now();clearTimeout(quietTimer);}
  if(phase==='end'){pending.delete(id);lastActivity=performance.now();check();}
 }
 function check(){
  clearTimeout(quietTimer);if(done||!loaded||!fontsReady||pending.size||expectsMain&&!sawPrimary)return;
  quietTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!pending.size&&performance.now()-lastActivity>=180)finish();else check();})),220);
 }
 function finish(){
  if(done)return;done=true;clearTimeout(quietTimer);clearTimeout(slowTimer);clearTimeout(limit);clearInterval(corners);window.removeEventListener('astrolearn:request',request);
  root.classList.remove('astro-page-loading','astro-teacher-loading');layer.remove();window.dispatchEvent(new Event('astrolearn:page-ready'));
 }
 window.addEventListener('astrolearn:request',request);
 for(const [id,info]of window.__astroLoadingRequests||[])if(info.metodo==='GET'&&primary(info.path)){sawPrimary=true;pending.add(id);}
 window.addEventListener('load',()=>{loaded=true;check();},{once:true});
 if(document.fonts)Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1800))]).then(()=>{fontsReady=true;check();});
 const corners=setInterval(()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('astro-motion-off'))moveMascot();},4200);
 const slowTimer=setTimeout(()=>{if(done)return;message.textContent='Os dados estão demorando um pouco mais.';more.hidden=false;},8000);
 const limit=setTimeout(finish,15000);
 window.addEventListener('pagehide',finish,{once:true});window.addEventListener('pageshow',e=>{if(e.persisted)finish();});check();
})();
