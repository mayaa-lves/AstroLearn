/* AstroLearn: navegação compartilhada. Não consulta nem modifica dados da conta. */
(() => {
  'use strict';
  const sidebar=document.querySelector('.sidebar');
  const nav=sidebar?.querySelector('nav');
  const toggle=document.getElementById('menuToggle');
  if(!sidebar||!nav||!toggle||sidebar.dataset.astroUnified)return;
  sidebar.dataset.astroUnified='true';
  document.body.classList.add('astro-nav-ready');
  const teacher=location.pathname.includes('/professor/');
  const mobile=matchMedia('(max-width: 800px)');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const noMotion=()=>motion.matches||document.body.classList.contains('astro-motion-off');
  const key=teacher?'astrolearn-teacher-menu':'astrolearn-menu';
  const positionKey='astrolearn-nav-from-'+(teacher?'professor':'aluno');
  const studentBase=new URL(location.pathname.includes('/aluno/jogos/')?'../':'./',location.href);
  const icons={
    'Marca':'M18 12a6 6 0 1 0-12 0 6 6 0 0 0 12 0ZM3 17c2 4 22-6 18-10-3-3-21 6-18 10Z',
    'Início':'m3 10 9-7 9 7v11h-6v-7H9v7H3Z',
    'Minha trilha':'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 9v3h12v3',
    'Biblioteca':'M12 5C8 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v16',
    'Conquistas':'M8 3h8v8a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 3v5m-4 1h8',
    'Loja':'M4 8h16l1 13H3ZM8 8V6a4 4 0 0 1 8 0v2',
    'Minha equipe':'M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 5v2',
    'Perfil':'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2',
    'Jogos':'M5 7h14l3 10-3 3-5-4h-4l-5 4-3-3ZM7 10v6m-3-3h6m6-2h1m1 3h1',
    'Turmas':'M3 4h18v17H3ZM7 8h3m4 0h3M7 13h3m4 0h3M7 18h3m4 0h3',
    'Sala':'m3 10 9-7 9 7v11h-6v-7H9v7H3Z',
    'Atividades':'M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5',
    'Equipes':'M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 5v2',
    'Correções':'M8 3H4v18h16V3h-4M8 2h8v4H8Zm0 11 3 3 5-6',
    'Perguntas':'M3 4h18v13H8l-5 4Zm4 4h10M7 12h6',
    'Notificações':'M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4',
    'Sair':'M9 4H4v16h5m5-12 4 4-4 4M9 12h12',
    'Assistente':'M4 3h16v14h-6l-4 4v-4H4Zm4 5h8m-8 4h5',
    'Ajuda':'M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 4m0 3h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
    'Mais':'M4 12h.01M12 12h.01M20 12h.01'
  };
  function icon(label){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',icons[label]||icons['Sala']);svg.append(path);return svg;}
  function labelOf(a){return a.getAttribute('aria-label')||a.querySelector('.label')?.textContent.trim()||a.textContent.trim();}
  function polish(a,label){
    if(a.dataset.astroLabel!==label){const text=document.createElement('span');text.className='label';text.textContent=label;a.replaceChildren(icon(label),text);a.dataset.astroLabel=label;}
    a.setAttribute('aria-label',label);a.classList.add('astro-nav-link');
  }
  let compact=true;
  try{const saved=localStorage.getItem(key);if(saved)compact=saved==='recolhido';}catch{}
  function apply(){document.body.classList.toggle('collapsed',compact);document.body.classList.toggle('menu-collapsed',compact);toggle.setAttribute('aria-expanded',String(!compact));toggle.setAttribute('aria-label',compact?'Expandir menu':'Recolher menu');toggle.textContent=compact?'›':'‹';schedule();}
  toggle.type='button';
  toggle.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();compact=!compact;apply();hideTooltip();try{localStorage.setItem(key,compact?'recolhido':'aberto');}catch{}},true);
  let brand=sidebar.querySelector('.brand');
  if(!brand){brand=document.createElement('a');brand.className='brand';brand.href=teacher?'home.html':new URL('home.html',studentBase).href;sidebar.prepend(brand);}
  if(brand){
    brand.classList.add('astro-nav-brand');
    const assets=new URL('../../assets/imagens/marca/',document.currentScript.src);
    const symbol=document.createElement('img');symbol.className='astro-brand-symbol';
    symbol.src=new URL('astrolearn-livro-simbolo.svg',assets).href;
    symbol.alt='';symbol.width=40;symbol.height=40;symbol.draggable=false;
    const full=document.createElement('img');full.className='astro-brand-full';
    full.src=new URL('astrolearn-livro-completa.svg',assets).href;full.alt='';full.width=180;full.height=40;full.draggable=false;
    brand.replaceChildren(symbol,full);brand.setAttribute('aria-label','AstroLearn — início');
  }
  const footer=document.createElement('div');footer.className='astro-nav-footer';sidebar.append(footer);
  const marker=document.createElement('span');marker.className='astro-nav-marker';marker.setAttribute('aria-hidden','true');
  const more=document.createElement('button');more.type='button';more.className='astro-nav-more mobile-more';more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-controls','menu-mobile-dialog');polish(more,'Mais');
  const dialog=document.createElement('dialog');dialog.id='menu-mobile-dialog';dialog.className='astro-nav-dialog';dialog.setAttribute('aria-labelledby','astro-nav-title');
  const title=document.createElement('h2');title.id='astro-nav-title';title.textContent=teacher?'Sua estação':'Sua expedição';
  const close=document.createElement('button');close.type='button';close.className='astro-nav-close';close.setAttribute('aria-label','Fechar navegação');close.textContent='×';
  const list=document.createElement('nav');list.setAttribute('aria-label','Todas as páginas');dialog.append(close,title,list);document.body.append(dialog);
  const tooltip=document.createElement('div');tooltip.className='astro-nav-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;document.body.append(tooltip);
  let updateFrame=0,active=null,first=true;
  const entries=[['home.html','Início'],['home.html#journey','Minha trilha'],['biblioteca.html','Biblioteca'],['conquistas.html','Conquistas'],['loja.html','Loja'],['equipe.html','Minha equipe'],['jogos/index.html','Jogos'],['assistente.html','Assistente'],['perfil.html','Perfil']];
  function buildStudent(){
    const ordered=[];
    for(const [file,label]of entries){let a=[...nav.querySelectorAll('a')].find(a=>labelOf(a)===label);if(!a){a=document.createElement('a');a.href=new URL(file,studentBase).href;nav.append(a);}polish(a,label);ordered.push(a);}
    // Ordena os elementos reais: leitura, Tab e menu mobile seguem a mesma ordem.
    // Só move quando necessário para o MutationObserver não criar um ciclo.
    ordered.forEach((a,index)=>{const current=nav.querySelectorAll('a')[index];if(current!==a)nav.insertBefore(a,current||null);});
    // Preferências continuam no perfil; os arquivos dessas telas não são removidos.
    nav.querySelectorAll('a').forEach(a=>{if(labelOf(a)==='Configurações')a.remove();});
  }
  function buildTeacher(){
    const params=new URLSearchParams(location.search),room=params.get('sala');
    const items=[['home.html','Turmas']];
    if(room)items.push(['turma.html','Sala'],['atividades.html','Atividades'],['biblioteca.html','Biblioteca'],['equipes.html','Equipes'],['correcoes.html','Correções'],['perguntas.html','Perguntas'],['jogos.html','Jogos']);
    items.push(['notificacoes.html','Notificações'],['assistente.html','Assistente']);
    const chosen=({'home.html':'Turmas','assistente.html':'Assistente','jogos.html':'Jogos','turma.html':'Sala','aluno.html':'Sala','atividade.html':'Atividades','atividades.html':'Atividades','editor-atividade.html':'Atividades','biblioteca.html':'Biblioteca','novo-material.html':'Biblioteca','equipes.html':'Equipes','correcao.html':'Correções','correcoes.html':'Correções','perguntas.html':'Perguntas','notificacoes.html':'Notificações'})[location.pathname.split('/').pop()];
    const keep=[];
    for(const [file,label]of items){
      let a=[...nav.querySelectorAll('a')].find(a=>labelOf(a)===label);
      if(!a){a=document.createElement('a');nav.append(a);}
      const url=new URL(file,location.href);
      if(room&&file!=='home.html'){url.searchParams.set('sala',room);if(params.get('periodo'))url.searchParams.set('periodo',params.get('periodo'));}
      if(a.href!==url.href)a.href=url.href;
      polish(a,label);a.classList.toggle('active',label===chosen);
      if(label===chosen)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      keep.push(a);
    }
    nav.querySelectorAll('a').forEach(a=>{if(!keep.includes(a)&&!a.href.includes('/auth/login.html'))a.remove();});
    keep.forEach((a,index)=>{const current=nav.querySelectorAll('a')[index];if(current!==a)nav.insertBefore(a,current||null);});
  }
  function moveFooter(){
    const exits=[...sidebar.querySelectorAll('a')].filter(a=>a.href.includes('/auth/login.html'));
    const preferred=exits.find(a=>a.id==='logout'||a.id==='exit')||exits[0];
    if(preferred){if(preferred.parentElement!==footer)footer.append(preferred);polish(preferred,'Sair');exits.filter(a=>a!==preferred).forEach(a=>a.remove());}
    const help=sidebar.querySelector('#help');if(help){if(help.parentElement!==footer)footer.prepend(help);polish(help,'Ajuda');}
  }
  function current(){
    const all=[...nav.querySelectorAll('a.astro-nav-link')];
    if(teacher)return all.find(a=>a.getAttribute('aria-current')==='page')||all.find(a=>a.classList.contains('active'))||null;
    let name='';const file=location.pathname.split('/').pop();
    if(location.pathname.includes('/aluno/jogos/'))name='Jogos';
    else if(file==='home.html')name=location.hash==='#journey'?'Minha trilha':'Início';
    else name=({'assistente.html':'Assistente','biblioteca.html':'Biblioteca','conquistas.html':'Conquistas','loja.html':'Loja','equipe.html':'Minha equipe','perfil.html':'Perfil','configuracoes.html':'Perfil','atividade.html':'Minha trilha'})[file]||'';
    all.forEach(a=>{const yes=labelOf(a)===name;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    return all.find(a=>labelOf(a)===name)||null;
  }
  function visible(node){return node&&getComputedStyle(node).display!=='none'&&node.getClientRects().length>0;}
  function markerTarget(node){return visible(node)?node:mobile.matches?more:null;}
  function place(node,instant=false){
    node=markerTarget(node);if(!node){marker.hidden=true;return;}marker.hidden=false;
    const r=node.getBoundingClientRect(),n=nav.getBoundingClientRect();
    marker.classList.toggle('astro-nav-instant',instant||noMotion());
    marker.style.width=mobile.matches?r.width+'px':'';
    marker.style.height=r.height+'px';marker.style.transform=`translate(${mobile.matches?r.left-n.left:0}px,${r.top-n.top+nav.scrollTop}px)`;
  }
  function update(){
    updateFrame=0;
    if(!teacher)buildStudent();
    else buildTeacher();
    moveFooter();
    if(!marker.isConnected)nav.prepend(marker);if(!more.isConnected)nav.append(more);
    active=current();const off=mobile.matches&&active&&!visible(active);more.classList.toggle('active',!!off);
    sidebar.querySelectorAll('.side-bottom,small').forEach(el=>{if(!el.children.length||el.classList.contains('side-bottom'))el.classList.add('astro-nav-old-footer');});
    if(first&&active&&!noMotion()){
      first=false;let last='';try{last=sessionStorage.getItem(positionKey)||'';}catch{}
      const previous=[...nav.querySelectorAll('a')].find(a=>labelOf(a)===last);
      place(previous||active,true);
      requestAnimationFrame(()=>requestAnimationFrame(()=>place(active)));
    }else{first=false;place(active);}
  }
  function schedule(){if(!updateFrame)updateFrame=requestAnimationFrame(update);}
  function hideTooltip(){tooltip.hidden=true;}
  function tip(a){if(!compact||mobile.matches)return;const r=a.getBoundingClientRect(),s=sidebar.getBoundingClientRect();tooltip.textContent=labelOf(a);tooltip.style.left=s.right+12+'px';tooltip.style.top=Math.max(12,Math.min(innerHeight-50,r.top+r.height/2-18))+'px';tooltip.hidden=false;a.removeAttribute('title');}
  nav.addEventListener('pointerover',event=>{const a=event.target.closest('a,button');if(!a)return;place(a);tip(a);});
  nav.addEventListener('pointerleave',()=>{place(active);hideTooltip();});
  nav.addEventListener('focusin',event=>{if(event.target.matches('a,button')){place(event.target);tip(event.target);}});
  nav.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!nav.contains(document.activeElement)){place(active);hideTooltip();}}));
  nav.addEventListener('scroll',()=>{hideTooltip();place(active,true);},{passive:true});
  nav.addEventListener('click',event=>{if(event.target.closest('a')){try{sessionStorage.setItem(positionKey,active?labelOf(active):'');}catch{}hideTooltip();}});
  function fillList(){list.replaceChildren();for(const a of [...nav.querySelectorAll('a.astro-nav-link'),...footer.querySelectorAll('a.astro-nav-link')]){const copy=a.cloneNode(true);copy.removeAttribute('id');copy.className='astro-nav-dialog-link';copy.removeAttribute('title');list.append(copy);}}
  more.addEventListener('click',()=>{fillList();const help=footer.querySelector('#help');if(help){const copy=help.cloneNode(true);copy.removeAttribute('id');copy.className='astro-nav-dialog-link';copy.addEventListener('click',()=>{dialog.close();help.click();});list.append(copy);}dialog.showModal();});
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(mobile.matches)more.focus();else toggle.focus();});
  dialog.addEventListener('click',event=>{if(event.target.closest('a'))dialog.close();else if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  new MutationObserver(schedule).observe(nav,{childList:true});
  new ResizeObserver(schedule).observe(sidebar);
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('pageshow',schedule);
  document.addEventListener('astrolearn:preferences',schedule);
  motion.addEventListener('change',schedule);
  mobile.addEventListener('change',()=>{if(!mobile.matches&&dialog.open)dialog.close();hideTooltip();schedule();});
  document.fonts?.ready.then(schedule);
  apply();update();
})();
