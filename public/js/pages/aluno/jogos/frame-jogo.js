import { sessaoObrigatoria } from '../../../services/conexao.js';
import { acompanharAcessoJogos } from '../../../services/jogos-acesso.js';
export function montarJogo({frame,status,src}) {
 const session=sessaoObrigatoria('aluno');if(!session)return;
 let loaded=false,timer;
 frame.addEventListener('load',()=>{clearTimeout(timer);});
 const stop=acompanharAcessoJogos(state=>{
  if(!state.liberado){
   clearTimeout(timer);
   if(loaded){frame.src='about:blank';loaded=false;}
   frame.hidden=true;status.textContent=state.mensagem;return;
  }
  if(!loaded){frame.src=src;frame.hidden=false;loaded=true;timer=setTimeout(()=>{status.textContent='Se o jogo não apareceu, recarregue a página.';},20000);}
  status.textContent=state.integrado?'':state.mensagem;
 });
 const fullscreen=document.getElementById('fullscreen');
 fullscreen.onclick=async()=>{if(!loaded||frame.hidden)return;try{if(!frame.requestFullscreen)throw new Error();await frame.requestFullscreen();}catch{status.textContent='Tela cheia indisponível neste navegador. Continue jogando abaixo.';}};
 window.addEventListener('pagehide',()=>{clearTimeout(timer);stop();},{once:true});
 // Refresh permission after browser back/forward cache restoration.
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
}
