import {notificacoes,lerNotificacoes,destinoNotificacao} from '../../services/comunicacao.js';
const feed=document.getElementById('notificationFeed'), status=document.getElementById('notificationStatus'), bell=document.getElementById('notifications');
let rows=[],filter='all',busy=false;
const badge=document.createElement('span');badge.className='badge';badge.hidden=true;bell.append(badge);
const make=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
function render(){
 feed.replaceChildren();
 const shown=rows.filter(n=>filter!=='unread'||!n.lida_em);
 for(const n of shown){
  const article=make('article','');article.className='notification-card';
  article.append(make('h3',n.titulo),make('p',n.mensagem),make('small',new Date(n.criado_em).toLocaleString('pt-BR')));
  const destino=destinoNotificacao(n,'aluno');
  if(destino){const a=make('a','Abrir →');a.href=destino;a.className='secondary';article.append(a);}
  if(!n.lida_em){const button=make('button','Marcar como lida');button.type='button';button.className='text-button';button.onclick=async()=>{
    button.disabled=true;try{await lerNotificacoes([n.id]);n.lida_em=new Date().toISOString();render();await load();}catch(error){status.textContent=error.message;button.disabled=false;}
  };article.append(button);}
  feed.append(article);
 }
 if(!shown.length)feed.append(make('p',filter==='unread'?'Você está em dia. Nenhum aviso não lido.':'Sua caixa de avisos está vazia.'));
}
async function load(){
 if(busy || document.hidden)return;busy=true;
 try{const data=await notificacoes();rows=data.notificacoes || [];render();badge.textContent=String(data.nao_lidas || 0);badge.hidden=!data.nao_lidas;bell.setAttribute('aria-label','Notificações: '+(data.nao_lidas || 0)+' não lidas');status.textContent='Atualizado agora.';}
 catch(error){status.textContent=error.message;badge.hidden=true;if(!rows.length){feed.replaceChildren(make('p','Não foi possível consultar os avisos. Use Atualizar avisos para tentar novamente.'));}}
 finally{busy=false;}
}
document.querySelectorAll('[data-notification-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.notificationFilter;document.querySelectorAll('[data-notification-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
document.getElementById('refreshNotifications').onclick=load;
window.addEventListener('astro-notifications-open',load);load();setInterval(load,30000);
