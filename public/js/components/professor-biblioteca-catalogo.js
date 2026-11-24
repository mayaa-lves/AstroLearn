/* The native select remains the source of truth for the data-loading code. */
(() => {
 const select=document.getElementById('materialStatus');
 if(select){
  const filter=document.createElement('details');filter.className='library-filter';
  const trigger=document.createElement('summary');trigger.className='library-filter-trigger';trigger.setAttribute('aria-label','Filtrar materiais');trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="9" cy="18" r="2" fill="currentColor"/></svg>';
  const menu=document.createElement('div');menu.className='library-filter-options';menu.id='libraryFilterOptions';menu.setAttribute('role','menu');menu.setAttribute('aria-label','Exibir materiais');trigger.setAttribute('aria-controls',menu.id);
  for(const option of select.options){const choice=document.createElement('button');choice.type='button';choice.textContent=option.textContent;choice.dataset.value=option.value;choice.setAttribute('role','menuitemradio');choice.setAttribute('aria-checked',String(select.value===option.value));choice.onclick=()=>{if(select.value!==option.value){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));}sync();filter.open=false;trigger.focus();};menu.append(choice);}
  function sync(){for(const choice of menu.children)choice.setAttribute('aria-checked',String(choice.dataset.value===select.value));trigger.setAttribute('aria-label','Filtrar materiais: '+select.selectedOptions[0].textContent);}
  filter.append(trigger,menu);select.after(filter);select.hidden=true;
  filter.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(filter.open)));
  filter.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')filter.open=true;});
  let leaveTimer;filter.addEventListener('pointerleave',()=>{clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(!filter.contains(document.activeElement))filter.open=false;},140);});filter.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  filter.addEventListener('keydown',event=>{const choices=[...menu.children],index=choices.indexOf(document.activeElement);if(event.key==='Escape'){event.preventDefault();filter.open=false;trigger.focus();}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();filter.open=true;choices[(index+(event.key==='ArrowDown'?1:-1)+choices.length)%choices.length]?.focus();}});
  filter.addEventListener('focusout',()=>queueMicrotask(()=>{if(!filter.contains(document.activeElement))filter.open=false;}));
  document.addEventListener('pointerdown',event=>{if(!filter.contains(event.target))filter.open=false;});select.addEventListener('change',sync);sync();
 }
 const input=document.getElementById('search');document.querySelector('.library-search-toggle')?.addEventListener('click',()=>input?.focus());
 input?.addEventListener('keydown',event=>{if(event.key==='Escape'){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}});
})();
