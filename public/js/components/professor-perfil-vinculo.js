import {sessaoObrigatoria} from '../services/conexao.js';
import {ids,lerET} from '../services/avatar-conta.js';
if(location.pathname.includes('/professor/')){
 const session=sessaoObrigatoria('professor');
 const css=document.createElement('style');css.textContent=`
 .sidebar{scrollbar-width:thin;scrollbar-color:#ad8fc7 #f6effa}.sidebar::-webkit-scrollbar{width:6px}.sidebar::-webkit-scrollbar-thumb{background:#ad8fc7;border-radius:8px}
 #teacherTools .teacher-profile.has-teacher-avatar{background-image:var(--teacher-avatar-sheet);background-size:400% 200%;background-position:var(--teacher-avatar-position);background-repeat:no-repeat;color:transparent}
 body.profile-page .profile-heading{padding-right:150px}body.profile-page .home-fallback{display:none}
 @media(max-width:800px){body.profile-page .profile-heading{padding-top:70px;padding-right:0}}
 `;document.head.append(css);
 let selected=null,revision=0;
 function sync(){
  const button=document.querySelector('#teacherTools .teacher-profile');
  if(button){
   button.onclick=()=>{location.assign('perfil.html');};button.title='Meu perfil';button.setAttribute('aria-label','Abrir meu perfil');button.removeAttribute('aria-haspopup');button.removeAttribute('aria-controls');button.removeAttribute('aria-expanded');
   if(selected!==null){button.classList.add('has-teacher-avatar');button.style.setProperty('--teacher-avatar-sheet',`url("${new URL('../../assets/avatares/ets-perfil.png',import.meta.url).href}")`);button.style.setProperty('--teacher-avatar-position',`${selected%4*100/3}% ${selected<4?0:100}%`);}
  }
  // A navegação pertence exclusivamente a menu-professor-perfil.js.

 }
 async function refresh(){const current=++revision;try{const index=await lerET();if(current!==revision)return;selected=index>=0&&index<ids.length?index:null;sync();}catch{/* Mantém as iniciais e a navegação se a API falhar. */}}
 new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('astrolearn:avatar-changed',event=>{if(event.detail?.userId&&event.detail.userId!==session.usuario.id)return;const index=ids.indexOf(event.detail?.avatar_id);if(index>=0){revision++;selected=index;sync();}});
 window.addEventListener('focus',refresh);sync();refresh();
}
