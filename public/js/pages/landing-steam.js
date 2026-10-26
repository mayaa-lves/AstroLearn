/* Five local, keyboard-accessible mini experiences. No backend required. */
(() => {
  'use strict';
  const panel=document.getElementById('steamLab');
  if(!panel)return;
  const buttons=[...document.querySelectorAll('[data-steam]')];
  const visual=document.getElementById('steamVisual'),controls=document.getElementById('steamControls');
  const result=document.getElementById('steamResult');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const off=()=>reduced.matches||document.body.classList.contains('motion-off');
  let active=null,entrance=null,experiment=null;
  const layout=()=>document.dispatchEvent(new Event('landing:layout'));
  const defs=`<defs>
    <linearGradient id="labMetal" x1="0" x2="1"><stop stop-color="#c1b5d2"/><stop offset=".25" stop-color="#f8f7fd"/><stop offset=".65" stop-color="#e6e0ef"/><stop offset="1" stop-color="#9d8cae"/></linearGradient>
    <linearGradient id="labPurple" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bc9af5"/><stop offset=".45" stop-color="#7951b9"/><stop offset="1" stop-color="#3e275f"/></linearGradient>
    <linearGradient id="labTeal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c0e4db"/><stop offset="1" stop-color="#5f9e9d"/></linearGradient>
    <radialGradient id="labLight"><stop stop-color="#ffdf92" stop-opacity=".8"/><stop offset="1" stop-color="#ffdf92" stop-opacity="0"/></radialGradient>
  </defs>`;
  const svg=(content,label)=>`<svg viewBox="0 0 460 320" role="img" aria-label="${label}">${defs}${content}</svg>`;
  const range=(id,label,min,max,value)=>`<label class="steam-range-label" for="${id}"><span>${label}</span><output id="${id}Value" for="${id}">${value}</output></label><input class="steam-range" id="${id}" type="range" min="${min}" max="${max}" value="${value}">`;
  const action=(id,text,secondary=false)=>`<button type="button" id="${id}" class="button ${secondary?'secondary':'primary'}">${text}</button>`;
  function science(){
    visual.innerHTML=`<div class="microscope-object">${svg(`
      <ellipse cx="225" cy="286" rx="125" ry="15" fill="#c3b5d3" opacity=".2"/>
      <path d="M150 264 Q130 282 157 287 L307 287 Q327 282 311 266 L278 249 177 249Z" fill="url(#labMetal)" stroke="#c4b8d0"/>
      <path d="M163 263 294 263 278 248 179 248Z" fill="#faf8ff"/>
      <path d="M267 251V217 C324 207 339 176 321 135 L286 93 265 113 C305 165 298 183 252 191 L241 254Z" fill="url(#labPurple)"/>
      <path d="M274 243V215 C324 197 330 166 311 136" fill="none" stroke="#d2b8ef" stroke-width="5" opacity=".6"/>
      <path d="M143 193 268 193 290 207 159 207Z" fill="#53455e"/><path d="M159 207H290V217H159Z" fill="#2d2637"/>
      <path d="M182 187 225 187 238 196 193 196Z" fill="#b8e5e2" opacity=".8" stroke="#80aeb3"/>
      <ellipse cx="215" cy="238" rx="25" ry="8" fill="#d9cdf0"/><ellipse cx="215" cy="235" rx="19" ry="6" fill="#fdf7d8"/>
      <g transform="rotate(-27 221 117)"><rect x="204" y="54" width="37" height="100" rx="6" fill="url(#labMetal)" stroke="#b2a0be"/><rect x="205" y="46" width="35" height="18" rx="4" fill="#302b3e"/><ellipse cx="222" cy="47" rx="17" ry="5" fill="#555365"/><ellipse cx="222" cy="47" rx="11" ry="3" fill="#99bfc3"/><rect x="210" y="141" width="24" height="27" rx="3" fill="url(#labPurple)"/></g>
      <path d="M224 154 217 176H231L237 159Z" fill="url(#labMetal)" stroke="#a899b6"/><path d="M245 153 246 173H257L254 153Z" fill="url(#labMetal)" stroke="#a899b6"/>
      <g class="focus-wheel"><circle cx="260" cy="205" r="24" fill="#3d304e"/><circle cx="260" cy="205" r="18" fill="url(#labMetal)"/><circle cx="260" cy="205" r="9" fill="#88739e"/><path d="M260 189V195" stroke="#faf8ff" stroke-width="3" stroke-linecap="round"/></g>
    `,'Microscópio ilustrado com botão de ajuste de foco')}</div>
    <div class="steam-sample"><div class="steam-sample-scene"><svg viewBox="0 0 180 180" aria-hidden="true"><rect width="180" height="180" fill="#e1efea"/>${[[37,38,28,20],[101,32,29,22],[150,65,25,31],[73,90,34,26],[24,119,25,30],[130,127,32,27],[68,158,28,21]].map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#a3cfbf" fill-opacity=".45" stroke="#679d8c" stroke-width="2"/><ellipse cx="${x+2}" cy="${y-1}" rx="8" ry="7" fill="#7f82ae" fill-opacity=".7"/>`).join('')}</svg></div></div><span class="steam-sample-caption">Amostra ilustrada · células</span>`;
    controls.innerHTML=range('labFocus','Ajuste o foco',0,100,20)+`<div class="steam-actions">${action('labZoom','Ampliar amostra',true)}</div>`;
    const input=document.getElementById('labFocus');let zoom=false,sharp=false;
    const update=()=>{
      const value=Number(input.value),distance=Math.abs(value-67);
      visual.style.setProperty('--focus-blur',`${Math.min(7,distance/8)}px`);
      visual.style.setProperty('--focus-turn',`${value*2.7}deg`);
      document.getElementById('labFocusValue').value=String(value);
      input.setAttribute('aria-valuetext',`${value} de 100${distance<7?', amostra nítida':''}`);
      const now=distance<7;
      if(now!==sharp||!result.textContent){result.textContent=now?'Você encontrou o foco! Observe os contornos e compare as formas.':'Mova o ajuste até conseguir observar os contornos com nitidez.';sharp=now;}
    };
    input.addEventListener('input',update);
    document.getElementById('labZoom').addEventListener('click',event=>{zoom=!zoom;visual.style.setProperty('--sample-zoom',zoom?'1.65':'1');event.currentTarget.textContent=zoom?'Voltar à ampliação inicial':'Ampliar amostra';event.currentTarget.setAttribute('aria-pressed',String(zoom));});
    update();
  }
  function technology(){
    visual.innerHTML=svg(`
      <ellipse cx="235" cy="285" rx="165" ry="14" fill="#d8cbe7" opacity=".24"/>
      <path d="M90 210V100H175M285 100H363V230H90V210" class="circuit-path"/>
      <rect x="69" y="153" width="42" height="66" rx="7" fill="url(#labMetal)" stroke="#b9a8ca"/><rect x="81" y="146" width="18" height="8" rx="2" fill="#776487"/>
      <text x="90" y="174" text-anchor="middle" fill="#796789" font-size="17">+</text><text x="90" y="206" text-anchor="middle" fill="#796789" font-size="18">−</text>
      <circle cx="363" cy="108" r="75" fill="url(#labLight)" class="lamp-glow"/>
      <path class="circuit-bulb" d="M339 114 C305 62 352 34 378 56 C402 76 386 101 380 114V139H340Z" stroke="#bdaec8" stroke-width="2"/>
      <path d="M344 141H377M344 147H377M349 154H373" stroke="#8a7c9a" stroke-width="5" stroke-linecap="round"/>
      <path d="M353 129V102L346 91 357 96 369 89 371 102V129" fill="none" stroke="#a994b2" stroke-width="2"/>
      <circle cx="175" cy="100" r="8" fill="#ac98c5"/><circle cx="285" cy="100" r="8" fill="#ac98c5"/>
      <defs><linearGradient id="labSwitchMetal" gradientUnits="userSpaceOnUse" x1="175" y1="65" x2="285" y2="115"><stop stop-color="#b88bea"/><stop offset=".4" stop-color="#905bcd"/><stop offset="1" stop-color="#603a96"/></linearGradient></defs>
      <g id="labSwitchHandle" class="circuit-switch" tabindex="0" role="slider" aria-label="Interruptor do circuito: arraste a haste ou use as setas" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Circuito aberto" aria-orientation="vertical"><path id="labSwitchHit" class="switch-hit" d="M175 100 272 48" fill="none" stroke="transparent" stroke-width="32" stroke-linecap="round"/><path id="labSwitchArm" d="M175 100 272 48" fill="none" stroke="url(#labSwitchMetal)" stroke-width="10" stroke-linecap="round" pointer-events="none"/></g>
    `,'Circuito ilustrado com bateria, interruptor e lâmpada');
    controls.innerHTML=`<div class="steam-actions">${action('labSwitch','Fechar circuito')}</div>`;
    visual.querySelector('svg').setAttribute('role','group');
    const handle=document.getElementById('labSwitchHandle');
    const arm=document.getElementById('labSwitchArm'),hit=document.getElementById('labSwitchHit');
    const button=document.getElementById('labSwitch');
    const root=visual.querySelector('svg');
    let on=false,angle=-28,dragging=false,pointerId=null;
    const change=value=>{
      angle=Math.max(-28,Math.min(0,value));
      const radians=angle*Math.PI/180;
      const path=`M175 100 L${175+Math.cos(radians)*110} ${100+Math.sin(radians)*110}`;
      arm.setAttribute('d',path);hit.setAttribute('d',path);
      const next=angle>=-3;
      visual.classList.toggle('circuit-on',next);
      button.textContent=next?'Abrir circuito':'Fechar circuito';
      button.setAttribute('aria-pressed',String(next));
      handle.setAttribute('aria-valuenow',String(Math.round((angle+28)/28*100)));
      handle.setAttribute('aria-valuetext',next?'Circuito fechado, lâmpada acesa':'Circuito aberto, lâmpada apagada');
      if(next!==on||!result.textContent)result.textContent=next?'Circuito fechado: há um caminho contínuo para a corrente e a lâmpada acende.':'Arraste a haste roxa até o contato da direita para fechar o circuito.';
      on=next;
    };
    const move=event=>{
      if(!dragging||event.pointerId!==pointerId)return;
      const matrix=root.getScreenCTM();if(!matrix)return;
      const point=root.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
      const local=point.matrixTransform(matrix.inverse());
      change(Math.atan2(local.y-100,local.x-175)*180/Math.PI);
    };
    const finish=()=>{if(!dragging)return;dragging=false;handle.classList.remove('is-dragging');change(angle>-14?0:-28);};
    handle.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      event.preventDefault();dragging=true;pointerId=event.pointerId;handle.focus({preventScroll:true});handle.classList.add('is-dragging');handle.setPointerCapture(pointerId);move(event);
    });
    handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',event=>{if(event.pointerId!==pointerId)return;finish();if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);});
    handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);
    handle.addEventListener('keydown',event=>{
      const actions={ArrowDown:()=>change(angle+7),ArrowRight:()=>change(angle+7),ArrowUp:()=>change(angle-7),ArrowLeft:()=>change(angle-7),Home:()=>change(-28),End:()=>change(0),Enter:()=>change(on?-28:0),' ':()=>change(on?-28:0)};
      if(actions[event.key]){event.preventDefault();actions[event.key]();}
    });
    button.onclick=()=>change(on?-28:0);change(-28);
  }

  function engineering(){
    visual.innerHTML=svg(`
      <ellipse cx="232" cy="280" rx="188" ry="16" fill="#d8cbe7" opacity=".22"/>
      <path d="M30 205 119 205 127 270 43 270Z" fill="url(#labMetal)"/><path d="M339 205H430L419 270H332Z" fill="url(#labMetal)"/>
      <path d="M47 207H112M346 207H415" stroke="#e0d8eb" stroke-width="8" stroke-linecap="round"/>
      <path d="M121 205H340" fill="none" stroke="#d4c5e3" stroke-width="2" stroke-dasharray="5 7"/>
      ${[0,1,2].map(i=>`<g class="bridge-piece" data-piece="${i}"><path d="M${120+i*73} 197h73v15h-73Z" fill="url(#labPurple)"/><path d="M${120+i*73} 197v-49l73 49v-49l-73 49" fill="none" stroke="#a88bd0" stroke-width="5" stroke-linejoin="round"/></g>`).join('')}
      <g class="bridge-rover"><rect x="70" y="176" width="35" height="18" rx="7" fill="url(#labTeal)"/><rect x="78" y="167" width="17" height="13" rx="4" fill="#aebbd7"/><circle cx="78" cy="196" r="6" fill="#5d4e70"/><circle cx="98" cy="196" r="6" fill="#5d4e70"/></g>
    `,'Ponte ilustrada com três peças e um pequeno veículo');
    controls.innerHTML=`<div class="steam-actions">${action('labBuild','Encaixar peça 1 de 3')}${action('labBuildReset','Recomeçar',true)}</div>`;
    let pieces=0,busy=false;
    const build=document.getElementById('labBuild');
    function reset(){experiment?.cancel();experiment=null;pieces=0;busy=false;build.disabled=false;visual.classList.remove('bridge-ready');visual.querySelectorAll('.bridge-piece').forEach(p=>p.classList.remove('is-placed'));build.textContent='Encaixar peça 1 de 3';result.textContent='Encaixe as três partes antes de testar o caminho.';}
    build.onclick=()=>{
      if(busy)return;
      if(pieces<3){visual.querySelector(`[data-piece="${pieces}"]`).classList.add('is-placed');pieces++;build.textContent=pieces<3?`Encaixar peça ${pieces+1} de 3`:'Testar ponte';visual.classList.toggle('bridge-ready',pieces===3);result.textContent=pieces<3?`${pieces} de 3 peças encaixadas. Continue construindo.`:'Estrutura montada! Agora teste o percurso do veículo.';return;}
      busy=true;build.disabled=true;
      const rover=visual.querySelector('.bridge-rover');
      const finish=()=>{busy=false;build.disabled=false;build.textContent='Testar novamente';result.textContent='Percurso concluído! Construir, testar e melhorar faz parte da engenharia. Esta é uma demonstração visual, sem cálculo estrutural.';};
      if(off()||!rover.animate){finish();return;}
      experiment=rover.animate([{transform:'translateX(0)'},{transform:'translateX(290px)'}],{duration:1500,easing:'ease-in-out'});
      experiment.finished.then(finish,()=>{});
    };
    document.getElementById('labBuildReset').onclick=reset;reset();
  }
  function arts(){
    visual.innerHTML='<div class="lab-paint-orb" role="img" aria-label="Esfera ilustrada cuja cor muda com a mistura"></div><span class="steam-note">Experimento com cores digitais</span>';
    controls.innerHTML=range('labMix','Explore a mistura',0,100,0)+'<div class="steam-color-labels"><span>Violeta</span><span>Ciano</span></div><div class="steam-swatches">'+[[0,'Violeta','#8253df'],[50,'Mistura equilibrada','#5b88c1'],[100,'Ciano','#35bea4']].map(([v,label,c])=>`<button class="steam-swatch" type="button" data-mix="${v}" style="--swatch:${c}" aria-label="${label}" aria-pressed="false"><i aria-hidden="true"></i></button>`).join('')+'</div>';
    const input=document.getElementById('labMix');
    const update=()=>{const value=Number(input.value),t=value/100;const color=[130,83,223].map((c,i)=>Math.round(c+([53,190,164][i]-c)*t));visual.querySelector('.lab-paint-orb').style.setProperty('--paint-color',`rgb(${color.join(',')})`);document.getElementById('labMixValue').value=value+'%';input.setAttribute('aria-valuetext',`${100-value}% violeta e ${value}% ciano`);controls.querySelectorAll('[data-mix]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mix)===value)));result.textContent=`Sua combinação: ${100-value}% violeta e ${value}% ciano. Experimente outra proporção e observe a mudança.`;};
    input.oninput=update;controls.querySelectorAll('[data-mix]').forEach(b=>b.onclick=()=>{input.value=b.dataset.mix;update();});update();
  }
  function math(){
    visual.classList.add('steam-visual-math');
    visual.innerHTML=svg('<ellipse cx="230" cy="279" rx="126" ry="14" fill="#d2c4e3" opacity=".2"/><polygon id="labShapeDepth" fill="#66478b"/><polygon id="labShape" fill="url(#labTeal)" stroke="#fcfffd" stroke-width="2"/><g id="labVertices"></g>','Polígono regular ilustrado; use o controle para alterar seus lados');
    controls.innerHTML=range('labSides','Quantidade de lados',3,8,3);
    const names={3:'Triângulo',4:'Quadrado',5:'Pentágono',6:'Hexágono',7:'Heptágono',8:'Octógono'};
    const input=document.getElementById('labSides');
    const update=()=>{const n=Number(input.value),points=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/n;return[230+Math.cos(a)*96,142+Math.sin(a)*96];});document.getElementById('labShape').setAttribute('points',points.map(p=>p.join(',')).join(' '));document.getElementById('labShapeDepth').setAttribute('points',points.map(([x,y])=>[x,y+12].join(',')).join(' '));document.getElementById('labVertices').innerHTML=points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#6d4da2" stroke="white" stroke-width="2"/>`).join('');document.getElementById('labSidesValue').value=String(n);input.setAttribute('aria-valuetext',`${names[n]}, ${n} lados e ${n} vértices`);result.textContent=`${names[n]}: ${n} lados e ${n} vértices. Cada ponto marcado é o encontro de dois lados.`;};
    input.oninput=update;update();
  }
  const areas={
    ciencia:['CIÊNCIA','Olhe mais de perto.','Uma descoberta pode começar com um detalhe. Ajuste o microscópio e observe a amostra ilustrada.',science],
    tecnologia:['TECNOLOGIA','Conecte uma ideia.','Explore como uma conexão pode mudar o funcionamento de um circuito simples.',technology],
    engenharia:['ENGENHARIA','Uma peça de cada vez.','Encaixe as partes, teste o percurso e observe o resultado da sua construção.',engineering],
    artes:['ARTES','Dê o seu toque.','Uma mesma forma pode ter muitas expressões. Experimente cores e crie a sua combinação.',arts],
    matematica:['MATEMÁTICA','Encontre novas formas.','Mude a quantidade de lados e descubra como a figura se transforma.',math]
  };
  function stop(){entrance?.cancel();entrance=null;experiment?.cancel();experiment=null;}
  function close(){
    if(!active)return;
    stop();const button=buttons.find(b=>b.dataset.steam===active);
    if(panel.contains(document.activeElement))button?.focus();
    buttons.forEach(b=>b.setAttribute('aria-expanded','false'));active=null;
    if(off()||!panel.animate){panel.hidden=true;layout();return;}
    entrance=panel.animate([{height:panel.offsetHeight+'px',opacity:1},{height:'0px',opacity:0}],{duration:280,easing:'ease-in'});
    entrance.finished.then(()=>{panel.hidden=true;layout();},()=>{});
  }
  function open(button){
    const key=button.dataset.steam;if(active===key){close();return;}
    const wasOpen=!panel.hidden;stop();active=key;
    buttons.forEach(b=>b.setAttribute('aria-expanded',String(b===button)));
    const [area,title,intro,render]=areas[key];
    document.getElementById('steamLabArea').textContent=area+' · EXPERIMENTE';document.getElementById('steamLabTitle').textContent=title;document.getElementById('steamLabIntro').textContent=intro;
    result.textContent='';visual.className='steam-visual';visual.removeAttribute('style');panel.hidden=false;render();
    if(!off()&&panel.animate){
      const target=panel.offsetHeight;
      entrance=wasOpen?panel.animate([{opacity:.2,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'}):panel.animate([{height:'0px',opacity:0},{height:target+'px',opacity:1}],{duration:460,easing:'cubic-bezier(.2,.75,.25,1)'});
      entrance.finished.then(layout,()=>{});
    }
    layout();
  }
  buttons.forEach(button=>{button.setAttribute('aria-controls','steamLab');button.setAttribute('aria-expanded','false');button.addEventListener('click',()=>open(button));});
  panel.querySelector('.steam-close').onclick=close;
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  document.addEventListener('landing:motion',()=>{if(off()){entrance?.finish();experiment?.finish();}});
})();
