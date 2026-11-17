(() => {
 if(document.body.dataset.page!=='activities')return;
 document.body.classList.add('teacher-activities-page');
 const actions=document.getElementById('pageActions'),content=document.getElementById('content');if(!actions||!content)return;
 const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
 let queued=false;
 function enhance(){
  queued=false;
  const create=[...actions.querySelectorAll('a')].find(a=>new URL(a.href,location.href).pathname.endsWith('/editor-atividade.html'));
  if(create&&!create.classList.contains('activity-create')){create.classList.add('activity-create');create.setAttribute('aria-label','Criar atividade');create.innerHTML=icon('M12 5v14M5 12h14')+'<span>Criar atividade</span>';}
  const state=[...actions.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.value==='rascunho'));
  let filter=actions.querySelector('.activity-filter');
  if(state&&!filter){
   filter=document.createElement('div');filter.className='activity-filter';
   const trigger=document.createElement('button');trigger.type='button';trigger.className='activity-filter-trigger';trigger.innerHTML=icon('M3 5h18l-7 8v6l-4 2v-8Z');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','activityFilterOptions');
   const popup=document.createElement('div');popup.id='activityFilterOptions';popup.className='activity-filter-options';popup.hidden=true;popup.setAttribute('role','group');popup.setAttribute('aria-label','Situação da atividade');
   function open(value){popup.hidden=!value;trigger.setAttribute('aria-expanded',String(value));}
   function sync(){for(const b of popup.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.value===state.value));const label=state.options[state.selectedIndex]?.textContent||'Todas as atividades';trigger.setAttribute('aria-label','Filtrar atividades: '+label);trigger.dataset.filtered=String(!!state.value);}
   for(const option of state.options){const b=document.createElement('button');b.type='button';b.textContent=option.textContent;b.dataset.value=option.value;b.onclick=()=>{state.value=option.value;state.dispatchEvent(new Event('change',{bubbles:true}));sync();open(false);trigger.focus();};popup.append(b);}
   state.before(filter);state.hidden=true;filter.append(trigger,popup,state);sync();state.addEventListener('change',sync);
   trigger.onclick=()=>open(popup.hidden);
   trigger.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();open(true);popup.querySelector('button')?.focus();}};
   filter.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')open(true);});
   filter.addEventListener('pointerleave',()=>{if(!filter.contains(document.activeElement))open(false);});
   filter.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!filter.contains(document.activeElement))open(false);});});
   filter.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();open(false);trigger.focus();}});
   // One document handler, with no retained references to replaced filters.
  }
  const semester=[...actions.querySelectorAll('select')].find(s=>s!==state);
  if(semester){semester.setAttribute('aria-label','Filtrar por semestre');const all=[...semester.options].find(o=>o.value==='');if(all&&all.textContent!=='Todos os semestres')all.textContent='Todos os semestres';}
  [create,filter,semester].filter(Boolean).forEach((node,index)=>{if(actions.children[index]!==node)actions.insertBefore(node,actions.children[index]||null);});
  content.querySelectorAll('.list-card').forEach(card=>{const draft=card.querySelector('.badge')?.textContent.trim()==='Rascunho';card.dataset.activityState=draft?'draft':'published';});
 }
 function schedule(){if(!queued){queued=true;queueMicrotask(enhance);}}
 const observer=new MutationObserver(schedule);observer.observe(actions,{childList:true,subtree:true});observer.observe(content,{childList:true,subtree:true});
 document.addEventListener('pointerdown',event=>{const f=actions.querySelector('.activity-filter');if(f&&!f.contains(event.target)){f.querySelector('.activity-filter-options').hidden=true;f.querySelector('button').setAttribute('aria-expanded','false');}});
 enhance();
})();
