import {obterSessao} from '../services/autenticacao.js';
import {tutorialSteps,readTutorialState,writeTutorialState} from './professor-tutorial-dados.js?v=2';

const user=obterSessao()?.usuario;
if(location.pathname.includes('/professor/')&&user?.role==='professor')initTutorial(user.id);

function initTutorial(userId){
 if(document.getElementById('astroTeacherTutorial'))return;
 const asset=name=>new URL('../../assets/tutorial/professor/'+name,import.meta.url).href;
 const art=name=>new URL('../../assets/imagens/'+name,import.meta.url).href;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const lessMotion=()=>motion.matches||document.body.classList.contains('astro-motion-off');
 const pixel=()=>document.documentElement.dataset.astroTema==='pixel'||document.documentElement.dataset.visualStyle==='pixel';
 let storage;try{storage=localStorage;}catch{try{storage=sessionStorage;}catch{storage=null;}}
 let saved=readTutorialState(storage,userId);if(!saved){try{saved=readTutorialState(sessionStorage,userId);}catch{}}
 let slide=0,opener=null,video=null,playingBeforeHide=false;
 let pausedByUser=lessMotion(),activeNote=-1,started=false,automaticPending=!saved||saved.status==='in_progress';
 const node=(tag,cls='',text='')=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;return el;};
 const button=(text,cls,action)=>{const b=node('button',cls,text);b.type='button';b.onclick=action;return b;};
 const css=node('link');css.rel='stylesheet';css.href=new URL('../../css/professor-tutorial.css?v=3',import.meta.url).href;
 let cssReady=false;css.onload=()=>{cssReady=true;scheduleAuto();};css.onerror=()=>{cssReady=false;};document.head.append(css);
 const dialog=node('dialog','astro-tutorial');dialog.id='astroTeacherTutorial';dialog.setAttribute('aria-labelledby','astroTutorialTitle');dialog.setAttribute('aria-describedby','astroTutorialDescription');
 const inner=node('div','tut-inner'),header=node('header','tut-heading');
 const eyebrow=node('p','tut-eyebrow','PRIMEIROS PASSOS · PROFESSOR'),title=node('h1','','Vamos começar?');title.id='astroTutorialTitle';title.tabIndex=-1;
 const description=node('p','tut-description');description.id='astroTutorialDescription';
 const close=button('×','tut-close',()=>finish('skipped'));close.setAttribute('aria-label','Fechar tutorial');header.append(eyebrow,title,description,close);
 const content=node('div','tut-content'),footer=node('footer','tut-footer');
 const back=button('← Voltar','tut-button tut-back',()=>go(slide-1));
 const progress=node('div','tut-progress'),next=button('Próximo →','tut-button tut-next',()=>go(slide+1));
 const skip=button('Pular tutorial','tut-skip',()=>finish('skipped'));
 const privacy=node('p','tut-demo-note','Gravações de demonstração. As ações do tutorial não alteram sua turma.');
 footer.append(back,progress,next,skip,privacy);inner.append(header,content,footer);dialog.append(inner);document.body.append(dialog);
 const ns='http://www.w3.org/2000/svg';let stage=null,screen=null,arrows=null,callouts=[],drawFrame=0,mediaStatus=null,playControl=null;
 const remember=status=>{saved={status,slide};if(!writeTutorialState(storage,userId,status,slide)){try{writeTutorialState(sessionStorage,userId,status,slide);}catch{}}};
 const mascotTiles=[1,0,2,3,4,5,6,7];
 const mascotPlaces=['bottom-left','top-left','top-right','bottom-right','bottom-left','top-right','bottom-right'];
 function mascot(kind='quiet'){
  const wrapper=node('div','tut-mascot');wrapper.setAttribute('aria-hidden','true');
  if(slide===0){
   const img=node('img');img.alt='';img.width=320;img.height=320;
   const path=()=>pixel()?'landing-pixel/':'landing-faq/';
   const reset=()=>{img.src=art(path()+(kind==='wave'&&!lessMotion()?'et-lilas-aceno.gif':'et-lilas-parado.png'));};reset();wrapper.append(img);
   wrapper.addEventListener('pointerenter',()=>{if(!lessMotion())img.src=art(path()+'et-lilas-aceno.gif');});wrapper.addEventListener('pointerleave',reset);
  }else{
   const tile=mascotTiles[slide-1]??7,sprite=node('span','tut-mascot-sprite');
   const place=mascotPlaces[slide-1]||'center';wrapper.dataset.mascotPose=String(tile);wrapper.dataset.mascotPlace=place;
   wrapper.classList.add('tut-mascot-'+place);
   sprite.style.backgroundImage=`url("${asset(pixel()?'mascotes-poses-pixel.png':'mascotes-poses.png')}")`;
   sprite.style.backgroundPosition=`${tile%4*100/3}% ${tile<4?0:100}%`;wrapper.append(sprite);
   wrapper.addEventListener('pointerenter',()=>{if(!lessMotion())wrapper.classList.add('tut-mascot-playful');});
   wrapper.addEventListener('pointerleave',()=>wrapper.classList.remove('tut-mascot-playful'));
  }
  return wrapper;
 }
 function clearMedia(){
  if(video){video.pause();video.removeAttribute('src');video.load();video=null;}
  resize.disconnect();stage=screen=arrows=null;callouts=[];activeNote=-1;
  dialog.classList.remove('tut-is-zoomed');
 }
 function finish(status){
  automaticPending=false;
  // Rever e sair do tutorial não desfaz uma conclusão anterior.
  if(saved?.status!=='completed'||status==='completed')remember(status);
  clearMedia();if(dialog.open)dialog.close();document.body.classList.remove('astro-tutorial-open');
 }
 function open(start=0){
  if(!cssReady)return;
  if(dialog.open)return;
  const other=document.querySelector('dialog[open]');
  if(other){if(other.matches('.astro-nav-dialog,.teacher-mobile-dialog'))other.close();else return;}
  opener=document.activeElement;automaticPending=false;started=true;
  document.body.classList.add('astro-tutorial-open');dialog.showModal();go(start);
 }
 function go(index){
  slide=Math.max(0,Math.min(tutorialSteps.length+1,index));
  clearMedia();content.replaceChildren();dialog.dataset.slide=String(slide);
  if(saved?.status!=='completed')remember('in_progress');
  back.hidden=slide===0;skip.hidden=slide===0||slide===tutorialSteps.length+1;next.hidden=false;progress.replaceChildren();
  if(slide===0){
   dialog.dataset.scene='welcome';eyebrow.textContent='BEM-VINDO AO ASTROLEARN';title.textContent='Vamos começar?';
   description.textContent='Conheça o básico para organizar sua turma e acompanhar as próximas descobertas.';
   const welcome=node('div','tut-welcome');welcome.append(mascot('wave'));
   const actions=node('div','tut-welcome-actions');actions.append(button('Começar →','tut-button tut-start',()=>go(1)),button('pular','tut-skip',()=>finish('skipped')),node('p','tut-replay-note','Para rever, use o ícone de Ajuda no menu.'));welcome.append(actions);content.append(welcome);next.hidden=true;
  }else if(slide===tutorialSteps.length+1){
   dialog.dataset.scene='end';eyebrow.textContent='TUDO PRONTO';title.textContent='Sua turma pode começar a explorar';description.textContent='Você já conhece os primeiros passos. Use o ícone de Ajuda no menu para rever as demonstrações.';
   const end=node('div','tut-welcome');end.append(mascot('wave'),button('Começar a usar →','tut-button tut-start',()=>finish('completed')));content.append(end);next.hidden=true;
  }else{
   dialog.dataset.scene='lesson';const lesson=tutorialSteps[slide-1];eyebrow.textContent=lesson.eyebrow;title.textContent=lesson.title;description.textContent=lesson.description;
   buildLesson(lesson);next.textContent=slide===tutorialSteps.length?'Concluir →':'Próximo →';
   const dots=node('div','tut-dots');dots.setAttribute('role','group');dots.setAttribute('aria-label','Etapas do tutorial');
   tutorialSteps.forEach((item,index)=>{const dot=button('','tut-dot',()=>go(index+1));dot.setAttribute('aria-label',`Etapa ${index+1}: ${item.title}`);if(index+1===slide)dot.setAttribute('aria-current','step');dots.append(dot);});progress.append(dots,node('span','tut-count',`${slide} de ${tutorialSteps.length}`));
  }
  dialog.scrollTop=0;requestAnimationFrame(()=>{title.focus({preventScroll:true});scheduleDraw();});
 }
 function buildLesson(lesson){
  stage=node('section','tut-stage');stage.setAttribute('aria-label','Demonstração e explicações');
  if(mascotPlaces[slide-1]==='bottom-right')stage.classList.add('tut-layout-flipped');
  const left=node('div','tut-notes tut-notes-left'),right=node('div','tut-notes tut-notes-right');
  const figure=node('figure','tut-figure');screen=node('div','tut-screen');
  const poster=node('img','tut-poster');poster.src=asset(lesson.image||lesson.poster);poster.alt=lesson.image?'Print da lista de correções da sala.':'Quadro da demonstração: '+lesson.title;poster.width=1120;poster.height=632;screen.append(poster);
  const mediaControls=node('figcaption','tut-media-controls');mediaStatus=node('span','tut-media-status');mediaStatus.setAttribute('role','status');mediaStatus.textContent=lesson.video?'Preparando demonstração…':'Print do sistema';
  if(lesson.video){
   video=node('video','tut-video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;video.preload='metadata';video.poster=asset(lesson.poster);video.setAttribute('aria-label','Vídeo de demonstração: '+lesson.title);video.setAttribute('disablepictureinpicture','');screen.append(video);
   const current=video;
   playControl=button('Reproduzir','tut-media-button',()=>{pausedByUser=!current.paused;if(pausedByUser)current.pause();else playVideo(current);});playControl.setAttribute('aria-label','Reproduzir demonstração');
   const restart=button('↻ Rever','tut-media-button',()=>{current.currentTime=0;if(!pausedByUser)playVideo(current);});restart.setAttribute('aria-label','Rever demonstração desde o início');
   const sync=()=>{if(video!==current)return;playControl.textContent=current.paused?'▶ Reproduzir':'Ⅱ Pausar';playControl.setAttribute('aria-label',current.paused?'Reproduzir demonstração':'Pausar demonstração');};
   current.addEventListener('play',()=>{if(video!==current)return;sync();mediaStatus.textContent='Demonstração em repetição';});current.addEventListener('pause',()=>{if(video!==current)return;sync();mediaStatus.textContent='Demonstração pausada';});
   current.addEventListener('timeupdate',()=>{if(video===current)setActive(lesson,current.currentTime);});
   current.addEventListener('loadeddata',()=>{if(video!==current)return;mediaStatus.textContent=pausedByUser?'Demonstração pausada':'Demonstração em repetição';if(!pausedByUser&&dialog.open&&!document.hidden)playVideo(current);});
   current.addEventListener('error',()=>{if(video!==current)return;current.hidden=true;playControl.disabled=restart.disabled=true;mediaStatus.textContent='Vídeo indisponível. Você pode seguir pelo print e pelas explicações.';activeNote=-1;callouts.forEach(b=>b.classList.remove('is-current'));scheduleDraw();});
   mediaControls.append(playControl,restart);current.src=asset(lesson.video);
  }
  const zoom=button('⛶ Ampliar','tut-media-button',()=>{const enlarged=dialog.classList.toggle('tut-is-zoomed');zoom.textContent=enlarged?'⛶ Reduzir':'⛶ Ampliar';zoom.setAttribute('aria-expanded',String(enlarged));scheduleDraw();});zoom.setAttribute('aria-label','Ampliar demonstração');zoom.setAttribute('aria-expanded','false');mediaControls.append(zoom,mediaStatus);figure.append(screen,mediaControls);
  if(lesson.hint)figure.append(node('p','tut-media-hint',lesson.hint));
  lesson.notes.forEach((note,index)=>{
   const callout=button('','tut-callout',()=>{if(video&&!video.error){video.currentTime=note.at||0;if(!pausedByUser)playVideo(video);}activeNote=index;callouts.forEach((b,i)=>b.classList.toggle('is-current',i===index));scheduleDraw();});
   callout.dataset.note=String(index);callout.setAttribute('aria-label',`${index+1}. ${note.title}. ${note.text}${lesson.video?' Mostrar este trecho.':''}`);
   callout.append(node('span','tut-number',String(index+1)));const copy=node('span','tut-note-copy');copy.append(node('strong','',note.title),node('span','',note.text));callout.append(copy);callouts.push(callout);(index===0?left:right).append(callout);
  });
  arrows=document.createElementNS(ns,'svg');arrows.classList.add('tut-arrows');arrows.setAttribute('aria-hidden','true');
  stage.append(left,figure,right,mascot(),arrows);content.append(stage);resize.observe(stage);resize.observe(screen);setActive(lesson,0);scheduleDraw();
 }
 async function playVideo(current){
  try{await current.play();}catch{if(video===current){mediaStatus.textContent='Clique em Reproduzir para ver a demonstração.';playControl.textContent='▶ Reproduzir';}}
 }
 function setActive(lesson,time){
  if(!lesson.video){activeNote=-1;return;}
  let found=0;lesson.notes.forEach((note,index)=>{if(time>=(note.at||0))found=index;});
  if(found!==activeNote){activeNote=found;callouts.forEach((b,i)=>b.classList.toggle('is-current',i===found));}
  scheduleDraw();
 }
 function scheduleDraw(){if(!drawFrame)drawFrame=requestAnimationFrame(()=>{drawFrame=0;drawArrows();});}
 function drawArrows(){
  if(!stage||!screen||!arrows||!dialog.open)return;
  const lesson=tutorialSteps[slide-1];if(!lesson)return;
  const s=stage.getBoundingClientRect(),m=screen.getBoundingClientRect();if(!s.width||!m.width)return;
  arrows.setAttribute('viewBox',`0 0 ${s.width} ${s.height}`);arrows.replaceChildren();
  const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
  const defs=make('defs',{}),marker=make('marker',{id:'astroTutArrow',viewBox:'0 0 12 12',refX:10,refY:6,markerWidth:8,markerHeight:8,orient:'auto-start-reverse'});marker.append(make('path',{d:'M2 2L10 6L2 10',fill:'none',stroke:'currentColor','stroke-width':1.8,'stroke-linejoin':'round'}));defs.append(marker);arrows.append(defs);
  lesson.notes.forEach((note,i)=>{
   if(lesson.video&&activeNote!==i)return;
   let point=note.point;for(const change of note.points||[])if((video?.currentTime||0)>=change.at)point=change.point;
   const b=callouts[i].getBoundingClientRect(),x=m.left-s.left+point[0]*m.width,y=m.top-s.top+point[1]*m.height;
   const compact=matchMedia('(max-width: 1050px)').matches;
   if(!compact&&!dialog.classList.contains('tut-is-zoomed')){
    const left=b.left+b.width/2<m.left+m.width/2,startX=(left?b.right:b.left)-s.left,startY=b.top-s.top+Math.min(b.height*.6,70),bend=left?42:-42;
    arrows.append(make('path',{d:`M${startX},${startY} C${startX+bend},${startY+50} ${x-bend},${y-20} ${x},${y}`,class:'tut-curve','marker-end':'url(#astroTutArrow)'}));
   }
   arrows.append(make('circle',{cx:x,cy:y,r:13,class:'tut-target'}));const label=make('text',{x,y:y+4,'text-anchor':'middle',class:'tut-target-number'});label.textContent=String(i+1);arrows.append(label);
  });
 }
 const resize=new ResizeObserver(scheduleDraw);
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(dialog.classList.contains('tut-is-zoomed')){dialog.classList.remove('tut-is-zoomed');const zoom=dialog.querySelector('[aria-label="Ampliar demonstração"]');zoom.textContent='⛶ Ampliar';zoom.setAttribute('aria-expanded','false');scheduleDraw();}else finish('skipped');});
 dialog.addEventListener('close',()=>{clearMedia();document.body.classList.remove('astro-tutorial-open');if(opener?.isConnected)opener.focus({preventScroll:true});});
 dialog.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,video')||event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight'&&slide>0&&slide<=tutorialSteps.length){event.preventDefault();go(slide+1);}if(event.key==='ArrowLeft'&&slide>0){event.preventDefault();go(slide-1);}});
 document.addEventListener('click',event=>{const help=event.target.closest('#help,[data-astro-tutorial-help]');if(!help)return;if(!cssReady)return;event.preventDefault();event.stopImmediatePropagation();open(0);},true);
 window.addEventListener('astrolearn:open-teacher-tutorial',()=>open(0));
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&video){playingBeforeHide=!video.paused;video.pause();}else{if(video&&dialog.open&&playingBeforeHide&&!pausedByUser)playVideo(video);playingBeforeHide=false;scheduleAuto();}});
 const adaptMotion=()=>{if(lessMotion()){pausedByUser=true;video?.pause();}dialog.querySelectorAll('.tut-mascot img').forEach(img=>{if(lessMotion())img.src=art((pixel()?'landing-pixel/':'landing-faq/')+'et-lilas-parado.png');});dialog.querySelectorAll('.tut-mascot-sprite').forEach(sprite=>sprite.style.backgroundImage=`url("${asset(pixel()?'mascotes-poses-pixel.png':'mascotes-poses.png')}")`);};
 motion.addEventListener('change',adaptMotion);document.addEventListener('astrolearn:preferences',adaptMotion);
 function scheduleAuto(){
  const help=document.getElementById('help');if(help){
   help.dataset.astroTutorialHelp='true';help.setAttribute('aria-haspopup','dialog');help.setAttribute('aria-controls',dialog.id);
   if(help.dataset.astroLabel!=='Ajuda'){
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(ns,'path');path.setAttribute('d','M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 4m0 3h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20');svg.append(path);
    help.replaceChildren(svg,node('span','label','Ajuda'));help.dataset.astroLabel='Ajuda';
   }
   if(help.getAttribute('aria-label')!=='Ajuda')help.setAttribute('aria-label','Ajuda');
  }
  if(!automaticPending||started||document.body.dataset.page!=='rooms'||!cssReady||document.hidden||document.readyState==='loading')return;
  if(document.documentElement.classList.contains('astro-teacher-loading')||document.documentElement.classList.contains('astro-page-loading')||document.getElementById('content')?.getAttribute('aria-busy')==='true'||document.querySelector('dialog[open]'))return;
  open(saved?.status==='in_progress'?saved.slide:0);
 }
 const observer=new MutationObserver(scheduleAuto);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-busy','open']});
 window.addEventListener('load',scheduleAuto,{once:true});window.addEventListener('pageshow',scheduleAuto);window.addEventListener('resize',scheduleDraw);document.addEventListener('DOMContentLoaded',scheduleAuto,{once:true});
 window.addEventListener('pagehide',()=>{video?.pause();observer.disconnect();resize.disconnect();});scheduleAuto();
}
