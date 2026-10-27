/* Local animated mascot; freeze when hidden or reduced motion is requested. */
(() => {
 'use strict';
 const button=document.getElementById('faqMascot');if(!button)return;
 const image=button.querySelector('img');
 const still=()=>document.documentElement.dataset.visualStyle==='pixel'?'public/assets/imagens/landing-pixel/et-lilas-parado.png':'public/assets/imagens/landing-faq/et-lilas-parado.png';
 const animated=()=>document.documentElement.dataset.visualStyle==='pixel'?'public/assets/imagens/landing-pixel/et-lilas-aceno.gif':'public/assets/imagens/landing-faq/et-lilas-aceno.gif';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,disposed=false,replay=0;
 const off=()=>reduced.matches||document.body.classList.contains('motion-off');
 function sync(){
  if(disposed)return;
  const run=visible&&!document.hidden&&!off();button.setAttribute('aria-label',run?'Repetir aceno do mascote lilás':'Mascote lilás do AstroLearn');
  const src=run?animated():still();if(image.getAttribute('src')!==src)image.src=src;
 }
 button.addEventListener('click',()=>{
  if(off()||document.hidden)return;
  image.src=animated()+'?aceno='+(++replay);
 });
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(button);
 image.addEventListener('error',()=>{if(image.getAttribute('src')!==still())image.src=still();});
 reduced.addEventListener('change',sync);document.addEventListener('landing:style',sync);document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pageshow',sync);window.addEventListener('pagehide',event=>{image.src=still();if(!event.persisted){disposed=true;observer.disconnect();}});
})();
