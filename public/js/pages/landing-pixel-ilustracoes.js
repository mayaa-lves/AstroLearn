/* Approved PNG illustrations, scoped to the pixel theme. Native controls stay live. */
(() => {
 'use strict';
 const visual=document.getElementById('steamVisual'),panel=document.getElementById('steamLab');
 if(!visual||!panel)return;
 const canvas=document.createElement('canvas');canvas.className='steam-pixel-render';canvas.width=640;canvas.height=400;canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const files={science:'ciencia-microscopio',technology:'tecnologia-circuito',engineering:'engenharia-ponte',arts:'artes-esfera-pincel',math:'matematica-geometria'};
 const images={};let frame=0,visible=false,last=0,disposed=false;
 const pixel=()=>document.documentElement.dataset.visualStyle==='pixel';
 const noMotion=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('motion-off');
 for(const [key,name] of Object.entries(files)){const img=new Image();img.onload=sync;img.onerror=()=>{if(kind()===key){canvas.remove();visual.removeAttribute('data-pixel-rendered');}};img.src='public/assets/imagens/landing-pixel-v2/'+name+'.png';images[key]=img;}
 function kind(){return document.getElementById('labFocus')?'science':document.getElementById('labSwitch')?'technology':document.getElementById('labBuild')?'engineering':document.getElementById('labMix')?'arts':'math';}
 function draw(){
  const key=kind(),img=images[key];canvas.style.pointerEvents=key==='technology'?'auto':'none';canvas.style.touchAction=key==='technology'?'none':'auto';if(!img?.naturalWidth)return;
  ctx.clearRect(0,0,640,400);ctx.imageSmoothingEnabled=false;ctx.save();
  const size=380,x=130,y=10;
  if(key==='science'){
   ctx.drawImage(img,x,y,size,size);
   const value=Number(document.getElementById('labFocus').value),blur=Math.abs(value-67)/22;
   // Rotate the actual focus wheel around its own center.
   const wx=x+size*.21,wy=y+size*.708,wr=size*.102;
   ctx.save();ctx.beginPath();ctx.arc(wx,wy,wr,0,Math.PI*2);ctx.clip();ctx.translate(wx,wy);ctx.rotate(value*Math.PI/65);ctx.drawImage(img,x-wx,y-wy,size,size);ctx.restore();
   const cx=x+size*.802,cy=y+size*.325,r=size*.15;
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#fff1d5';ctx.fill();
   ctx.filter='blur('+blur+'px)';
   const zoom=visual.style.getPropertyValue('--sample-zoom')==='1.65'?1.65:1;
   const sw=img.width*.30/zoom,sh=img.height*.30/zoom;
   ctx.drawImage(img,img.width*.802-sw/2,img.height*.325-sh/2,sw,sh,cx-r,cy-r,2*r,2*r);ctx.restore();
  }else if(key==='technology'){
   const on=visual.classList.contains('circuit-on');
   ctx.save();ctx.beginPath();ctx.rect(0,0,640,400);ctx.rect(x+size*.38,y+size*.43,size*.25,size*.12);ctx.clip('evenodd');
   if(!on)ctx.filter='saturate(.6) brightness(.8)';ctx.drawImage(img,x,y,size,size);ctx.restore();
   const value=Number(document.getElementById('labSwitchHandle')?.getAttribute('aria-valuenow')||0),a=(-28+value*.28)*Math.PI/180;
   const px=x+size*.43,py=y+size*.54,len=size*.17;
   ctx.lineCap='square';ctx.strokeStyle='#503367';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a)*len,py+Math.sin(a)*len);ctx.stroke();
   ctx.strokeStyle='#a4ddc5';ctx.lineWidth=6;ctx.stroke();
  }else if(key==='engineering'){
   // A single flat deck keeps the rover supported before and after construction.
   // Render the bridge on a real pixel grid, with independent structural bays.
   const layer=document.createElement('canvas');layer.width=640;layer.height=400;
   const g=layer.getContext('2d');g.imageSmoothingEnabled=false;g.scale(4,4);
   const poly=(pts,color)=>{g.fillStyle=color;g.beginPath();pts.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py));g.closePath();g.fill();};
   const island=(left)=>{
    poly([[left,59],[left+34,59],[left+33,78],[left+24,88],[left+9,84],[left+2,75]],'#50345f');
    poly([[left+3,63],[left+30,63],[left+28,77],[left+20,84],[left+7,79]],'#9b83af');
    poly([[left+4,64],[left+15,62],[left+16,73],[left+9,77]],'#c3afd0');
    poly([[left+21,68],[left+29,66],[left+27,76],[left+20,79]],'#75628d');
    poly([[left-1,58],[left+5,55],[left+29,55],[left+35,58],[left+32,63],[left+3,63]],'#7b9365');
    g.fillStyle='#b4ca8a';g.fillRect(left+5,57,24,3);
    g.fillStyle='#f8e8c5';g.fillRect(left+2,54,31,3);
   };
   island(12);island(115);
   const line=(ax,ay,bx,by,color,width)=>{g.strokeStyle=color;g.lineWidth=width;g.lineCap='square';g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();};
   visual.querySelectorAll('.bridge-piece').forEach((piece,i)=>{
    const st=getComputedStyle(piece),opacity=Number(st.opacity);if(opacity<=0)return;
    const matrix=st.transform.match(/matrix\(([^)]+)\)/)?.[1].split(',');
    const xx=43+i*24,dy=Math.round(Number(matrix?.[5]||0)/4);
    g.save();g.globalAlpha=opacity;g.translate(0,dy);
    line(xx,57,xx+24,57,'#4c305f',5);line(xx,73,xx+24,73,'#4c305f',4);
    line(xx,58,xx+12,72,'#4c305f',4);line(xx+12,72,xx+24,58,'#4c305f',4);
    line(xx,58,xx+12,72,'#ad76ca',2);line(xx+12,72,xx+24,58,'#ad76ca',2);
    g.fillStyle='#f8e8c5';g.fillRect(xx,54,24,3);g.fillStyle='#b17cd0';g.fillRect(xx,58,24,2);
    g.fillStyle='#d7b7e8';g.fillRect(xx+10,71,5,4);g.restore();
   });
   const rover=visual.querySelector('.bridge-rover'),st=rover?getComputedStyle(rover):null;
   const matrix=st?.transform.match(/matrix\(([^)]+)\)/)?.[1].split(',');
   const progress=Math.max(0,Math.min(1,Number(matrix?.[4]||0)/290));
   // Tight rover crop excludes the old bridge and aligns its wheels with the deck.
   g.drawImage(img,img.width*.405,img.height*.256,img.width*.245,img.height*.184,Math.round(20+progress*101),33,28,21);
   ctx.drawImage(layer,0,0,640,400);
  }else if(key==='arts'){
   const mix=Number(document.getElementById('labMix')?.value||0);ctx.filter='hue-rotate('+Math.round(-mix*1.2)+'deg)';ctx.drawImage(img,x,y,size,size);ctx.filter='none';
  }else{
   // The controlled shape is the main illustration, not a stationary decorative solid.
   const n=Number(document.getElementById('labSides')?.value||3),cx=320,cy=175,r=125;
   const points=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];});
   const shape=(dy,color)=>{ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(px,py+dy):ctx.moveTo(px,py+dy));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
   shape(15,'#503367');shape(0,'#87cabb');ctx.strokeStyle='#fff1d5';ctx.lineWidth=4;ctx.stroke();
   points.forEach(([px,py])=>{ctx.fillStyle='#503367';ctx.fillRect(Math.round(px)-6,Math.round(py)-6,12,12);ctx.fillStyle='#efa640';ctx.fillRect(Math.round(px)-3,Math.round(py)-3,6,6);});
  }
  ctx.restore();
 }
 let dragging=false;
 function switchPointer(event){
  const b=canvas.getBoundingClientRect(),scale=Math.min(b.width/640,b.height/400);
  const px=(event.clientX-b.left-(b.width-640*scale)/2)/scale,py=(event.clientY-b.top-(b.height-400*scale)/2)/scale;
  const angle=Math.atan2(py-(10+380*.54),px-(130+380*.43))*180/Math.PI;
  const steps=Math.max(0,Math.min(4,Math.round((angle+28)/7)));
  const handle=document.getElementById('labSwitchHandle');if(!handle)return;
  handle.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));
  for(let i=0;i<steps;i++)handle.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));draw();
 }
 canvas.addEventListener('pointerdown',event=>{if(kind()!=='technology')return;event.preventDefault();dragging=true;canvas.setPointerCapture(event.pointerId);switchPointer(event);});
 canvas.addEventListener('pointermove',event=>{if(dragging)switchPointer(event);});
 canvas.addEventListener('pointerup',event=>{if(dragging){switchPointer(event);dragging=false;}});
 canvas.addEventListener('pointercancel',()=>{dragging=false;});
 function tick(time){frame=0;if(disposed||!pixel()||panel.hidden||!visible||document.hidden)return;if(time-last>80){draw();last=time;}frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;if(disposed)return;const img=images[kind()];if(pixel()&&!panel.hidden&&img?.naturalWidth){if(!canvas.isConnected)visual.append(canvas);visual.dataset.pixelRendered='true';draw();if(visible&&!document.hidden)frame=requestAnimationFrame(tick);}else{canvas.remove();visual.removeAttribute('data-pixel-rendered');}}
 const observer=new MutationObserver(sync);observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 const children=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n!==canvas)))sync();});children.observe(visual,{childList:true});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(visual);
 document.addEventListener('landing:style',sync);document.addEventListener('landing:motion',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);if(!e.persisted){disposed=true;observer.disconnect();children.disconnect();}});sync();
})();
