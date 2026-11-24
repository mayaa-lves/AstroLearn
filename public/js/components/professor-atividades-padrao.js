/* Presentation only: controls, names, files and original submit handlers are retained. */
(() => {
 const page=document.body.dataset.page;if(!['activities','activity','create'].includes(page))return;
 document.body.classList.add('activities-polished');
 const content=document.getElementById('content'),actions=document.getElementById('pageActions'),dialog=document.getElementById('actionDialog');
 const svg=path=>{const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('viewBox','0 0 24 24');el.setAttribute('aria-hidden','true');const line=document.createElementNS(el.namespaceURI,'path');line.setAttribute('d',path);el.append(line);return el;};
 const paths={save:'M5 3h12l4 4v14H3V3ZM7 3v6h10V3M7 21v-8h10v8',preview:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',publish:'m3 11 18-8-8 18-2-8ZM11 13l10-10',upload:'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6'};
 function enhance(){
  if(page==='activities'&&!actions.querySelector('.activities-room-back')){
   const params=new URLSearchParams(location.search);if(params.get('sala')){const link=document.createElement('a'),url=new URL('turma.html',location.href);url.searchParams.set('sala',params.get('sala'));if(params.get('periodo'))url.searchParams.set('periodo',params.get('periodo'));link.href=url.href;link.textContent='Voltar à sala';link.className='secondary activities-room-back';actions.append(link);}
  }
  const form=document.getElementById('missionForm');
  if(form){
   for(const label of form.querySelectorAll('label[for]')){
    const input=document.getElementById(label.htmlFor);if(!input||label.closest('.activity-field')||label.nextElementSibling!==input)continue;
    const field=document.createElement('div');field.className='activity-field';label.before(field);field.append(label,input);
   }
   const input=form.querySelector('input[type=file]');
   if(input&&!input.closest('.activity-upload-zone')){
    const zone=document.createElement('div');zone.className='activity-upload-zone';const copy=document.createElement('div'),caption=document.createElement('strong'),name=document.createElement('span');
    caption.textContent='Escolher arquivo ou arrastar para cá';name.className='activity-upload-name';name.setAttribute('aria-live','polite');copy.append(caption,name);input.before(zone);zone.append(svg(paths.upload),copy,input);
    zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('is-dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('is-dragging'));
    zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('is-dragging');if(event.dataTransfer.files.length!==1)return;try{const transfer=new DataTransfer();transfer.items.add(event.dataTransfer.files[0]);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));}catch{input.focus();}});
   }
   const save=document.getElementById('saveDraft'),publish=document.getElementById('publishMission');if(save&&publish){save.classList.toggle('primary',publish.hidden);save.classList.toggle('secondary',!publish.hidden);}
   const name=form.querySelector('.activity-upload-name'),text=input?.files[0]?.name||'Nenhum novo arquivo selecionado';if(name&&name.textContent!==text)name.textContent=text;
   for(const [id,key]of [['saveDraft','save'],['previewMission','preview'],['publishMission','publish']]){const button=document.getElementById(id);if(button&&!button.querySelector('svg')){const label=document.createElement('span');label.textContent=button.textContent;button.replaceChildren(svg(paths[key]),label);}}
  }
  const body=document.getElementById('dialogContent');
  const proposal=body?.firstElementChild;
  if(page==='create'&&proposal&&document.getElementById('dialogTitle').textContent==='Tudo pronto para compartilhar?'&&!proposal.querySelector('.activity-dialog-actions')){
   const publish=proposal.querySelector('button.primary');if(publish){const row=document.createElement('div');row.className='activity-dialog-actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Continuar editando';cancel.onclick=()=>{if(!document.getElementById('closeDialog').disabled)dialog.close();};publish.prepend(svg(paths.publish));row.append(cancel,publish);proposal.append(row);}
  }
 }
 let queued=false;const schedule=()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;enhance();});}};
 for(const target of [content,actions,dialog])if(target)new MutationObserver(schedule).observe(target,{childList:true,subtree:true});
 enhance();
})();
