/* Progressive enhancement of the real semester filter and per-student actions. */
if(document.body.dataset.page==='room'){
 const actions=document.getElementById('pageActions');
 const make=(tag,text='',className='')=>{const el=document.createElement(tag);el.textContent=text;el.className=className;return el;};
 let closeMenu=()=>{},studentPopup=null;
 function enhance(){
  const select=actions?.querySelector('select');if(!select||select.closest('.room-semester-control'))return;
  const control=make('div','','room-semester-control'),trigger=make('button','','room-semester-trigger'),menu=make('div','','room-semester-menu');
  trigger.type='button';trigger.textContent=select.selectedOptions[0]?.textContent||'Todos os semestres';trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
  menu.id='roomSemesterOptions';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Semestres da turma');trigger.setAttribute('aria-controls',menu.id);
  const setOpen=value=>{menu.hidden=!value;trigger.setAttribute('aria-expanded',String(value));};closeMenu=()=>setOpen(false);
  for(const option of select.options){const item=make('button',option.textContent);item.type='button';item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked',String(option.value===select.value));item.onclick=()=>{setOpen(false);if(select.value===option.value)return;select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));};menu.append(item);}
  for(const [op,label,className]of [['create-semester','＋ Criar semestre','room-semester-create'],['manage-semesters','⚙ Gerenciar semestres','room-semester-manage-action']]){const item=make('button',label,className);item.type='button';item.dataset.roomOperation=op;item.setAttribute('role','menuitem');item.addEventListener('click',()=>setOpen(false));menu.append(item);}
  trigger.onclick=()=>setOpen(menu.hidden);
  control.addEventListener('keydown',event=>{
   const items=[...menu.querySelectorAll('button')],index=items.indexOf(document.activeElement);
   if(event.key==='Escape'){setOpen(false);trigger.focus();event.preventDefault();}
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}
  });
  control.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!control.contains(document.activeElement))setOpen(false);});});
  select.before(control);select.hidden=true;select.tabIndex=-1;control.append(select,trigger,menu);
 }
 if(actions){new MutationObserver(enhance).observe(actions,{childList:true,subtree:true});enhance();}
 const dismissStudent=()=>{if(!studentPopup)return;studentPopup.trigger.setAttribute('aria-expanded','false');studentPopup.box.remove();studentPopup=null;};
 document.addEventListener('click',event=>{
  if(!event.target.closest('.room-semester-control'))closeMenu();
  const trigger=event.target.closest('.room-student-more');
  if(!trigger){if(!event.target.closest('.room-student-popup'))dismissStudent();return;}
  const same=studentPopup?.trigger===trigger;dismissStudent();if(same)return;
  const box=make('div','','room-student-popup');box.setAttribute('role','menu');box.setAttribute('aria-label','Opções de '+trigger.dataset.studentName);
  const history=make('a','Ver acompanhamento');const url=new URL('aluno.html',location.href);url.searchParams.set('sala',new URLSearchParams(location.search).get('sala'));url.searchParams.set('aluno',trigger.dataset.studentId);history.href=url.href;history.setAttribute('role','menuitem');
  const remove=make('button','Remover da turma','integration-danger');remove.type='button';remove.dataset.roomOperation='remove-student';remove.dataset.studentId=trigger.dataset.studentId;remove.dataset.studentName=trigger.dataset.studentName;remove.setAttribute('role','menuitem');
  box.append(history,remove);document.body.append(box);const rect=trigger.getBoundingClientRect();box.style.left=Math.max(12,Math.min(innerWidth-box.offsetWidth-12,rect.right-box.offsetWidth))+'px';box.style.top=Math.max(12,Math.min(innerHeight-box.offsetHeight-12,rect.bottom+5))+'px';
  studentPopup={box,trigger};trigger.setAttribute('aria-expanded','true');history.focus();
  box.addEventListener('click',()=>{queueMicrotask(dismissStudent);});
  box.addEventListener('keydown',event=>{if(event.key==='Escape'){dismissStudent();trigger.focus();event.preventDefault();}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();(document.activeElement===history?remove:history).focus();}});
 });
 document.addEventListener('keydown',event=>{if(event.key==='Tab')setTimeout(()=>{if(studentPopup&&!studentPopup.box.contains(document.activeElement))dismissStudent();},0);});
 window.addEventListener('resize',dismissStudent);window.addEventListener('scroll',dismissStudent,{capture:true,passive:true});
}
