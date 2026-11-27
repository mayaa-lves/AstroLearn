/* Rótulos reais dentro dos atalhos: mantém os elementos e seus eventos. */
export function expandirAcoes(root=document) {
 const known='.room-quick-action,.activity-create,.detail-shortcut,.team-delete-button,.integration-room-delete,.room-delete,.room-invite,.correction-file-action,.mesa-fullscreen,.activity-filter-trigger,.correction-filter-trigger,.questions-filter-trigger,.library-filter-trigger,.material-actions a,.material-actions button';
 for(const control of root.querySelectorAll('main a,main button,main summary,dialog .material-actions a,dialog .material-actions button,#teacherTools>a.teacher-circle,#teacherTools>button.teacher-circle:not(.teacher-profile)')){
  if(control.matches('.qc-icon,.qc-filter-trigger,.room-copy,.room-search-toggle,.room-student-search button,.activity-filter-trigger,.correction-filter-trigger,.questions-filter-trigger,.library-filter-trigger')){control.classList.remove('astro-expand-action');control.querySelectorAll(':scope > .astro-action-label').forEach(label=>label.remove());continue;}
  if(control.matches('.mesa-attachment-tab')){control.classList.remove('astro-expand-action');control.querySelector('.astro-action-label')?.classList.remove('astro-action-label');continue;}
  if(control.closest('.sidebar')||control.matches('.teacher-return,[type="submit"],.close,[aria-label^="Fechar"]'))continue;
  const glyph=control.querySelector(':scope > svg');if(!glyph)continue;
  const directText=[...control.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
  const named=control.hasAttribute('aria-label')||control.hasAttribute('title')||control.hasAttribute('data-tooltip');
  if(!control.matches(known)&&(!named||directText))continue;
  const raw=(control.getAttribute('data-tooltip')||control.getAttribute('title')||control.getAttribute('aria-label')||control.textContent||'').trim();
  if(!raw)continue;
  let text=raw.replace(/^[＋+←→\s]+/,'');
  if(control.matches('.integration-room-delete,.room-delete'))text='Excluir turma';
  if(control.closest('#teacherTools'))text=control.tagName==='A'?'Início':'Notificações';
  if(control.matches('[class*="filter-trigger"]'))text=text.split(':')[0];
  let label=control.querySelector(':scope > .astro-action-label');
  if(!label){
   label=[...control.children].find(el=>el.tagName==='SPAN'&&!el.matches('.badge,.teacher-count,[role="status"],[aria-live]'));
   if(!label){label=document.createElement('span');control.append(label);}
   label.classList.add('astro-action-label');label.setAttribute('aria-hidden','true');
  }
  if(label.textContent!==text)label.textContent=text;
  if(!control.hasAttribute('aria-label')||control.dataset.astroAutoLabel==='true'){
   if(control.getAttribute('aria-label')!==raw)control.setAttribute('aria-label',raw);
   control.dataset.astroAutoLabel='true';
  }
  control.classList.add('astro-expand-action');
  // Evita somar o tooltip nativo ao rótulo que já se abre no botão.
  if(control.hasAttribute('title'))control.removeAttribute('title');
 }
}
if(location.pathname.includes('/professor/')){
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../css/professor-acoes-expansiveis.css?v=2',import.meta.url).href;document.head.append(css);
 let frame=0;
 const update=()=>{frame=0;expandirAcoes();};
 new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(update);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-label','title','data-tooltip']});
 update();
}
