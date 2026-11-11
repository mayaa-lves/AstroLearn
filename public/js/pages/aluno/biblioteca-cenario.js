/* Partículas decorativas limitadas; nenhuma interação interfere nos controles. */
(()=>{
 const pixel = document.documentElement.dataset.astroTema === 'pixel';
 const canvas=document.getElementById('libraryDust');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const scene=document.querySelector('.library-scene'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let width=innerWidth,height=innerHeight,raf=0,last=0;const cursor={x:-999,y:-999};
 const points=[];const MAX=88;
 const off=()=>media.matches||document.body.classList.contains('astro-motion-off');
 function add(x=Math.random()*width,y=Math.random()*height,born=false,hover=false){if(points.length>=MAX)points.shift();points.push({x,y,vx:0,vy:0,r:born?1.8:.65+Math.random()*1.1,speed:6+Math.random()*7,age:0,born,life:hover?1.3:12,pin:hover?.08:born?1:0});}
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);points.length=0;for(let i=0;i<(width<600?22:46);i++)add();draw(0);}
 function draw(dt){ctx.clearRect(0,0,width,height);for(let i=points.length-1;i>=0;i--){const p=points[i];p.age+=dt;if(p.born&&p.age>p.life){points.splice(i,1);continue;}if(dt){if(p.pin>0)p.pin-=dt;else{const dx=p.x-cursor.x,dy=p.y-cursor.y,d=Math.hypot(dx,dy);if(d<145&&d>0){const force=(1-d/145)*185;p.vx+=dx/d*force*dt;p.vy+=dy/d*force*dt;}p.vx*=Math.exp(-3*dt);p.vy*=Math.exp(-3*dt);p.x+=(p.speed+p.vx)*dt;p.y+=(-p.speed*.2+p.vy)*dt;if(p.x>width+10)p.x=-10;if(p.x< -15)p.x=width+5;if(p.y< -10)p.y=height+5;if(p.y>height+10)p.y=-5;}}
 const alpha=p.born?Math.min(.9,(p.life-p.age)/(p.life<2?.7:4)):.42;ctx.fillStyle=p.born?`rgba(255,255,255,${alpha})`:`rgba(173,153,126,${alpha})`;if(pixel){
  const x=Math.round(p.x),y=Math.round(p.y);
  ctx.fillRect(x,y,2,2);
  if(p.born){
   ctx.fillRect(x-2,y,6,2);
   ctx.fillRect(x,y-2,2,6);
  }
  continue;
 }
 ctx.shadowColor='#fff';ctx.shadowBlur=p.born?7:2;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(p.born){ctx.strokeStyle=`rgba(255,255,255,${alpha*.6})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke();}}
 }
 function frame(t){raf=0;if(off()||document.hidden)return;const dt=last?Math.min((t-last)/1000,.04):0;last=t;draw(dt);raf=requestAnimationFrame(frame);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(off()||document.hidden){scene?.style.setProperty('--moon-x','0px');scene?.style.setProperty('--moon-y','0px');draw(0);}else raf=requestAnimationFrame(frame);}
 let lastTrail=0;addEventListener('pointermove',e=>{if(e.pointerType==='touch'||off())return;cursor.x=e.clientX;cursor.y=e.clientY;if(!e.target.closest('a,button,input,dialog,.sidebar,.material,.search,astro-assistente,#astroAccountTools')&&performance.now()-lastTrail>95){add(e.clientX+(Math.random()-.5)*14,e.clientY+(Math.random()-.5)*14,true,true);lastTrail=performance.now();}scene?.style.setProperty('--moon-x',((e.clientX/width-.5)*6)+'px');scene?.style.setProperty('--moon-y',((e.clientY/height-.5)*4)+'px');},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{cursor.x=cursor.y=-999;});
 document.addEventListener('click',e=>{if(off()||e.target.closest('a,button,input,textarea,select,label,dialog,.sidebar,.material,.search,astro-assistente,#astroAccountTools'))return;add(e.clientX,e.clientY,true);draw(0);});
 document.addEventListener('visibilitychange',sync);document.addEventListener('astrolearn:motion',sync);media.addEventListener('change',sync);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(resize,150);});resize();sync();
})();
