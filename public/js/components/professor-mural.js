import {registrarPlaneta} from './professor-planetas-rotacao.js?v=7';
if(document.body.dataset.page==='rooms'){
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../css/professor-mural.css?v=8',import.meta.url).href;document.head.append(css);
 document.body.classList.add('teacher-room-wall');
 function mount(){document.querySelectorAll('.room-card .room-planet:not([data-mounted])').forEach(planet=>{planet.dataset.mounted='true';const canvas=document.createElement('canvas');canvas.className='wall-globe';canvas.width=256;canvas.height=256;planet.append(canvas);registrarPlaneta(canvas,Number(planet.closest('.room-card').dataset.planetFamily)||0);});}
 new MutationObserver(mount).observe(document.getElementById('content'),{subtree:true,childList:true});mount();
}
