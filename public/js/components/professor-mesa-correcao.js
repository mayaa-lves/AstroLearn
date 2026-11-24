/* Mesa de correção: rearranges real controls and uses authenticated response data. */
(() => {
 const page=document.body.dataset.page;if(!['review','corrections'].includes(page))return;
 document.body.classList.add('mesa-correction-page');
 const content=document.getElementById('content'),actions=document.getElementById('pageActions'),params=new URLSearchParams(location.search);
 const ids=['lilas-astronauta','verde-cientista','azul-artista','turquesa-leitor','lilas-engenheiro','verde-astronauta','azul-explorador','turquesa-astronauta'];
 const make=(tag,text='',cls='')=>{const node=document.createElement(tag);node.textContent=text;node.className=cls;return node;};
 const icon=path=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('d',path);svg.append(line);return svg;};
 const paths={file:'M5 2h9l5 5v15H5ZM14 2v6h5M8 12h8m-8 4h6',pen:'m4 16 12-12 4 4L8 20H4ZM13 7l4 4',full:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5'};
 function avatar(node,person){
  const name=person.nome||'Aluno',index=ids.indexOf(person.avatar_id),signature=name+'|'+(index<0?'initials':index);
  if(node.dataset.avatarSignature===signature)return;
  node.dataset.avatarSignature=signature;node.setAttribute('role','img');node.setAttribute('aria-label',index<0?'Perfil de '+name:'Foto de perfil de '+name);
  node.classList.toggle('has-chosen-avatar',index>=0);
  if(index>=0){node.textContent='';node.style.setProperty('--student-avatar-position',`${index%4*100/3}% ${index<4?0:100}%`);}
  else{node.textContent=name.trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase();node.style.removeProperty('--student-avatar-position');}
 }
 function dataForDelivery(id){
  const room=window.TeacherData?.viewRoom;if(!room)return null;
  const delivery=String(window.TeacherData.viewDelivery?.id)===String(id)?window.TeacherData.viewDelivery:room.entregas?.find(item=>String(item.id)===String(id));
  if(!delivery)return null;
  const person=room.alunos?.find(item=>String(item.id)===String(delivery.aluno_id||delivery.perfis?.id));
  const profile={...person,...delivery.perfis};profile.avatar_id=delivery.perfis?.avatar_id??person?.avatar_id;
  const activity=room.missoes?.find(item=>String(item.id)===String(delivery.missao_id||delivery.missoes?.id));
  return {room,delivery,profile,activity};
 }
 function list(){
  const panel=content.querySelector(':scope>.panel'),table=panel?.querySelector('table');if(!panel||!table)return;
  panel.classList.add('mesa-list-panel');
  const filters=panel.querySelector('.filters')||content.querySelector(':scope>.filters');
  if(filters){if(filters.parentElement===panel)panel.before(filters);filters.classList.add('mesa-list-toolbar');const semester=actions.querySelector('select');if(semester){semester.classList.add('mesa-semester');filters.append(semester);}}
  const subtitle=document.getElementById('pageSubtitle');const copy='Acompanhe as entregas e devolva o próximo passo.';if(subtitle.textContent!==copy)subtitle.textContent=copy;
  for(const row of table.querySelectorAll('tbody tr')){
   const link=row.cells[4]?.querySelector('a');if(!link)continue;
   const detail=dataForDelivery(new URL(link.href,location.href).searchParams.get('entrega'));
   const cell=row.cells[0];let person=cell.querySelector('.mesa-table-person');
   if(!person){person=make('span','','mesa-table-person');person.append(make('span','','mesa-student-avatar'),make('span',cell.textContent,'mesa-student-name'));cell.replaceChildren(person);}
   avatar(person.firstElementChild,{...detail?.profile,nome:detail?.profile?.nome||person.lastElementChild.textContent});
  }
  let count=content.querySelector('.mesa-list-count');if(!count){count=make('p','','mesa-list-count');panel.after(count);}
  const total=table.querySelectorAll('tbody tr').length,searched=!!filters?.querySelector('input')?.value.trim(),text=`${total} ${total===1?'entrega':'entregas'} ${searched?'encontradas':'nesta turma'}`;
  if(count.textContent!==text)count.textContent=text;
 }
 function review(){
  const grid=content.querySelector('.review-grid'),detail=dataForDelivery(params.get('entrega'));if(!grid||!detail)return;
  const {profile,activity,delivery}=detail;
  let strip=content.querySelector('.mesa-identity');
  if(!strip){
   strip=make('section','','mesa-identity');strip.setAttribute('aria-label','Aluno e atividade desta entrega');
   const portrait=make('span','','mesa-student-avatar'),identity=make('div','','mesa-identity-name');identity.append(make('strong',profile.nome||'Aluno'),make('span','Atividade · '+(activity?.titulo||delivery.missoes?.titulo||'Atividade')));
   strip.append(portrait,identity);const meta=grid.querySelector('.review-meta');if(meta)strip.append(meta);
   const history=[...actions.querySelectorAll('a')].find(link=>new URL(link.href,location.href).pathname.endsWith('/aluno.html'));if(history){const url=new URL(history.href,location.href);url.searchParams.set('entrega',params.get('entrega'));history.href=url.href;history.classList.add('mesa-history-link');strip.append(history);}
   grid.before(strip);
  }
  avatar(strip.firstElementChild,profile);
  const subtitle=document.getElementById('pageSubtitle'),text='Um retorno claro ajuda a próxima descoberta.';if(subtitle.textContent!==text)subtitle.textContent=text;
  const left=grid.querySelector('.stack'),evaluation=grid.querySelector('.review-evaluation'),work=left?.querySelector('.panel');
  if(work&&!work.classList.contains('mesa-work')){
   work.classList.add('mesa-work');const heading=work.querySelector('h2');heading.textContent='Trabalho enviado';heading.prepend(icon(paths.file));
   const attachments=[...left.children].find(node=>node!==work&&node.matches('.panel'));
   if(attachments){attachments.classList.remove('panel');attachments.classList.add('mesa-attachments');attachments.querySelector('h2')?.classList.add('sr-only');attachments.querySelector(':scope>p')?.classList.add('sr-only');work.append(attachments);}
  }
  if(evaluation&&!evaluation.querySelector('.mesa-feedback-heading')){
   const wrapper=make('aside','','mesa-feedback-stack');evaluation.before(wrapper);wrapper.append(evaluation);
   const heading=make('header','','mesa-feedback-heading'),title=evaluation.querySelector('h2'),intro=evaluation.querySelector(':scope>p');heading.append(icon(paths.pen),title);if(intro)heading.append(intro);evaluation.prepend(heading);
   const help=evaluation.querySelector(':scope>details');if(help){help.classList.add('mesa-feedback-help');wrapper.append(help);}
  }
  for(const row of grid.querySelectorAll('.review-file')){
   const controls=row.querySelector('.review-file-controls'),preview=controls?.querySelector('button');
   if(!preview||!preview.classList.contains('correction-file-action')||!preview.querySelector('span')||preview.classList.contains('mesa-attachment-tab'))continue;
   preview.classList.add('mesa-attachment-tab');const name=row.querySelector('strong')?.textContent||'Arquivo';preview.setAttribute('aria-label','Visualizar '+name);
   const label=preview.querySelector('span');if(label)label.textContent=name;
   controls.prepend(preview);row.classList.add('mesa-has-preview');
  }
  const preview=grid.querySelector('.file-preview');
  if(preview?.requestFullscreen&&!grid.querySelector('.mesa-fullscreen')){
   const button=make('button','','mesa-fullscreen');button.type='button';button.setAttribute('aria-label','Ampliar visualização do anexo');button.title='Ampliar visualização';button.append(icon(paths.full));
   button.onclick=async()=>{try{await preview.requestFullscreen();}catch{const notice=document.getElementById('status');notice.textContent='Não foi possível ampliar. Use a visualização ou o download do arquivo.';}};
   const tools=make('div','','mesa-preview-tools');tools.append(button);preview.before(tools);
  }
  const grade=document.querySelector('#reviewForm input[type=number]');
  if(grade&&!grade.closest('.mesa-grade-value')){const label=document.querySelector('label[for="'+grade.id+'"]');if(label)label.textContent='Nota';const row=make('div','','mesa-grade-value');grade.before(row);row.append(grade,make('span','/ 10'),make('small','De 0 a 10'));}
  const registered=document.querySelector('#reviewForm button[type=submit]')?.textContent.trim()==='Correção registrada';
  if(registered){const badge=strip.querySelector('.badge');if(badge&&badge.textContent!=='Correção registrada'){badge.textContent='Correção registrada';badge.classList.remove('gold');badge.classList.add('green');}}
 }
 let queued=false;function schedule(){if(!queued){queued=true;queueMicrotask(()=>{queued=false;page==='corrections'?list():review();});}}
 for(const node of [content,actions])if(node)new MutationObserver(schedule).observe(node,{childList:true,subtree:true});
 window.addEventListener('astrolearn:teacher-room-loaded',schedule);window.addEventListener('astrolearn:teacher-delivery-loaded',schedule);schedule();
})();
