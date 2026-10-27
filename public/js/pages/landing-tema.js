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
  refreshSteam();
 }
 button.addEventListener('click',()=>apply(pixel()?'realista':'pixel'));
 window.addEventListener('storage',event=>{if(event.key==='astrolearn-landing-style')apply(event.newValue==='pixel'?'pixel':'realista',false);});
 // Native SVG experiments are rasterized only in the art layer. Hit targets remain live.
 const visual=document.getElementById('steamVisual'),panel=document.getElementById('steamLab');
 let canvas,ctx,raf=0,busy=false,visible=false,disposed=false,last=0,epoch=0;
 function clear(){epoch++;cancelAnimationFrame(raf);raf=0;canvas?.remove();canvas=null;ctx=null;visual.removeAttribute('data-pixel-rendered');}
 function refreshSteam(){
  if(!pixel()||panel.hidden){clear();return;}
  if(!canvas){canvas=document.createElement('canvas');canvas.className='steam-pixel-render';canvas.setAttribute('aria-hidden','true');visual.append(canvas);ctx=canvas.getContext('2d');}
  if(!ctx){clear();return;}schedule();
 }
 function schedule(){if(!raf&&!disposed&&pixel()&&!panel.hidden&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
 function quantize(){const data=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<data.data.length;i+=4){if(!data.data[i+3])continue;for(let c=0;c<3;c++)data.data[i+c]=Math.round(data.data[i+c]/24)*24;}ctx.putImageData(data,0,0);}
 function renderOrb(orb,rect){
  const b=orb.getBoundingClientRect(),x=(b.left-rect.left)/4,y=(b.top-rect.top)/4,r=b.width/8;
  const color=getComputedStyle(orb).getPropertyValue('--paint-color').trim()||'#8253df';
  const gradient=ctx.createRadialGradient(x+r*.6,y+r*.5,0,x+r,y+r,r);gradient.addColorStop(0,'#f5eeff');gradient.addColorStop(.35,color);gradient.addColorStop(1,'#35204f');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x+r,y+r,r,0,Math.PI*2);ctx.fill();quantize();visual.dataset.pixelRendered='true';
 }
 async function renderSvg(svg,rect){
  const generation=epoch,clone=svg.cloneNode(true),originals=[svg,...svg.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
  const properties=['fill','fill-opacity','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','opacity','transform','transform-origin','filter','font-size','font-family','text-anchor'];
  originals.forEach((node,i)=>{const computed=getComputedStyle(node);properties.forEach(key=>{let value=computed.getPropertyValue(key);if(key==='fill'||key==='stroke')value=value.replace(/url\(["']?[^)]*#([^"')]+)["']?\)/g,'url(#$1)');if(key==='opacity'&&i===0)value='1';copies[i].style.setProperty(key,value);});});
  clone.style.opacity='1';clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const b=svg.getBoundingClientRect();clone.setAttribute('width',String(b.width));clone.setAttribute('height',String(b.height));
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}));
  try{const image=new Image();image.src=url;await image.decode();if(generation!==epoch||!ctx||!pixel())return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,(b.left-rect.left)/4,(b.top-rect.top)/4,b.width/4,b.height/4);quantize();visual.dataset.pixelRendered='true';}catch{visual.removeAttribute('data-pixel-rendered');}finally{URL.revokeObjectURL(url);}
 }
 async function tick(now){
  raf=0;if(disposed||!pixel()||panel.hidden||!visible||document.hidden)return;
  if(!busy&&now-last>100){busy=true;last=now;try{
   if(!canvas?.isConnected){canvas=null;ctx=null;refreshSteam();return;}
   const rect=visual.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width/4)),height=Math.max(1,Math.round(rect.height/4));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}ctx.imageSmoothingEnabled=false;
   const svg=visual.querySelector('svg'),orb=visual.querySelector('.lab-paint-orb');
   if(svg)await renderSvg(svg,rect);else if(orb)renderOrb(orb,rect);
  }finally{busy=false;}}schedule();
 }
 const observer=new MutationObserver(()=>{if(pixel()&&!panel.hidden)refreshSteam();else clear();});observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 const children=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>node!==canvas&&!node.classList?.contains('steam-pixel-render'))))refreshSteam();});children.observe(visual,{childList:true});
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)refreshSteam();else{cancelAnimationFrame(raf);raf=0;}});visibility.observe(visual);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else refreshSteam();});
 window.addEventListener('pagehide',event=>{cancelAnimationFrame(raf);if(!event.persisted){disposed=true;observer.disconnect();children.disconnect();visibility.disconnect();}});
 apply(mode,false);
})();
