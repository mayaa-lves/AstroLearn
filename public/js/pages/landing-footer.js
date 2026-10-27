/* One small inline team profile, with initials until real photos are provided. */
(() => {
 'use strict';
 const footer=document.querySelector('.footer-orbit');if(!footer)return;
 const buttons=[...footer.querySelectorAll('[data-footer-person]')];
 const panel=document.getElementById('footerPerson');let active=-1;
 const people=[['Mayara Alves','MA'],['Isadora Jucá','IJ'],['Yan Proença','YP'],['Daniel Pupo','DP']];
 function close(restore=false){const previous=active;active=-1;panel.hidden=true;buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.querySelector('span').textContent='+';});if(restore&&previous>=0)buttons[previous].focus();}
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{
  if(active===index){close();return;}close();active=index;
  document.getElementById('footerPersonName').textContent=people[index][0];document.getElementById('footerPersonInitials').textContent=people[index][1];
  panel.hidden=false;button.setAttribute('aria-expanded','true');button.querySelector('span').textContent='−';
 }));
 document.getElementById('footerPersonClose').addEventListener('click',()=>close(true));
 footer.addEventListener('keydown',event=>{if(event.key==='Escape'&&active>=0){event.preventDefault();close(true);}});
 document.addEventListener('click',event=>{if(active>=0&&!event.target.closest('.footer-orbit-team'))close();});
})();
