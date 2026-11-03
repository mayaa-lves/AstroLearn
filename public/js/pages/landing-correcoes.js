/* Targeted landing improvements; no accounts, purchases or API writes. */
(() => {
 'use strict';
 const details=[...document.querySelectorAll('.faq-list details')];
 details.forEach(item=>{item.setAttribute('name','astrolearn-faq');item.addEventListener('toggle',()=>{if(item.open)details.forEach(other=>{if(other!==item)other.open=false;});});});
 // One set of controls: move them into the disclosure on small screens.
 const header=document.querySelector('.site-header'),nav=document.getElementById('siteNav');
 const actions=header?.querySelector('.header-actions'),toggle=document.getElementById('mobileNavToggle');
 const mobile=matchMedia('(max-width:650px)');
 function relocate(){if(!actions||!nav)return;if(mobile.matches)nav.append(actions);else header.append(actions);}
 mobile.addEventListener('change',relocate);relocate();
 // The plans retain their normal grid on desktop, and use native scroll snap on mobile.
 const track=document.querySelector('.plans');if(!track)return;
 track.id='plansTrack';
 const cards=[...track.querySelectorAll('.plan')];
 const controls=document.createElement('div');controls.className='plans-carousel-controls';
 controls.innerHTML='<button type="button" class="plans-prev" aria-label="Plano anterior" aria-controls="plansTrack"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button><div class="plans-dots" role="group" aria-label="Escolher plano"></div><button type="button" class="plans-next" aria-label="Próximo plano" aria-controls="plansTrack"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button><span class="plans-carousel-status" role="status" aria-live="polite"></span>';
 track.after(controls);
 const dots=cards.map((card,index)=>{const dot=document.createElement('button');dot.type='button';dot.className='plans-dot';dot.setAttribute('aria-label','Mostrar plano '+card.querySelector('.eyebrow').textContent.trim());dot.setAttribute('aria-controls','plansTrack');controls.querySelector('.plans-dots').append(dot);return dot;});
 let current=0,pending=0;
 function update(){const box=track.getBoundingClientRect();let distance=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-box.left-10);if(d<distance){distance=d;current=i;}});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));controls.querySelector('.plans-prev').disabled=current===0;controls.querySelector('.plans-next').disabled=current===cards.length-1;controls.querySelector('.plans-carousel-status').textContent=(current+1)+' de '+cards.length;}
 function select(index){index=Math.max(0,Math.min(cards.length-1,index));const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('motion-off');track.scrollTo({left:track.scrollLeft+cards[index].getBoundingClientRect().left-track.getBoundingClientRect().left-10,behavior:reduced?'instant':'smooth'});}
 dots.forEach((dot,index)=>dot.addEventListener('click',()=>select(index)));
 controls.querySelector('.plans-prev').onclick=()=>select(current-1);controls.querySelector('.plans-next').onclick=()=>select(current+1);
 track.addEventListener('scroll',()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(update);},{passive:true});
 track.addEventListener('keydown',event=>{if(!mobile.matches||event.target!==track)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(current+(event.key==='ArrowRight'?1:-1));}});
 function mode(){track.tabIndex=mobile.matches?0:-1;track.setAttribute('aria-label',mobile.matches?'Planos: deslize para comparar':'Planos do AstroLearn');update();}
 mobile.addEventListener('change',mode);window.addEventListener('resize',mode);mode();
})();
