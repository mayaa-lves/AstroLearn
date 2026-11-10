(()=>{
 const root=document.documentElement,key='astrolearn-landing-style';
 function read(){try{return localStorage.getItem(key)==='realista'?'realista':'pixel'}catch{return 'pixel'}}
 root.dataset.visualStyle=read();
 document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.getElementById('authStyleToggle'),label=btn.querySelector('[data-style-label]');
  function apply(style){root.dataset.visualStyle=style;const px=style==='pixel';label.textContent=px?'Realista':'Pixel art';btn.setAttribute('aria-pressed',String(px));btn.setAttribute('aria-label',px?'Ativar estilo realista':'Ativar estilo pixel art');btn.removeAttribute('title')}
  apply(read());btn.onclick=()=>{const next=root.dataset.visualStyle==='pixel'?'realista':'pixel';apply(next);try{localStorage.setItem(key,next)}catch{}};
  window.addEventListener('storage',e=>{if(e.key===key)apply(read())})
 })
})();
