/* Cabeçalho e navegação exclusivos do professor. Não modifica os componentes do aluno. */
import {obterSessao} from '../services/autenticacao.js';
import {notificacoes,lerNotificacoes,destinoNotificacao} from '../services/comunicacao.js';
import {encerrar} from '../services/conexao.js';

if(location.pathname.includes('/professor/')&&!document.getElementById('teacherTools')) iniciar();
function iniciar(){
 document.documentElement.classList.add('astro-professor');
 // Troca apenas a apresentação: IDs, valores de inputs, parâmetros e objetos da API permanecem intactos.
 const semestre=text=>text.replace(/\bperíodos?\b/giu,word=>{const plural=word.toLowerCase().endsWith('s');const replacement=plural?'semestres':'semestre';return word===word.toUpperCase()?replacement.toUpperCase():word[0]===word[0].toUpperCase()?replacement[0].toUpperCase()+replacement.slice(1):replacement;});
 const skip='script,style,textarea,input,code,pre,[contenteditable="true"]';
 function labels(node){
   if(node.nodeType===3){if(node.parentElement&&!node.parentElement.closest(skip)){const next=semestre(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}return;}
   if(node.nodeType!==1||node.matches(skip))return;
   for(const attr of ['aria-label','title','placeholder']){const value=node.getAttribute(attr);if(value){const next=semestre(value);if(next!==value)node.setAttribute(attr,next);}}
   for(const child of node.childNodes)labels(child);
 }
 labels(document.body);
 const labelObserver=new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')labels(record.target);else for(const node of record.addedNodes)labels(node);}});
 labelObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../css/professor-padrao.css?v=2',import.meta.url).href;document.head.append(css);
 const make=(tag,text='',className='')=>{const el=document.createElement(tag);el.textContent=text;el.className=className;return el;};
 const refreshIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></svg>';
 const tools=make('div','','');tools.id='teacherTools';tools.setAttribute('aria-label','Navegação e conta do professor');
 const home=make('a','','teacher-circle');home.href='home.html';home.setAttribute('aria-label','Início — Turmas');home.title='Início';
 home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/></svg>';
 const bell=make('button','','teacher-circle');bell.type='button';bell.title='Notificações';bell.setAttribute('aria-label','Notificações');
 bell.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4"/></svg>';
 const badge=make('span','','teacher-count');badge.hidden=true;bell.append(badge);
 const user=obterSessao()?.usuario||{};
 const profile=make('button',(user.nome||'Professor').trim().charAt(0).toUpperCase(),'teacher-circle teacher-profile');profile.type='button';profile.title='Perfil';profile.setAttribute('aria-label','Perfil e configurações');
 function panel(id,title,trigger){const el=make('section','','teacher-panel');el.id=id;el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-labelledby',id+'Title');const header=make('header');const h=make('h2',title);h.id=id+'Title';const close=make('button','×','teacher-close');close.type='button';close.setAttribute('aria-label','Fechar '+title.toLowerCase());header.append(h,close);el.append(header);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-haspopup','dialog');close.onclick=()=>{open(el,false);trigger.focus();};trigger.onclick=()=>{open(el,el.hidden);if(!el.hidden)close.focus();};return el;}
 const notices=panel('teacherNoticePanel','Notificações',bell),account=panel('teacherProfilePanel','Sua conta',profile);
 function open(el,value){for(const [p,t]of [[notices,bell],[account,profile]]){p.hidden=!(p===el&&value);t.setAttribute('aria-expanded',String(!p.hidden));}if(value&&el===notices)load();}
 tools.append(home,bell,profile,notices,account);document.body.append(tools);
 document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target))open(notices,false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(!notices.hidden||!account.hidden)){const trigger=notices.hidden?profile:bell;open(notices,false);trigger.focus();}});
 tools.addEventListener('focusout',()=>{setTimeout(()=>{if(!tools.contains(document.activeElement))open(notices,false);},0);});
 const person=make('div','','teacher-person');const avatar=make('span',profile.textContent,'teacher-person-avatar');avatar.setAttribute('aria-hidden','true');const identity=make('div');identity.append(make('strong',user.nome||'Professor'),make('p',user.email||''),make('small','Perfil de professor'));person.append(avatar,identity);account.append(person);
 const preferences=make('button','Preferências →','teacher-account-link');preferences.type='button';preferences.setAttribute('aria-expanded','false');preferences.setAttribute('aria-controls','teacherPreferences');account.append(preferences);
 const settings=make('section','','teacher-preferences');settings.id='teacherPreferences';settings.hidden=true;settings.append(make('h3','Preferências'));account.append(settings);preferences.onclick=()=>{settings.hidden=!settings.hidden;preferences.setAttribute('aria-expanded',String(!settings.hidden));};
 const soundLabel=make('label','','teacher-setting'),sound=make('input');sound.type='checkbox';sound.id='teacherSound';soundLabel.append(sound,document.createTextNode('Som das notificações'));settings.append(soundLabel);
 const soundStatus=make('p','','teacher-status');soundStatus.setAttribute('role','status');settings.append(soundStatus);
 const key='astrolearn-som-notificacoes';const syncSound=()=>{try{sound.checked=localStorage.getItem(key)!=='off';}catch{sound.checked=true;}};syncSound();
 sound.onchange=()=>{try{localStorage.setItem(key,sound.checked?'on':'off');soundStatus.textContent='Preferência salva neste navegador.';}catch{soundStatus.textContent='Não foi possível salvar a preferência.';syncSound();}};
 window.addEventListener('storage',e=>{if(e.key===key)syncSound();});
 const actions=make('div','','teacher-actions');let filter='all';const all=make('button','Todas'),unread=make('button','Não lidas'),refresh=make('button','Atualizar'),markAll=make('button','Marcar carregadas como lidas');
 for(const b of [all,unread,refresh,markAll])b.type='button';all.setAttribute('aria-pressed','true');unread.setAttribute('aria-pressed','false');actions.classList.add('teacher-filters');actions.append(all,unread);refresh.innerHTML=refreshIcon;refresh.className='teacher-icon-action';refresh.setAttribute('aria-label','Atualizar notificações');refresh.title='Atualizar notificações';const panelHeader=notices.querySelector('header');const headerActions=make('div','','teacher-header-actions');headerActions.append(refresh,panelHeader.querySelector('.teacher-close'));panelHeader.append(headerActions);markAll.className='teacher-mark-all';
 const status=make('p','Carregando avisos…','teacher-status');status.setAttribute('role','status');const feed=make('div','','teacher-feed');const full=make('a','Ver todos os avisos →');full.href='notificacoes.html';const summary=make('div','','teacher-notice-summary');summary.append(status,markAll);const bottom=make('footer','','teacher-notice-footer');bottom.append(full);notices.append(actions,summary,feed,bottom);
 let rows=[],busy=false,mutating=false;
 function counters(){const count=rows.filter(n=>!n.lida_em&&n.lida!==true).length;badge.textContent=count>99?'99+':String(count);badge.hidden=!count;bell.setAttribute('aria-label',`Notificações: ${count} não lidas`);markAll.disabled=mutating||busy||!count;}
 function category(n){
  const type=String(n.tipo||n.type||'').toLowerCase();const link=String(n.link||'');const title=String(n.titulo||'').toLowerCase();
  if(type.includes('pergunta')||type.includes('duvida')||link.includes('/perguntas')||title.includes('dúvida'))return {key:'question',label:'Dúvida',action:'Ver dúvida'};
  if(type.includes('biblioteca')||type.includes('material')||link.includes('/biblioteca')||title.includes('material'))return {key:'material',label:'Material',action:'Ver material'};
  if(type.includes('correcao')||title.includes('corrigid'))return {key:'result',label:'Resultado',action:'Ver resultado'};
  if(type.includes('entrega')||title.includes('entrega'))return {key:'delivery',label:'Entrega',action:'Ver entrega'};
  if(type.includes('tarefa')||link.includes('/tarefas'))return {key:'task',label:'Tarefa',action:'Ver tarefa'};
  return {key:'info',label:'Informação',action:'Abrir aviso'};
 }
 function render(){feed.replaceChildren();counters();const shown=rows.filter(n=>filter==='all'||(!n.lida_em&&n.lida!==true));if(!shown.length)feed.append(make('p',filter==='all'?'Sua caixa de avisos está vazia.':'Você está em dia. Nenhum aviso não lido.','teacher-empty'));
 for(const n of shown){const isUnread=!n.lida_em&&n.lida!==true;const kind=category(n);const article=make('article','','teacher-notice-card'+(isUnread?' unread':''));article.dataset.category=kind.key;const meta=make('div','','teacher-card-meta');meta.append(make('span',kind.label,'teacher-category'),make('span',isUnread?'Não lida':'Lida','teacher-read-state'));article.append(meta,make('h3',n.titulo||'Aviso'),make('p',n.mensagem||''));const date=new Date(n.criado_em);if(!Number.isNaN(date.getTime())){const time=make('time',date.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}));time.dateTime=date.toISOString();article.append(time);}const controls=make('div','','teacher-actions');const target=destinoNotificacao(n,'professor');if(target){const a=make('a',kind.action+' →');a.href=target;controls.append(a);}if(isUnread){const read=make('button','Marcar como lida');read.type='button';read.disabled=mutating||busy;read.onclick=()=>mark([n.id]);controls.append(read);}article.append(controls);feed.append(article);}}
 async function load(){if(busy||document.hidden||mutating)return;busy=true;refresh.disabled=true;try{const data=await notificacoes();rows=data.notificacoes||[];render();status.textContent='Atualizado agora.';}catch(e){status.textContent=e.message||'Não foi possível carregar os avisos. Tente atualizar.';badge.hidden=true;bell.setAttribute('aria-label','Notificações — consulta indisponível');if(!rows.length)feed.replaceChildren(make('p','Não foi possível consultar os avisos.'));}finally{busy=false;refresh.disabled=false;counters();feed.querySelectorAll('button').forEach(b=>b.disabled=mutating);}}
 async function mark(ids){if(mutating||busy||!ids.length)return;mutating=true;render();try{await lerNotificacoes(ids);rows=rows.map(n=>ids.includes(n.id)?{...n,lida:true,lida_em:new Date().toISOString()}:n);status.textContent='Leitura salva.';}catch(e){status.textContent=e.message||'Não foi possível salvar a leitura.';}finally{mutating=false;render();}window.dispatchEvent(new Event('astro-notifications-refresh'));}
 all.onclick=()=>{filter='all';all.setAttribute('aria-pressed','true');unread.setAttribute('aria-pressed','false');render();};unread.onclick=()=>{filter='unread';all.setAttribute('aria-pressed','false');unread.setAttribute('aria-pressed','true');render();};refresh.onclick=load;markAll.onclick=()=>mark(rows.filter(n=>!n.lida_em&&n.lida!==true).map(n=>n.id));
 // O componente compartilhado continua responsável pelos itens de navegação da sala.
 const sidebar=document.querySelector('.sidebar');
 if(sidebar){let footer=sidebar.querySelector('.astro-nav-footer');if(!footer){footer=make('div','','astro-nav-footer');sidebar.append(footer);}let help=sidebar.querySelector('#help');if(!help){help=make('button','Ajuda','text-button');help.id='help';help.type='button';const d=make('dialog','','teacher-help');d.append(make('h2','Ajuda'),make('p','Comece em Turmas, abra uma sala e use o menu para acessar atividades, equipes, correções e dúvidas. O sino reúne seus avisos; no Perfil você controla o som.'));const close=make('button','Fechar');close.onclick=()=>d.close();d.append(close);document.body.append(d);help.onclick=()=>d.showModal();}
 let exit=sidebar.querySelector('#exit,#logout')||make('a');exit.href='../auth/login.html';exit.id=exit.id||'exit';const label=exit.querySelector('.label');if(label)label.textContent='Sair';else exit.textContent='Sair';exit.setAttribute('aria-label','Sair');
 if(help.parentElement!==footer)footer.append(help);if(exit.parentElement!==footer)footer.append(exit);
 const pageRefresh=document.querySelector('.teacher-top #refresh');
 if(pageRefresh){pageRefresh.innerHTML=refreshIcon;pageRefresh.type='button';pageRefresh.className='teacher-footer-refresh';pageRefresh.setAttribute('aria-label','Atualizar página');pageRefresh.title='Atualizar página';exit.classList.add('teacher-footer-exit');footer.classList.add('teacher-footer-with-refresh');footer.insertBefore(pageRefresh,exit);
 document.addEventListener('click',e=>{if(!e.target.closest('.astro-nav-more'))return;const mobile=document.querySelector('#menu-mobile-dialog nav');if(!mobile||mobile.querySelector('[data-teacher-refresh]'))return;const button=make('button','Atualizar página','astro-nav-dialog-link');button.type='button';button.dataset.teacherRefresh='';button.onclick=()=>{document.getElementById('menu-mobile-dialog').close();pageRefresh.click();};mobile.append(button);});
 }

 // Links de logout existentes são interceptados pelo fluxo de sessão; fallback para páginas sem ele.
 const sharedSession=!!document.querySelector('script[src*="components/sessao.js"]');
 exit.onclick=e=>{e.preventDefault();if(!sharedSession)encerrar();};
 }
 const interval=setInterval(load,30000);window.addEventListener('astro-notifications-refresh',load);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});window.addEventListener('pagehide',e=>{if(!e.persisted)clearInterval(interval);});load();
}
