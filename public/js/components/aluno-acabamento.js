/* Camada de apresentação. Não consulta a API nem altera notas, compras ou missões. */
(() => {
 if(!location.pathname.includes('/aluno/')||!document.body.classList.contains('student-finish'))return;
 let frame=0;
 function finish(){
  frame=0;
  for(const table of document.querySelectorAll('#main table,dialog table,.integration-invite table')){
   if(table.parentElement.matches('.student-table-scroll,.table-wrap,.room-chart-scroll')||table.closest('td,th'))continue;
   const wrapper=document.createElement('div');wrapper.className='student-table-scroll';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',table.querySelector('caption')?.textContent?.trim()||'Tabela. Use as setas quando houver rolagem horizontal.');
   table.before(wrapper);wrapper.append(table);
  }
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(finish);};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pageshow',schedule);document.addEventListener('DOMContentLoaded',schedule,{once:true});finish();
})();
