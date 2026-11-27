import {lerET,ids} from '../services/avatar-conta.js';
let profile;
const characters=['lilas','verde','azul','turquesa','lilas','verde','azul','turquesa'];
export function mountChatWait(root){
 const panel=root.querySelector('.panel');if(!panel)return {status(){},pause(){},resume(){},dispose(){}};
 const track=document.createElement('div');track.className='chat-walk-track';track.hidden=true;track.setAttribute('aria-hidden','true');
 const log=root.querySelector('.log');const stage=document.createElement('div');stage.className='chat-walk-stage';log.before(stage);stage.append(log);
 const carrier=document.createElement('span');carrier.className='chat-walk-carrier';const image=document.createElement('img');image.alt='';image.width=image.height=96;image.draggable=false;carrier.append(image);track.append(carrier);stage.append(track);
 const style=document.createElement('style');style.textContent=`
 .chat-walk-stage{position:relative;flex:1 1 0;min-height:80px;overflow:hidden;display:flex;flex-direction:column}
 .chat-walk-stage>.log{flex:1;min-height:0}
 .panel.is-chat-connecting .chat-walk-stage>.log{display:none!important}
 .panel.is-chat-connecting>form,.panel.is-chat-connecting>.notice,.panel.is-chat-connecting>.waiting{display:none!important}
 .chat-walk-track{position:absolute;inset:0;overflow:hidden;contain:layout paint;background:radial-gradient(ellipse at 50% 65%,#eadcf580,transparent 70%),linear-gradient(180deg,#fffcf8,#f4edf9);pointer-events:none;isolation:isolate;mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
 .chat-walk-track::after{content:'';position:absolute;left:12px;right:12px;top:calc(50% + 64px);height:1px;background:linear-gradient(90deg,transparent,#d4bdde66,transparent)}
 .chat-walk-carrier{position:absolute;display:block;width:144px;height:144px;left:-148px;top:calc(50% - 72px);animation:chat-et-crossing 7s linear infinite alternate;will-change:left}
 .chat-walk-carrier img{display:block;width:144px;height:144px;object-fit:contain;animation:chat-et-turn 14s steps(1,end) infinite;transform-origin:center;pointer-events:none;user-select:none;image-rendering:auto}
 @keyframes chat-et-crossing{from{left:-148px}to{left:100%}}
 @keyframes chat-et-turn{0%{transform:scaleX(1)}50%{transform:scaleX(-1)}100%{transform:scaleX(1)}}
 .chat-walk-track.is-static .chat-walk-carrier{animation:none;left:calc(50% - 72px)}
 .chat-walk-track.is-static img{animation:none;transform:none}
 @media(prefers-reduced-motion:reduce){.chat-walk-carrier,.chat-walk-carrier img{animation:none!important}.chat-walk-carrier{left:calc(50% - 72px)}}
 :host-context(.astro-motion-off) .chat-walk-carrier,:host-context(.astro-motion-off) .chat-walk-carrier img{animation:none!important}
 `;root.append(style);
 let state={},paused=false,disposed=false,revision=0,character='lilas',currentSrc='';const media=matchMedia('(prefers-reduced-motion: reduce)');
 function render(){if(disposed)return;const active=!paused&&!document.hidden&&state.open!==false&&!state.connected&&(state.loading||state.connecting);track.hidden=!active;panel.classList.toggle('is-chat-connecting',Boolean(active));log.inert=Boolean(active);if(active)log.setAttribute('aria-hidden','true');else log.removeAttribute('aria-hidden');if(!active){if(currentSrc){image.removeAttribute('src');currentSrc='';}return;}
  const reduced=media.matches||document.body.classList.contains('astro-motion-off');track.classList.toggle('is-static',reduced);const src=new URL('../../assets/animacoes/chat/et-'+character+(reduced?'-parado.png':'.gif'),import.meta.url).href;if(src!==currentSrc){currentSrc=src;image.src=src;}
 }
 function choose(index){character=characters[index]||'lilas';render();}
 function changed(event){const index=ids.indexOf(event.detail?.avatar_id);if(index>=0){revision++;choose(index);}}
 const visibility=()=>render(),motion=()=>render(),observer=new MutationObserver(motion);observer.observe(document.body,{attributes:true,attributeFilter:['class']});media.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);window.addEventListener('astrolearn:avatar-changed',changed);
 let asked=false;
 return {status(next){state=next;render();if(!asked&&!track.hidden){asked=true;const version=revision;if(!profile)profile=lerET().catch(()=>0);profile.then(index=>{if(!disposed&&version===revision)choose(index);});}},pause(){paused=true;render();},resume(){paused=false;render();},dispose(){disposed=true;image.removeAttribute('src');panel.classList.remove('is-chat-connecting');log.inert=false;log.removeAttribute('aria-hidden');stage.before(log);stage.remove();style.remove();observer.disconnect();media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('astrolearn:avatar-changed',changed);}};
}
