// O recorte inclui o contorno original: ao piscar, a abertura toda se estreita.
const c=document.querySelector('.pixel-eye-frame'), et=c.closest('.mascot'), g=c.getContext('2d');
const sprite=new Image();sprite.src=new URL('../../../assets/imagens/login/pixel/alien.webp',import.meta.url);
await sprite.decode();
const W=c.width,H=c.height,src=document.createElement('canvas');src.width=W;src.height=H;
const sg=src.getContext('2d');sg.drawImage(sprite,724*.32,724*.31,724*.30,724*.28,0,0,W,H);
const orig=sg.getImageData(0,0,W,H),dst=g.createImageData(W,H);
let lookX=0,lookY=0;
function paint(open){
 dst.data.set(orig.data);
 for(let x=0;x<W;x++){
  const u=(x-27.4)/23.4;if(Math.abs(u)>=1)continue;
  const h=20.8*Math.sqrt(1-u*u),mid=25.3,lo=Math.max(0,Math.floor(mid-h)),hi=Math.min(H-1,Math.ceil(mid+h)),fold=mid+3*(1-u*u), line=fold+(mid-fold)*open;
  for(let y=lo;y<=hi;y++){
   const idx=(y*W+x)*4;let rgb;
   if(Math.abs(y-line)<=Math.max(.8,h*open)){
    if(open<.07)rgb=[67,37,90];
    else{const yy=Math.max(lo,Math.min(hi,Math.round(mid+(y-line)/open))),j=(yy*W+x)*4;rgb=orig.data.subarray(j,j+3);
     const a=x-27-lookX,b=yy-25-lookY,d=Math.hypot(a/13,b/15);
     if(d<1)rgb=d>.88?[65,38,88]:d>.68?[105,66,140]:[36,22,54];
     if((a+4)**2+(b+6)**2<8)rgb=[255,246,224];else if((a-5)**2+(b-7)**2<2.2)rgb=[163,118,191];
    }
   }else{
    // Warm lavender from the cheek at this same height; dark crease at the lash line.
    const jl=(y*W+2)*4,jr=(y*W+51)*4,f=Math.round((x/53)*9)/9;rgb=[0,1,2].map(k=>orig.data[jl+k]*(1-f)+orig.data[jr+k]*f);
   }
   for(let k=0;k<3;k++)dst.data[idx+k]=rgb[k];
  }
 }
 g.putImageData(dst,0,0)
}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');let id,last=0,t=0,delay=0;
function visible(){return !document.hidden&&document.documentElement.dataset.visualStyle==='pixel'&&!document.body.classList.contains('motion-paused')&&!reduce.matches}
function frame(now){if(!visible())return;const dt=last?Math.min(100,now-last):0;last=now;t=(t+dt)%5900;const phase=t-5580;
 const openness=phase<0?1:phase<110?1-phase/110:phase<175?0:Math.min(1,(phase-175)/140);
 if(phase>=0||delay){paint(Math.round(openness*6)/6);delay=0}id=requestAnimationFrame(frame)}
function sync(){cancelAnimationFrame(id);last=0;t=0;paint(1);if(visible())id=requestAnimationFrame(frame)}
window.addEventListener('pointermove',()=>{if(!visible())return;lookX=Math.max(-4,Math.min(4,parseFloat(et.style.getPropertyValue('--eye-x'))||0));lookY=Math.max(-3,Math.min(3,parseFloat(et.style.getPropertyValue('--eye-y'))||0));delay=1},{passive:true});
new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-visual-style']});new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
