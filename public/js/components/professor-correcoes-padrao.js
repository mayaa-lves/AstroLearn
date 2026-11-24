/* Presentation only. The original save, preview and draft recovery handlers remain. */
(() => {
 const page=document.body.dataset.page;if(!['corrections','review','student'].includes(page))return;
 document.body.classList.add('corrections-polished');
 const content=document.getElementById('content'),actions=document.getElementById('pageActions'),params=new URLSearchParams(location.search);
 const svg=path=>{const node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.setAttribute('viewBox','0 0 24 24');node.setAttribute('aria-hidden','true');const line=document.createElementNS(node.namespaceURI,'path');line.setAttribute('d',path);node.append(line);return node;};
 const paths={search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',history:'M5 4h14v17H5ZM8 8h8m-8 4h8m-8 4h5',save:'M5 3h12l4 4v14H3V3ZM7 3v6h10V3M7 21v-8h10v8',check:'m5 12 4 4 10-10'};
 function enhance(){
  if((page==='corrections'||(page==='student'&&!params.get('entrega')))&&params.get('sala')&&!actions.querySelector('.corrections-room-back')){
   const back=document.createElement('a'),url=new URL('turma.html',location.href);url.searchParams.set('sala',params.get('sala'));if(params.get('periodo'))url.searchParams.set('periodo',params.get('periodo'));back.href=url.href;back.className='secondary corrections-room-back';back.textContent='Voltar à sala';actions.append(back);
  }
  if(page==='corrections'){
   const input=content.querySelector('.filters input[type=search]');
   if(input&&!input.closest('.correction-search')){const search=document.createElement('div');search.className='correction-search';input.before(search);search.append(svg(paths.search),input);}
  }
  if(page!=='review')return;
  const form=document.getElementById('reviewForm');
  if(form){
   for(const label of form.querySelectorAll('label[for]')){
    const input=document.getElementById(label.htmlFor);if(!input||label.closest('.correction-field')||label.nextElementSibling!==input)continue;
    const field=document.createElement('div');field.className='correction-field';label.before(field);field.append(label,input);
   }
   const save=form.querySelector('button[type=submit]');
   if(save&&!save.querySelector('svg')){const text=document.createElement('span');text.textContent=save.textContent;save.replaceChildren(svg(save.textContent==='Correção registrada'?paths.check:paths.save),text);}
  }
  const history=[...actions.querySelectorAll('a')].find(link=>new URL(link.href,location.href).pathname.endsWith('/aluno.html'));
  if(history&&!history.classList.contains('correction-history-link')){history.classList.add('correction-history-link');const text=document.createElement('span');text.textContent=history.textContent;history.replaceChildren(svg(paths.history),text);}
  for(const row of content.querySelectorAll('.review-file')){
   if(row.querySelector('.review-file-controls'))continue;
   const controls=[...row.children].filter(node=>node.matches('a,button'));if(!controls.length)continue;
   const group=document.createElement('div');group.className='review-file-controls';group.append(...controls);row.append(group);
  }
 }
 let queued=false;const schedule=()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;enhance();});}};
 for(const target of [content,actions])if(target)new MutationObserver(schedule).observe(target,{childList:true,subtree:true});
 enhance();
})();
