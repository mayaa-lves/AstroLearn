/* Apenas apresentação: preserva IDs, valores, eventos e as rotas já existentes. */
(() => {
 if(!location.pathname.includes('/professor/')||!document.body.classList.contains('teacher-finish'))return;
 const main=document.getElementById('main');if(!main)return;
 let frame=0;
 function finish(){
  frame=0;
  // Move somente o botão; #pageActions precisa continuar no DOM nas recargas do mural.
  if(document.body.dataset.page==='rooms'){
   const action=document.querySelector('#pageActions .teacher-create-room');
   const toolbar=document.getElementById('roomToolbar');
   if(action&&toolbar)toolbar.append(action);
  }
  for(const table of document.querySelectorAll('#main table,dialog table')){
   if(table.parentElement.matches('.finish-table-scroll,.table-wrap,.room-chart-scroll')||table.closest('td,th'))continue;
   const wrapper=document.createElement('div');wrapper.className='finish-table-scroll';wrapper.tabIndex=0;
   wrapper.setAttribute('role','region');
   const caption=table.querySelector('caption')?.textContent?.trim();
   wrapper.setAttribute('aria-label',caption||'Tabela. Use as setas para navegar quando houver rolagem horizontal.');
   table.before(wrapper);wrapper.append(table);
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(finish);}
 const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pageshow',schedule);document.addEventListener('DOMContentLoaded',schedule,{once:true});finish();
})();
