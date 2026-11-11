import { createPlanetRenderer } from './universo-planetas.js';

export function initUniverse() {
  const $ = id => document.getElementById(id);
  const viewport = $('universeViewport');
  if (!viewport || viewport.dataset.initialized) return;
  viewport.dataset.initialized = 'true'; viewport.tabIndex = 0;
  const sky = $('universeStars'), canvas = $('universePlanets');
  const ctx = sky.getContext('2d');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const camera = { x: 800, y: 500, z: 1, tx: 800, ty: 500, tz: 1 };
  const cursor = { x: -1000, y: -1000 };
  const flight = { x: 0, y: 0, angle: 0 };
  const planets = {
    biolab: { x: 870, y: 715, r: 135, kind: 0, speed: .006, phase: .4 },
    pegadas: { x: 345, y: 650, r: 340, kind: 1, speed: .0055, phase: .06 },
    cidades: { x: 865, y: 235, r: 137, kind: 2, speed: .004, phase: .1 },
    eco: { x: 1250, y: 495, r: 190, kind: 0, speed: .008, phase: 0 }
  };
  let w = 1, h = 1, ratio = 1, scale = 1, left = 120, selected = null;
  let frame = 0, previous = 0, time = 0, movingCamera = false, disposed = false;
  let drag = null, pinch = null, lastMotion = 0;
  const pointers = new Map();
  const stars = Array.from({ length: 250 }, (_,i) => ({ x: random(i*7+1), y: random(i*7+2), size: .35+random(i*7+3)*1.3, depth: .2+random(i*7+4)*.8 }));
  let born = [];
  function random(seed) { const n = Math.sin(seed * 127.1) * 43758.5453; return n - Math.floor(n); }
  const reduced = () => media.matches || document.body.classList.contains('astro-motion-off');
  const blocked = () => document.body.classList.contains('is-blocked');
  function projection(p, depth = 1) {
    const s = scale * camera.z;
    return { x: left+(w-left)/2+(p.x-camera.x)*s + (cursor.x>w*.1?(cursor.x-w/2)*.007*depth:0), y: h/2+(p.y-camera.y)*s, r: p.r*s };
  }
  const textureURL = new URL((globalThis.astroArte || (url => url))('../../../../assets/imagens/aluno/jogos/texturas-planetas.png'), import.meta.url).href;
  function textureReady(ok) {
    document.body.classList.toggle('universe-fallback', !ok);
    if (!ok) $('universeStatus').textContent = 'Visual simplificado ativo. Todos os destinos continuam disponíveis.';
    wake();
  }
  let renderer = createPlanetRenderer(canvas,textureURL,textureReady);
  if (!renderer) textureReady(false);
  else document.body.classList.add('universe-fallback');
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); renderer = null; textureReady(false);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    renderer = createPlanetRenderer(canvas,textureURL,textureReady);
    if (!renderer) textureReady(false);
    wake();
  });
  function clampCamera() {
    camera.tx = Math.max(100,Math.min(1500,camera.tx));
    camera.ty = Math.max(100,Math.min(1100,camera.ty));
    camera.tz = Math.max(.65,Math.min(2.4,camera.tz));
    $('zoomValue').textContent = Math.round(camera.tz*100)+'%';
    $('zoomOut').disabled = camera.tz<=.651; $('zoomIn').disabled = camera.tz>=2.399;
  }
  function move() {
    clampCamera();
    movingCamera = true;
    if (reduced()) { camera.x=camera.tx; camera.y=camera.ty; camera.z=camera.tz; movingCamera=false; }
    wake();
  }
  function reset() {
    camera.tx=800; camera.ty=500; camera.tz=1; selected=null;
    document.querySelectorAll('.planet-target').forEach(b=>b.setAttribute('aria-pressed','false'));
    $('destinationPanel').hidden = true;
    $('universeStatus').textContent = 'Visão geral restaurada.';
    move();
  }
  $('zoomIn').addEventListener('click',()=>{ camera.tz+=.15; move(); });
  $('zoomOut').addEventListener('click',()=>{ camera.tz-=.15; move(); });
  $('resetUniverse').addEventListener('click',reset);
  document.addEventListener('astrolearn:universe-focus',event=>{
    const p=planets[event.detail?.id]; if (!p || blocked()) return;
    selected=event.detail.id;
    camera.tz=selected==='pegadas'?1:1.45;
    const desiredX=w<801?w*.55:w*.68, desiredY=w<801?h*.38:h*.43;
    camera.tx=p.x-(desiredX-(left+(w-left)/2))/(scale*camera.tz);
    camera.ty=p.y-(desiredY-h/2)/(scale*camera.tz);
    move();
  });
  function setObject(id,x,y,width,angle=0) {
    const el=$(id); if (!el) return;
    el.style.width=width+'px';
    el.style.transform=`translate(${x-width/2}px,${y-width/3}px) rotate(${angle}deg)`;
  }
  function paintSky(dt) {
    if (!ctx) return;
    ctx.clearRect(0,0,w,h);
    stars.forEach(star=>{
      const x=((star.x*w+time*star.depth*4-(camera.x-800)*star.depth*.08)%w+w)%w;
      const y=((star.y*h-(camera.y-500)*star.depth*.06)%h+h)%h;
      ctx.globalAlpha=.35+star.depth*.45;
      ctx.fillStyle='#e9e8fa'; ctx.beginPath(); ctx.arc(x,y,star.size,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    const sun=ctx.createRadialGradient(w*.94,h*.18,0,w*.94,h*.18,w*.23);
    sun.addColorStop(0,'#fff6ce'); sun.addColorStop(.017,'#ffe7b1'); sun.addColorStop(.055,'#ffd69a66'); sun.addColorStop(.25,'#e6be7c19'); sun.addColorStop(1,'#caaa6600');
    ctx.fillStyle=sun; ctx.fillRect(0,0,w,h);
    for (let i=0;i<100;i++) {
      const angle=(i/100)*Math.PI*2+time*.008;
      const p=projection({x:865+Math.cos(angle)*(530+random(i+2)*85),y:450+Math.sin(angle)*115,r:1},.5);
      const r=(.7+random(i+11)*2.5)*Math.max(.8,scale*camera.z);
      ctx.fillStyle=i%4===0?'#9d917f9c':'#584f459c'; ctx.beginPath();
      for(let v=0;v<6;v++){const a=v/6*Math.PI*2;const rr=r*(.7+random(i*7+v)*.4); const x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr;v?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.closePath(); ctx.fill();
    }
    for(let i=0;i<8;i++) {
      const x=((random(i+400)*w+time*(5+i*.4)-(camera.x-800)*.22)% (w+100)+w+100)%(w+100)-50;
      const y=h*(.45+random(i+450)*.5)-(camera.y-500)*.12;
      const r=4+random(i+480)*13;
      const rock=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);
      rock.addColorStop(0,'#928574');rock.addColorStop(.45,'#514a40');rock.addColorStop(1,'#151923');
      ctx.fillStyle=rock;ctx.beginPath();ctx.ellipse(x,y,r,r*.72,i,0,Math.PI*2);ctx.fill();
    }
    born=born.filter(s=>s.age<14);
    born.forEach(s=>{
      s.age+=dt;
      if(s.age>.8){const dx=s.x-cursor.x,dy=s.y-cursor.y,d=Math.hypot(dx,dy);s.x+=(12+(d<95?dx*.3:0))*dt;s.y+=(d<95?dy*.3:1)*dt;}
      ctx.globalAlpha=Math.min(1,14-s.age);ctx.fillStyle='#f2e8ff';ctx.beginPath();ctx.arc(s.x,s.y,1.7,0,Math.PI*2);ctx.fill();
    });ctx.globalAlpha=1;
  }
  function render(dt) {
    if (disposed) return;
    if (movingCamera) {
      const ease=reduced()?1:1-Math.exp(-6*(dt||.016));
      camera.x+=(camera.tx-camera.x)*ease; camera.y+=(camera.ty-camera.y)*ease; camera.z+=(camera.tz-camera.z)*ease;
      movingCamera=Math.abs(camera.x-camera.tx)+Math.abs(camera.y-camera.ty)+Math.abs(camera.z-camera.tz)*100>.15;
    }
    const moving=!reduced()&&!blocked();
    if(moving)time+=dt;
    paintSky(moving?dt:0);
    const list=[];
    for(const [id,p] of Object.entries(planets)) {
      const q=projection(p,id==='pegadas'?1.4:1);
      list.push({...q,kind:p.kind,phase:p.phase+time*p.speed,selected:id===selected});
      const target=$('planet-'+id);
      target.style.width=q.r*2+'px';target.style.height=q.r*2+'px';target.style.transform=`translate(${q.x-q.r}px,${q.y-q.r}px)`;
      // As indicações mantêm tamanho legível; os planetas não são imagens achatadas.
    }
    const earth=planets.eco, moonAngle=time*.11;
    const moon=projection({x:earth.x+Math.cos(moonAngle)*290,y:earth.y+Math.sin(moonAngle)*100,r:34});
    list.splice(2,0,{...moon,kind:3,phase:time*.002,selected:false});
    const rover=projection({x:planets.pegadas.x+75,y:planets.pegadas.y-85,r:1});
    setObject('universeRover',rover.x,rover.y,Math.max(60,Math.min(150,100*scale*camera.z)));
    const stationAngle=time*.045;
    const station=projection({x:planets.cidades.x+140+Math.sin(stationAngle)*45,y:planets.cidades.y+80+Math.cos(stationAngle)*30,r:1});
    setObject('universeStation',station.x,station.y,Math.max(80,Math.min(190,145*scale*camera.z)),-7+Math.sin(time*.13)*3);
    const foreground={x:w*1.1,y:h*1.42,r:h*.58,kind:3,phase:.14+time*.0008,selected:false};
    list.push(foreground);
    renderer?.draw(list,w,h,ratio);
    const pointerActive=fine.matches&&cursor.x>left&&performance.now()-lastMotion<4500;
    const destination=pointerActive?{x:cursor.x-40,y:cursor.y+45}:{x:w*.58+Math.sin(time*.14)*w*.11,y:h*.66+Math.cos(time*.18)*h*.04};
    const ease=1-Math.exp(-3*(dt||.016));
    const dx=destination.x-flight.x,dy=destination.y-flight.y;
    if(!reduced()) {flight.x+=dx*ease;flight.y+=dy*ease;}
    if(Math.hypot(dx,dy)>2){const target=Math.atan2(dy,dx)*180/Math.PI+180;flight.angle+=(((target-flight.angle+540)%360)-180)*ease*.4;}
    setObject('universeShip',flight.x,flight.y,w<801?65:100,flight.angle);
    $('universeShip').hidden=blocked();
    document.querySelector('.universe-sky').style.transform=`translate(${-(camera.x-800)*.012}px,${-(camera.y-500)*.01}px) scale(1.04)`;
  }
  function tick(now) {
    frame=0; const dt=Math.min((now-(previous||now))/1000,.04);previous=now;render(dt);
    if(!document.hidden&&((!reduced()&&!blocked())||movingCamera))frame=requestAnimationFrame(tick);
  }
  function wake() {
    if(disposed||document.hidden)return;
    if(!frame){previous=0;frame=requestAnimationFrame(tick);}
  }
  function resize() {
    w=viewport.clientWidth;h=viewport.clientHeight;left=w<801?0:document.body.classList.contains('collapsed')?120:170;
    scale=Math.min((w-left)/1600,h/1000);
    if(w<801)scale=Math.min(w/1400,h/1300);
    ratio=Math.min(devicePixelRatio||1,w<801?1.25:1.5);
    for(const c of [sky,canvas]){c.width=Math.round(w*ratio);c.height=Math.round(h*ratio);}
    ctx?.setTransform(ratio,0,0,ratio,0,0);
    if(!flight.x){flight.x=w*.58;flight.y=h*.66;}
    $('universeHint').textContent=fine.matches?'Arraste para explorar · Use + e − para aproximar':'Arraste com um dedo · Use dois dedos ou + e − para aproximar';
    wake();
  }
  viewport.addEventListener('pointerdown',event=>{
    if(blocked()||event.target.closest('dialog,.destination-panel,.universe-top-actions,.universe-camera'))return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),z:camera.tz};drag=null;}
    else drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};
  });
  viewport.addEventListener('pointermove',event=>{
    cursor.x=event.clientX;cursor.y=event.clientY;lastMotion=performance.now();
    if(pointers.has(event.pointerId))pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2&&pinch){const[a,b]=[...pointers.values()];camera.tz=pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance);move();return;}
    if(drag?.id===event.pointerId){
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7)drag.moved=true;
      if(drag.moved){event.preventDefault();viewport.setPointerCapture(event.pointerId);document.body.classList.add('universe-dragging');camera.tx-=(event.clientX-drag.lastX)/(scale*camera.z);camera.ty-=(event.clientY-drag.lastY)/(scale*camera.z);move();}
      drag.lastX=event.clientX;drag.lastY=event.clientY;
    }wake();
  });
  function pointerEnd(event) {
    const wasDrag=drag?.moved||pinch;
    if(wasDrag){document.body.classList.add('universe-dragged');setTimeout(()=>document.body.classList.remove('universe-dragged'),80);}
    if(!wasDrag&&!event.target.closest('button,a')&&!blocked()&&!reduced()){
      born.push({x:event.clientX,y:event.clientY,age:0});if(born.length>40)born.shift();wake();
    }
    pointers.delete(event.pointerId);drag=null;pinch=null;document.body.classList.remove('universe-dragging');
  }
  viewport.addEventListener('pointerup',pointerEnd);
  viewport.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);drag=null;pinch=null;document.body.classList.remove('universe-dragging');});
  viewport.addEventListener('wheel',event=>{
    if(event.target.closest('dialog,.destination-panel')||blocked())return;
    event.preventDefault();camera.tz*=event.deltaY>0?.94:1.06;move();
  },{passive:false});
  viewport.addEventListener('keydown',event=>{
    if(event.target!==viewport&&!event.target.classList.contains('planet-target'))return;
    const direction={ArrowLeft:[-90,0],ArrowRight:[90,0],ArrowUp:[0,-90],ArrowDown:[0,90]}[event.key];
    if(direction){event.preventDefault();camera.tx+=direction[0]/camera.z;camera.ty+=direction[1]/camera.z;move();}
    if(event.key==='+'||event.key==='='){event.preventDefault();camera.tz+=.15;move();}
    if(event.key==='-'){event.preventDefault();camera.tz-=.15;move();}
    if(event.key==='0'){event.preventDefault();reset();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;}else wake();});
  media.addEventListener('change',wake);fine.addEventListener('change',resize);
  document.addEventListener('astrolearn:preferences',wake);
  document.addEventListener('astrolearn:motion',wake);
  new MutationObserver(()=>{left=w<801?0:document.body.classList.contains('collapsed')?120:170;wake();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  new ResizeObserver(resize).observe(viewport);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',wake);
  resize();clampCamera();wake();
}


/* astro-tema-v2 */