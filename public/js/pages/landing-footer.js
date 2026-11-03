/* One small inline team profile, with initials until real photos are provided. */
(() => {
 'use strict';
 const footer=document.querySelector('.footer-orbit');if(!footer)return;
 const buttons=[...footer.querySelectorAll('[data-footer-person]')];
 const panel=document.getElementById('footerPerson');let active=-1;
 const people=[['Mayara Alves','MA','https://www.linkedin.com/in/mayara-alvesss'],['Isadora Jucá','IJ','https://www.linkedin.com/in/isadora-juc%C3%A1-de-lima'],['Yan Proença','YP',null],['Daniel Pupo','DP','https://www.linkedin.com/in/pupo-daniel-dev']];
 const linkedin=document.createElement('a');linkedin.className='footer-person-link';linkedin.textContent='Ver LinkedIn ↗';linkedin.target='_blank';linkedin.rel='noopener noreferrer';panel.querySelector('h3').parentElement.append(linkedin);
 function close(restore=false){const previous=active;active=-1;panel.hidden=true;buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.querySelector('span').textContent='+';});if(restore&&previous>=0)buttons[previous].focus();}
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{
  if(active===index){close();return;}close();active=index;
  document.getElementById('footerPersonName').textContent=people[index][0];document.getElementById('footerPersonInitials').textContent=people[index][1];
  linkedin.hidden=!people[index][2];if(people[index][2])linkedin.href=people[index][2];else linkedin.removeAttribute('href');
  panel.hidden=false;button.setAttribute('aria-expanded','true');button.querySelector('span').textContent='−';
 }));
 document.getElementById('footerPersonClose').addEventListener('click',()=>close(true));
 footer.addEventListener('keydown',event=>{if(event.key==='Escape'&&active>=0){event.preventDefault();close(true);}});
 document.addEventListener('click',event=>{if(active>=0&&!event.target.closest('.footer-orbit-team'))close();});
})();
