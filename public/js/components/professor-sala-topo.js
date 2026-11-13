(() => {
 if(document.body.dataset.page!=='room')return;
 document.body.classList.add('teacher-room-page');
 const actions=document.getElementById('pageActions');if(!actions)return;
 const definitions=[
  ['editor-atividade.html','Criar atividade','M12 5v14M5 12h14','create'],
  ['correcoes.html','Revisar entregas','M9 3H5v18h14V3h-4M9 2h6v4H9ZM8 13l3 3 5-6','review'],
  ['equipes.html','Organizar equipes','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 3 5v1','teams'],
  ['biblioteca.html','Materiais da biblioteca','M12 5C9 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1ZM12 5v16','library']
 ];
 let scheduled=false;
 function render(){
  scheduled=false;const ordered=[];
  for(const [file,label,path,key]of definitions){
   const link=[...actions.querySelectorAll('a')].find(a=>new URL(a.href,location.href).pathname.endsWith('/'+file));
   if(!link)continue;
   if(link.dataset.roomAction!==key){
    link.dataset.roomAction=key;link.classList.add('room-quick-action');link.setAttribute('aria-label',label);link.removeAttribute('title');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('d',path);svg.append(line);
    const text=document.createElement('span');text.className='room-action-label';text.textContent=label;text.setAttribute('aria-hidden','true');link.replaceChildren(svg,text);
   }
   ordered.push(link);
  }
  const select=actions.querySelector('select');if(select){select.setAttribute('aria-label','Filtrar por semestre');const all=[...select.options].find(option=>option.value==='');if(all&&all.textContent!=='Todos os semestres')all.textContent='Todos os semestres';ordered.push(select);}
  ordered.forEach((node,index)=>{if(actions.children[index]!==node)actions.insertBefore(node,actions.children[index]||null);});
 }
 function schedule(){if(!scheduled){scheduled=true;queueMicrotask(render);}}
 new MutationObserver(schedule).observe(actions,{childList:true,subtree:true});render();
})();
