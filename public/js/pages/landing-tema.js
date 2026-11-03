/* Landing-only visual theme; all text, data and native controls stay untouched. */
(() => {
 'use strict';
 const html=document.documentElement,button=document.getElementById('visualStyleToggle');if(!button)return;
 const hero=document.getElementById('heroIllustration');
 let mode=html.dataset.visualStyle==='pixel'?'pixel':'realista';
 const pixel=()=>mode==='pixel';
 function apply(next,save=true){
  mode=next;html.dataset.visualStyle=mode;
  if(save)try{localStorage.setItem('astrolearn-landing-style',mode);}catch{}
  button.setAttribute('aria-pressed',String(pixel()));button.setAttribute('aria-label',pixel()?'Ativar estilo realista':'Ativar estilo pixel art');
  document.getElementById('visualStyleLabel').textContent=pixel()?'Realista':'Pixel art';
  hero.src=pixel()?'public/assets/imagens/landing-pixel/hero.webp':'public/assets/imagens/landing-v2/hero.webp';
  document.dispatchEvent(new Event('landing:style'));document.dispatchEvent(new Event('landing:layout'));
 }
 button.addEventListener('click',()=>apply(pixel()?'realista':'pixel'));
 window.addEventListener('storage',event=>{if(event.key==='astrolearn-landing-style')apply(event.newValue==='pixel'?'pixel':'realista',false);});
 apply(mode,false);
})();
