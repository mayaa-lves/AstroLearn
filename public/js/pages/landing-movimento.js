/* Motion layer inspired by the supplied videos; all effects are local/decorative. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  if (!hero || !art) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reduced.matches || document.body.classList.contains('motion-off');
  let disposed = false;
  document.body.classList.add('landing-enhanced');

  // Keep the original title, line breaks and accessible text; animate visual words.
  const title = document.getElementById('heroTitle');
  if (title) {
    const reader = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (reader.nextNode()) nodes.push(reader.currentNode);
    let wordIndex = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(text => {
        if (!text.trim()) { fragment.append(document.createTextNode(text)); return; }
        const clip = document.createElement('span');
        clip.className = 'intro-word'; clip.style.setProperty('--intro-index', String(wordIndex++));
        const word = document.createElement('span'); word.textContent = text;
        clip.append(word); fragment.append(clip);
      });
      node.replaceWith(fragment);
    });
  }

  const animated = [...document.querySelectorAll('.paint-scene,.paint-controls,.journey li,.team-list li,.plan,.faq-list details,.contact-info')];
  animated.forEach(el => {
    const group = el.parentElement;
    const siblings = [...group.children].filter(item => animated.includes(item));
    el.style.setProperty('--item-delay', Math.min(3, siblings.indexOf(el)) * 90 + 'ms');
    el.classList.add('motion-item');
  });
  let entries;
  if ('IntersectionObserver' in window) {
    entries = new IntersectionObserver(items => {
      items.forEach(item => {
        if (item.isIntersecting) {
          item.target.classList.add('motion-visible');
          entries.unobserve(item.target);
        }
      });
    }, {threshold: .08, rootMargin: '0px 0px 25px 0px'});
    animated.forEach(el => entries.observe(el));
  } else animated.forEach(el => el.classList.add('motion-visible'));

  const mascotAnimations = new Set();
  const mascots = [];
  document.querySelectorAll('.support-mascot').forEach((original, index) => {
    const button = document.createElement('button');
    button.className = original.className + ' mascot-interactive mascot-look';
    button.type = 'button';
    button.setAttribute('aria-label', index === 0 ? 'Cumprimentar o explorador' : 'Cumprimentar o mascote lilás');
    const tip = document.createElement('span'); tip.className = 'mascot-tip';
    tip.textContent = index === 0 ? 'Pronto para a próxima descoberta?' : 'Uma boa pergunta já é um começo!';
    button.append(tip); original.replaceWith(button); mascots.push(button);
    let greetingTimer;
    button.addEventListener('click', () => {
      clearTimeout(greetingTimer);
      button.classList.add('is-greeting');
      // Animate the illustrated sticker, not a purported rigged 3D model.
      mascotAnimations.forEach(animation => { if (animation.effect?.target === button) animation.cancel(); });
      if (!motionOff() && typeof button.animate === 'function') {
        const animation = button.animate([
          {transform:'translateY(0) rotate(0deg)'},
          {transform:'translateY(-9px) rotate(-5deg)',offset:.24},
          {transform:'translateY(-7px) rotate(4deg)',offset:.48},
          {transform:'translateY(-3px) rotate(-2deg)',offset:.72},
          {transform:'translateY(0) rotate(0deg)'},
        ], {duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});
        mascotAnimations.add(animation);
        animation.finished.then(() => mascotAnimations.delete(animation), () => mascotAnimations.delete(animation));
      }
      greetingTimer = setTimeout(() => button.classList.remove('is-greeting'), 2400);
    });
    button.addEventListener('pointermove', event => {
      if (motionOff() || event.pointerType === 'touch') return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--mascot-look', String((event.clientX - rect.left) / rect.width * 2 - 1));
    }, {passive:true});
    button.addEventListener('pointerleave', () => button.style.setProperty('--mascot-look','0'));
  });
  let mascotObserver;
  if ('IntersectionObserver' in window) {
    mascotObserver = new IntersectionObserver(items => {
      items.forEach(item => { if (item.isIntersecting) { item.target.classList.add('mascot-arrived'); mascotObserver.unobserve(item.target); } });
    }, {threshold:.25});
    mascots.forEach(el => mascotObserver.observe(el));
  }

  // One depth field for the opening. The approved hero illustration stays still.
  const oldStars = document.getElementById('landingStars');
  if (oldStars) oldStars.hidden = true;
  const canvas = document.createElement('canvas');
  canvas.id = 'landingOrbits'; canvas.setAttribute('aria-hidden','true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) { if(oldStars) oldStars.hidden = false; return; }
  const pointer = {x:-2000,y:-2000,vx:0,vy:0,time:0};
  const camera = {x:0,y:0};
  let width=0,height=0,frame=0,last=0,clock=0,visible=true;
  const spheres=[],stars=[],created=[];
  let seed=421;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};

  // Cached shaded textures: canvas gradients, no emojis, icon fonts or WebGL.
  function sphereTexture(teal) {
    const texture=document.createElement('canvas');texture.width=texture.height=192;
    const c=texture.getContext('2d');const color=teal?'72,169,185':'123,94,192';
    const shade=c.createRadialGradient(65,53,3,99,101,87);
    shade.addColorStop(0,'rgba(255,255,255,.72)');
    shade.addColorStop(.28,`rgba(${color},.025)`);
    shade.addColorStop(.66,`rgba(${color},.055)`);
    shade.addColorStop(.91,`rgba(${color},.19)`);
    shade.addColorStop(1,`rgba(${color},.035)`);
    c.fillStyle=shade;c.beginPath();c.arc(96,96,81,0,Math.PI*2);c.fill();
    c.strokeStyle=`rgba(${color},.26)`;c.lineWidth=.8;c.stroke();
    // A curved window-like highlight and a shaded lower rim establish volume.
    c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=4;c.lineCap='round';
    c.beginPath();c.arc(96,96,75,3.48,4.34);c.stroke();
    c.strokeStyle=`rgba(${color},.26)`;c.lineWidth=1.7;
    c.beginPath();c.arc(96,96,75,.4,1.85);c.stroke();
    const light=c.createRadialGradient(65,48,0,65,48,24);
    light.addColorStop(0,'rgba(255,255,255,.9)');light.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=light;c.beginPath();c.ellipse(65,48,24,12,-.6,0,Math.PI*2);c.fill();
    return texture;
  }
  const textures=[sphereTexture(false),sphereTexture(true)];
  const positions=[[.1,.12,.42],[.44,.72,.85],[.83,.12,.28],[.95,.64,.6],[.21,.88,.62],[.55,.3,.2],[.04,.56,1]];
  function resize() {
    const rect=hero.getBoundingClientRect();width=rect.width;height=rect.height;
    const dpr=document.documentElement.dataset.visualStyle==='pixel'?.3:Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seed=421;spheres.length=0;stars.length=0;created.length=0;
    positions.slice(0,width<650?4:7).forEach((p,i)=>spheres.push({
      x:p[0]*width,y:p[1]*height,z:p[2],r:width<650?14+p[2]*18:19+p[2]*35,
      vx:-(25+p[2]*28),phase:i*1.4,
      offsetX:0,offsetY:0,forceX:0,forceY:0,hiddenUntil:0,texture:textures[i%2]
    }));
    for(let i=0;i<(width<650?30:54);i++) stars.push({
      x:random()*width,y:random()*height,z:.15+random()*.85,
      r:.45+random()*1.15,phase:random()*6.28,large:i%13===0,offsetX:0,offsetY:0,forceX:0,forceY:0
    });
    spheres.sort((a,b)=>a.z-b.z);schedule();
  }
  function star(x,y,r,opacity,large=false) {
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=opacity;
    const halo=ctx.createRadialGradient(0,0,0,0,0,r*5);
    halo.addColorStop(0,'rgba(116,95,182,.36)');halo.addColorStop(1,'rgba(116,95,182,0)');
    ctx.fillStyle=halo;ctx.fillRect(-r*5,-r*5,r*10,r*10);
    ctx.fillStyle='#9b88bc';ctx.beginPath();ctx.arc(0,0,r*.6,0,Math.PI*2);ctx.fill();
    if(large){
      ctx.strokeStyle='#b2a0ce';ctx.lineWidth=.65;ctx.beginPath();
      ctx.moveTo(-r*2.8,0);ctx.lineTo(r*2.8,0);ctx.moveTo(0,-r*2.8);ctx.lineTo(0,r*2.8);ctx.stroke();
    }
    ctx.restore();
  }
  const wrap=(v,min,max)=>((v-min)%(max-min)+(max-min))%(max-min)+min;
  // Cursor wake: displace locally, then spring back into the moving lane.
  function disturb(p,baseX,baseY,radius,dt){
    const dx=baseX+p.offsetX-pointer.x,dy=baseY+p.offsetY-pointer.y;
    const distance=Math.hypot(dx,dy);
    if(distance<radius){
      const falloff=1-distance/radius;
      const angle=distance>.1?Math.atan2(dy,dx):p.phase;
      p.forceX+=(Math.cos(angle)*1050+pointer.vx*.85)*falloff*dt;
      p.forceY+=(Math.sin(angle)*1050+pointer.vy*.85)*falloff*dt;
    }
    p.forceX-=p.offsetX*3.8*dt;p.forceY-=p.offsetY*3.8*dt;
    const damping=Math.exp(-dt*2.7);
    p.forceX=Math.max(-650,Math.min(650,p.forceX*damping));
    p.forceY=Math.max(-650,Math.min(650,p.forceY*damping));
    p.offsetX=Math.max(-180,Math.min(180,p.offsetX+p.forceX*dt));
    p.offsetY=Math.max(-180,Math.min(180,p.offsetY+p.forceY*dt));
  }
  function draw(time) {
    frame=0;if(disposed||document.hidden||!visible)return;
    const dt=Math.min(.04,(time-last)/1000||.016);last=time;
    const running=!motionOff();if(running)clock+=dt;
    ctx.clearRect(0,0,width,height);
    if(running){
      const targetX=pointer.x<0?0:(pointer.x/width-.5)*2;
      const targetY=pointer.y<0?0:(pointer.y/height-.5)*2;
      const ease=1-Math.exp(-dt*3.5);
      camera.x+=(targetX-camera.x)*ease;camera.y+=(targetY-camera.y)*ease;
    }
    // Far field drifts slowly; nearer elements cross it at a different speed.
    stars.forEach(p=>{
      if(running){
        p.x=wrap(p.x-dt*(20+p.z*30),-18,width+18);
        disturb(p,p.x+camera.x*p.z*6,p.y+camera.y*p.z*4+Math.sin(clock*.35+p.phase)*5,135,dt);
      }
      const x=p.x+p.offsetX+camera.x*p.z*6,y=p.y+p.offsetY+camera.y*p.z*4+Math.sin(clock*.35+p.phase)*5;
      const readability=x<width*.43&&y>height*.22&&y<height*.82?.4:1;
      star(x,y,p.r,(.36+Math.sin(clock*.65+p.phase)*.12)*readability,p.large);
    });
    spheres.forEach(p=>{
      if(running){
        p.x=wrap(p.x+p.vx*dt,-p.r*2,width+p.r*2);
        disturb(p,p.x+camera.x*p.z*17,p.y+camera.y*p.z*12+Math.sin(clock*.35+p.phase)*8,p.r+135,dt);
      }
      if(clock<p.hiddenUntil)return;
      const x=p.x+p.offsetX+camera.x*p.z*17;
      const y=p.y+p.offsetY+camera.y*p.z*12+Math.sin(clock*.35+p.phase)*8;
      // Spheres remain behind the copy and illustration; text stays dominant.
      const readability=x<width*.44&&y>height*.2&&y<height*.87?.37:1;
      ctx.save();ctx.globalAlpha=(.55+p.z*.3)*readability;
      const size=p.r*2.35;ctx.drawImage(p.texture,x-size/2,y-size/2,size,size);
      ctx.restore();
    });
    if(running){pointer.vx*=Math.exp(-dt*6);pointer.vy*=Math.exp(-dt*6);frame=requestAnimationFrame(draw);}
  }
  function schedule(){if(!frame&&!disposed&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}}
  hero.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||motionOff())return;
    const rect=hero.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,now=performance.now();
    const elapsed=Math.max(.012,(now-pointer.time)/1000);
    if(pointer.x>=0&&elapsed<.2){
      pointer.vx=Math.max(-1200,Math.min(1200,(x-pointer.x)/elapsed));
      pointer.vy=Math.max(-1200,Math.min(1200,(y-pointer.y)/elapsed));
    }
    pointer.x=x;pointer.y=y;pointer.time=now;
    schedule();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.x=-2000;pointer.y=-2000;pointer.vx=0;pointer.vy=0;});
  hero.addEventListener('click',event=>{
    if(event.target.closest('a,button,input,textarea,summary')||motionOff())return;
    const rect=hero.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    // Both choices join the same looping right-to-left flow, at the click.
    // Camera and wave offsets are removed here so the first frame is aligned.
    const z=.45+Math.random()*.4;
    let item,collection;
    if(Math.random()<.5){
      item={x:x-camera.x*z*6,y:y-camera.y*z*4-Math.sin(clock*.35)*5,z,r:2.1,phase:0,large:true,offsetX:0,offsetY:0,forceX:0,forceY:0};
      collection=stars;
    }else{
      item={x:x-camera.x*z*17,y:y-camera.y*z*12-Math.sin(clock*.35)*8,z,
        r:width<650?20:29,vx:-(25+z*28),phase:0,offsetX:0,offsetY:0,
        forceX:0,forceY:0,hiddenUntil:0,texture:textures[Math.random()<.5?0:1]};
      collection=spheres;
    }
    collection.push(item);created.push({item,collection});
    // Keep objects in circulation; bound click-created objects for performance.
    if(created.length>24){const first=created.shift();const i=first.collection.indexOf(first.item);if(i>=0)first.collection.splice(i,1);}
    schedule();
  });
  function syncMotion(){
    if(motionOff()){
      camera.x=0;camera.y=0;pointer.x=-2000;pointer.y=-2000;
      mascots.forEach(el=>el.style.setProperty('--mascot-look','0'));
      mascotAnimations.forEach(animation=>animation.cancel());mascotAnimations.clear();
      if(frame)cancelAnimationFrame(frame);frame=0;
    }
    schedule();
  }
  let heroObserver;
  if('IntersectionObserver'in window){heroObserver=new IntersectionObserver(items=>{
    visible=items[0].isIntersecting;
    if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();
  });heroObserver.observe(hero);}
  const observer=new ResizeObserver(resize);observer.observe(hero);
  document.addEventListener('landing:style',resize);document.addEventListener('landing:motion',syncMotion);
  reduced.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();});
  window.addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;if(frame)cancelAnimationFrame(frame);entries?.disconnect();mascotObserver?.disconnect();heroObserver?.disconnect();observer.disconnect();mascotAnimations.forEach(a=>a.cancel());}});
  resize();
})();
