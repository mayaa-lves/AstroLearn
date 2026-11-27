import { obterSessao } from './autenticacao.js';
export const SPARKY_URL = 'https://steambot-backend.onrender.com';
let library;
function loadSocket() {
 if (window.io) return Promise.resolve(window.io);
 if (!library) library = new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=new URL('../../vendor/socket.io/socket.io.min.js',import.meta.url).href;
  const timer=setTimeout(()=>{script.remove();reject(new Error('Tempo esgotado ao carregar o chat.'));},15000);
  script.onload=()=>{clearTimeout(timer);window.io?resolve(window.io):reject(new Error('Chat indisponível.'));};
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('Não foi possível carregar o chat.'));};
  document.head.append(script);
 }).catch(error=>{library=null;throw error;});
 return library;
}
// Protocolo do frontend publicado do Sparky. Nunca repassa o JWT ou e-mail da plataforma.
export async function createSparky({status,message,busy}) {
 const session=obterSessao();
 if(!session)throw new Error('Entre na plataforma para conversar com o Sparky.');
 const io=await loadSocket();
 // HTTP long-polling mantém o protocolo real do Sparky sem depender do WebSocket da rede.
 const socket=io(SPARKY_URL,{autoConnect:false,transports:['polling'],upgrade:false,reconnectionAttempts:3,reconnectionDelay:1500,timeout:60000,auth:{role:session.usuario.role==='professor'?'teacher':'student',user_id:session.usuario.id,user_name:String(session.usuario.nome||'Explorador').slice(0,80)}});
 let pending=null,timer=null,expired=new Set(),disposed=false,welcome=false;
 const finish=()=>{clearTimeout(timer);timer=null;pending=null;busy(false);};
 const relevant=data=>!disposed && !expired.has(data?.request_id) && (!data?.request_id || !pending || data.request_id===pending);
 socket.on('connect',()=>status('Sparky conectado',true,'connected'));
 socket.on('status_conexao',data=>{if(!welcome){message(data?.mensagem_inicial||'Olá! Sou o Sparky. O que vamos investigar?');welcome=true;}});
 socket.on('nova_mensagem',data=>{if(!relevant(data))return;finish();message(typeof data?.texto==='string'&&data.texto.trim()?data.texto:'A resposta veio vazia. Tente reformular sua pergunta.');});
 socket.on('erro',data=>{if(!relevant(data))return;finish();message(typeof data?.erro==='string'?data.erro:'Não foi possível responder. Tente novamente.','system');});
 socket.on('disconnect',()=>{if(pending){expired.add(pending);message('A conexão caiu; sua pergunta não será reenviada automaticamente.','system');}finish();status('Conexão interrompida. Reconecte para continuar.',false,'offline');});
 socket.on('connect_error',()=>{finish();status('Sparky indisponível. Tente reconectar em alguns instantes.',false,'error');});
 socket.on('conversa_resetada',()=>{finish();message('Nova conversa iniciada.');});
 socket.connect();status('Conectando ao Sparky… O servidor pode levar até um minuto para despertar.',false,'connecting');
 return {
  send(text){
   if(disposed||!socket.connected||pending)return false;
   text=String(text).trim();if(!text||text.length>1500)return false;
   pending=crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
   busy(true);const id=pending;
   timer=setTimeout(()=>{expired.add(id);if(expired.size>50)expired.delete(expired.values().next().value);finish();message('A resposta demorou demais. Tente novamente; não reenviaremos a pergunta automaticamente.','system');},60000);
   socket.emit('enviar_mensagem',{mensagem:text,request_id:id});return true;
  },
  dispose(){disposed=true;finish();socket.removeAllListeners();socket.disconnect();}
 };
}
