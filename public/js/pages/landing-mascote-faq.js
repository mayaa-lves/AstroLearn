/* Wave the hand using a local sprite; never reposition facial features. */
(() => {
 'use strict';
 const button=document.getElementById('faqMascot');if(!button)return;
 const image=button.querySelector('img');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const pixel=()=>document.documentElement.dataset.visualStyle==='pixel';
 const off=()=>reduced.matches||document.body.classList.contains('motion-off');
 const still=()=>pixel()?'public/assets/imagens/landing-pixel/et-lilas-rosto-corrigido.png':'public/assets/imagens/landing-faq/et-lilas-parado.png';
 const sheet=new Image();sheet.src='public/assets/imagens/landing-pixel/et-lilas-tchau-sprites.png';
 const canvas=document.createElement('canvas');canvas.width=canvas.height=600;canvas.setAttribute('aria-hidden','true');
 Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none',imageRendering:'pixelated'});
 button.style.position='relative';const ctx=canvas.getContext('2d');
 let visible=false,disposed=false,timer=0,frame=0,start=0,nextWave=0;
 function showStill(){canvas.remove();image.style.opacity='';const src=still();if(image.getAttribute('src')!==src)image.src=src;}
 function stop(){cancelAnimationFrame(frame);frame=0;clearTimeout(timer);timer=0;showStill();}
 function running(){return visible&&!document.hidden&&!off()&&!disposed;}
 function schedule(){clearTimeout(timer);if(running())timer=setTimeout(wave,6500);}
 function draw(time){
  if(!running()||!pixel()){stop();return;}
  const elapsed=time-start;if(elapsed>=1260){frame=0;showStill();schedule();return;}
  const cell=Math.floor(elapsed/210)%2;ctx.clearRect(0,0,600,600);ctx.imageSmoothingEnabled=false;
  // The two top-row poses share the same 600 px alignment and fixed face.
  ctx.drawImage(sheet,cell*600,0,600,600,0,0,600,600);
  frame=requestAnimationFrame(draw);
 }
 function wave(){
  if(!running())return;clearTimeout(timer);cancelAnimationFrame(frame);
  button.setAttribute('aria-label','Repetir tchauzinho do mascote lilás');
  if(pixel()){
   if(!ctx||!sheet.naturalWidth){showStill();return;}
   if(!canvas.isConnected)button.append(canvas);image.style.opacity='0';start=performance.now();frame=requestAnimationFrame(draw);
  }else{
   image.style.opacity='';canvas.remove();image.src='public/assets/imagens/landing-faq/et-lilas-aceno.gif?replay='+(++nextWave);
  }
 }
 function sync(){stop();button.setAttribute('aria-label','Repetir tchauzinho do mascote lilás');if(running())wave();}
 button.addEventListener('click',wave);
 button.addEventListener('pointerenter',()=>{if(!frame)wave();});
 button.addEventListener('focus',()=>{if(!frame)wave();});
 sheet.addEventListener('load',()=>{if(running()&&pixel())wave();});
 sheet.addEventListener('error',showStill);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(button);
 image.addEventListener('error',()=>{if(image.getAttribute('src')!==still())image.src=still();});
 reduced.addEventListener('change',sync);document.addEventListener('landing:style',sync);document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pageshow',sync);window.addEventListener('pagehide',event=>{stop();if(!event.persisted){disposed=true;observer.disconnect();}});
})();
