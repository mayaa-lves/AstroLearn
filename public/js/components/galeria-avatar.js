import {lerET,salvarET} from '../services/avatar-conta.js';
const names=['Lilás astronauta','Verde cientista','Azul artista','Turquesa leitor','Lilás engenheiro','Verde astronauta','Azul explorador','Turquesa astronauta'];
const sheet=new URL('../../assets/avatares/ets-perfil.png',import.meta.url).href;
export function iniciarGaleria(user) {
 let revision=0;
 const portrait=document.getElementById('avatarImage'), trigger=document.getElementById('changePhoto'), status=document.getElementById('avatarStatus');
 portrait.parentElement.style.position='relative';
 const style=document.createElement('style');
 style.textContent=`.et-avatar{background-image:url("${sheet}");background-size:400% 200%;background-repeat:no-repeat;display:block;aspect-ratio:1;border-radius:50%}#avatarImage.et-avatar{position:absolute;inset:0;width:100%;height:100%;z-index:1}.et-gallery{width:min(580px,calc(100vw - 32px));max-height:85dvh;overflow:auto;border:1px solid #cfc0ea;border-radius:24px;padding:24px;color:#251442;background:#fffafa}.et-gallery::backdrop{background:#20123588}.et-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}.et-option{padding:5px;border:2px solid transparent;border-radius:18px;background:#f3edf9;cursor:pointer}.et-option[aria-pressed=true]{border-color:#6d32ec}.et-option:focus-visible{outline:3px solid #6d32ec;outline-offset:3px}.et-option .et-avatar{width:100%}.et-option small{display:block;font-size:12px;margin-top:6px;color:#352249}@media(max-width:440px){.et-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
 document.head.append(style);
 function paint(el,index){el.classList.add('et-avatar');el.style.backgroundPosition=`${index%4*100/3}% ${index<4?0:100}%`;}
 const dialog=document.createElement('dialog');dialog.className='et-gallery';dialog.setAttribute('aria-labelledby','avatarGalleryTitle');
 const heading=document.createElement('h2');heading.id='avatarGalleryTitle';heading.textContent='Escolha seu ET';
 const hint=document.createElement('p');hint.textContent='Escolha o ET que vai aparecer na sua conta e na sua expedição.';
 const grid=document.createElement('div');grid.className='et-grid';
 let selected=null;
 const buttons=names.map((name,index)=>{const b=document.createElement('button');b.type='button';b.className='et-option';b.setAttribute('aria-label',name);const pic=document.createElement('span');pic.setAttribute('aria-hidden','true');paint(pic,index);const label=document.createElement('small');label.textContent=name;b.append(pic,label);b.onclick=async()=>{revision++;buttons.forEach(el=>el.disabled=true);hint.setAttribute('role','status');hint.textContent='Salvando…';try{await salvarET(index);select(index);status.textContent='ET salvo na sua conta.';dialog.close()}catch{hint.textContent='Não foi possível salvar. Tente novamente.'}finally{buttons.forEach(el=>el.disabled=false)}};grid.append(b);return b;});
 function select(index){selected=index;paint(portrait,index);portrait.hidden=false;portrait.setAttribute('role','img');portrait.setAttribute('aria-label',names[index]);document.getElementById('avatarInitials').hidden=true;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
 const close=document.createElement('button');close.type='button';close.className='secondary';close.textContent='Fechar';close.onclick=()=>dialog.close();dialog.append(heading,hint,grid,close);document.body.append(dialog);
 lerET().then(i=>{if(!revision&&i>=0)select(i)}).catch(()=>{if(!revision)status.textContent='Não foi possível carregar o ET da conta.'});
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
 trigger.setAttribute('aria-label','Escolher avatar');trigger.title='Escolher avatar';trigger.onclick=()=>{hint.textContent='Escolha seu ET.';dialog.showModal();buttons[selected??0].focus();};dialog.addEventListener('close',()=>trigger.focus());
}
