import {registrarPlaneta} from './professor-planetas-rotacao.js';
import {api} from '../services/conexao.js';
if(document.body.dataset.page==='rooms'){
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../css/professor-mural.css?v=3',import.meta.url).href;document.head.append(css);
 document.body.classList.add('teacher-room-wall');
 const colors=['#9a85ba','#75a69d','#d0aa74','#7f9fbe','#b38b9d'];
 let codes=new Map(),loading=false,queued=false;
 const getId=card=>{const a=card.querySelector('a[href*="sala="]');return a?new URL(a.href,location.href).searchParams.get('sala'):null;};
 function render(){
  queued=false;
  const cards=[...document.querySelectorAll('.room-card')];
  const sorted=[...new Set(cards.map(getId).filter(Boolean))].sort();
  cards.forEach((card,index)=>{
   const id=getId(card),order=id?sorted.indexOf(id):index;
   const art=card.querySelector('.room-art'),planet=card.querySelector('.room-planet');if(!art||!planet)return;
   art.dataset.planetFamily=String(order%6);
   const signature=String(order);
   if(card.dataset.wallPlanet!==signature){
    card.dataset.wallPlanet=signature;planet.replaceChildren();
    const canvas=document.createElement('canvas');canvas.className='wall-globe';canvas.width=256;canvas.height=256;planet.append(canvas);registrarPlaneta(canvas,order);
   }
   art.removeAttribute('aria-hidden');planet.setAttribute('aria-hidden','true');
   let label=art.querySelector('.wall-code');if(!label){label=art.querySelector('span:not(.room-planet)')||document.createElement('span');label.className='wall-code';art.append(label);}
   const code=codes.get(id);const text=code?`Código da turma\n${code}`:loading?'Consultando código…':'Código indisponível';if(label.textContent!==text)label.textContent=text;
   card.querySelectorAll('.mini-chart>div').forEach((bar,i)=>{bar.style.setProperty('--bar-color',colors[i%colors.length]);});
  });
 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(render);}};
 async function loadCodes(){if(loading)return;loading=true;schedule();try{const data=await api('/api/professor/salas');const rooms=Array.isArray(data)?data:data.salas||[];codes=new Map(rooms.map(r=>[String(r.id),r.codigo_acesso||null]));}catch{codes=new Map();}finally{loading=false;schedule();}}
 const root=document.getElementById('content');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
 document.getElementById('refresh')?.addEventListener('click',loadCodes);
 loadCodes();schedule();
}
