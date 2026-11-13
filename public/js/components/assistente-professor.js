/* Bolinha global e conversa real com Sparky; carrega a conexão apenas ao abrir. */
(() => {
 if(document.querySelector('astro-assistente'))return;
 const base=new URL('.',document.currentScript.src);
 const style=document.createElement('style');style.textContent='[data-sparky-page]{max-width:none!important;width:100%}#helper,.quiet-companion,#chatToggle,#chatPanel{display:none!important}';document.head.append(style);
 const formatting=import(new URL('./chat-formatacao.js',base));
 const interactions=import(new URL('./sparky-interacoes-perfil.js?v=perfil-1',base));
 const pixel = false;
 const embedded=Boolean(document.querySelector('[data-sparky-page]'));
 class AstroAssistente extends HTMLElement {
  connectedCallback(){
   if(this.shadowRoot)return;
   const root=this.attachShadow({mode:'open'}),inline=this.hasAttribute('inline');
   root.innerHTML=`<style>
:host{position:fixed;right:22px;bottom:22px;z-index:100;font-family:Astro,Arial,sans-serif;color:#342044;font-size:14px;font-size:clamp(14px, calc(14px * var(--astro-text-size,100) / 100), 21px)}:host([inline]){position:static;display:block;width:100%}*{box-sizing:border-box}[hidden]{display:none!important}button,textarea{font:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.55}button:focus-visible,textarea:focus-visible{outline:3px solid #a267ec;outline-offset:3px}.bubble{width:48px;height:48px;border-radius:50%;border:1px solid #ffffff99;background:linear-gradient(135deg,#6411f3,#8735ef);color:white;box-shadow:0 5px 18px #51228232;display:grid;place-items:center;transition:transform .2s}.bubble:hover{transform:translateY(-2px)}svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}.tip{position:absolute;right:0;bottom:60px;white-space:nowrap;border-radius:10px;background:#fff;padding:8px;color:#513164;opacity:0;pointer-events:none;font-size:12px}.bubble:hover .tip,.bubble:focus-visible .tip{opacity:1}.panel{position:absolute;right:0;bottom:62px;width:390px;max-width:calc(100vw - 36px);height:min(590px,calc(100dvh - 140px));display:flex;flex-direction:column;border-radius:22px;background:#fffcf8f5;border:1px solid #fff;box-shadow:0 12px 40px #35204233;backdrop-filter:blur(18px);overflow:hidden}:host([inline]) .panel{position:static;width:100%;max-width:none;height: min(650px,75dvh);min-height:420px}header{padding:16px;border-bottom:1px solid #e8deed;display:flex;justify-content:space-between;gap:10px}header strong{display:block;font-size:17px}header small{font-size:11px;color:#6b5676}.close{border:0;border-radius:50%;width:32px;height:32px;background:#eee2f5;color:#523069;font-size:22px}.connection{padding:10px 16px;background:#f2eaf9;font-size:12px;display:flex;align-items:center;gap:8px}.connection span{flex:1}.retry{border:1px solid #ac8fc3;background:white;color:#563070;border-radius:8px;padding:7px}.log{flex:1;min-height:80px;overflow:auto;overscroll-behavior:contain;padding:16px;scroll-behavior:smooth}.log p{margin:0 25px 12px 0;background:#f0e7f6;border-radius:14px;padding:11px 13px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55}.log strong{font-weight:700}.log code{background:#fff8;border-radius:4px;padding:1px 4px;font-family:monospace}.log p.user{margin:0 0 12px 25px;background:#e2d1f5}.log p.system{font-size:12px;background:#fff1d7;color:#614a23}.waiting{padding:0 16px;font-size:12px;color:#735687}.notice{padding:0 16px;font-size:11px;color:#725f7c;line-height:1.5}form{display:flex;align-items:flex-end;gap:8px;padding:12px 16px}textarea{resize:vertical;min-height:46px;max-height:120px;min-width:0;flex:1;border:1px solid #ccbbdb;border-radius:12px;padding:11px;color:#342044;background:white}form button{min-width:46px;min-height:46px;border:0;border-radius:12px;background:#743bc3;color:white}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}@media(max-width:800px){:host{right:18px;bottom:90px}.panel{height:min(530px,calc(100dvh - 180px))}}@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}:host-context(.astro-motion-off) *{transition:none!important;scroll-behavior:auto!important}:host-context(.astro-high-contrast) .panel{background:white;color:#211028}:host-context(.astro-high-contrast) small,:host-context(.astro-high-contrast) .notice{color:#382044}
${pixel && inline ? `
.companion-pose { image-rendering: pixelated; }
.panel { background: #fffdfb; box-shadow: 4px 4px 0 #66509821, 8px 8px 0 #66509810; }
.connection, .log p { background: #f0e8fa; }
.log p.user { background: #e6d7fa; }
.log p.system { background: #fff1d7; }
form button { position: relative; font-size: 0; }
form button::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 18px;
  height: 18px;
  background: currentColor;
  clip-path: polygon(0 40%, 55% 40%, 55% 20%, 72% 20%, 72% 30%, 85% 30%, 85% 40%, 100% 40%, 100% 60%, 85% 60%, 85% 70%, 72% 70%, 72% 80%, 55% 80%, 55% 60%, 0 60%);
}
` : ''}

.log{scrollbar-width:thin;scrollbar-color:#ac8fc3 #f5eff8}.log::-webkit-scrollbar{width:7px}.log::-webkit-scrollbar-track{background:#f5eff8}.log::-webkit-scrollbar-thumb{background:#ac8fc3;border-radius:10px;border:2px solid #f5eff8}
</style><section class="panel" id="sparkyPanel" role="${inline?'region':'dialog'}" aria-label="Conversa com Sparky" ${inline?'':'hidden inert'}><header><div><strong>Sparky · Seu copiloto</strong><small>Assistente de aprendizagem com IA</small></div><button type="button" class="close" aria-label="Fechar assistente" ${inline?'hidden':''}>×</button></header><div class="connection"><span role="status">Abra a conversa para conectar.</span><button type="button" class="retry">Conectar</button></div><div class="log" role="log" aria-live="polite" aria-label="Mensagens"><p>Vamos investigar juntos? Posso ajudar a entender conceitos e pensar em caminhos para sua atividade.</p></div><p class="waiting" role="status" hidden>Sparky está pensando…</p><p class="notice">A IA pode errar. Confira as informações antes de utilizá-las em aula. Não envie senhas ou dados pessoais. Mensagens são enviadas ao serviço Sparky.</p><form><label class="sr" for="sparkyInput">Sua pergunta ao Sparky</label><textarea id="sparkyInput" rows="2" maxlength="1500" placeholder="O que vamos descobrir?" required></textarea><button type="submit" aria-label="Enviar pergunta" disabled>→</button></form></section><button class="bubble" aria-label="Abrir Sparky" aria-controls="sparkyPanel" aria-expanded="false" ${inline?'hidden':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16v14h-6l-4 4v-4H4Z"/><path d="M8 8h1m3 0h1m3 0h1M8 12h8"/></svg><span class="tip">Converse com o Sparky</span></button>`;
   const panel=root.querySelector('.panel'),button=root.querySelector('.bubble'),input=root.querySelector('textarea'),send=root.querySelector('form button'),retry=root.querySelector('.retry'),status=root.querySelector('.connection span'),log=root.querySelector('.log'),waiting=root.querySelector('.waiting');
   let client=null,connected=false,processing=false,loading=false,disposed=false,companion=null,profileCompanion=null;
   const controls=()=>{send.disabled=!connected||processing;input.readOnly=processing;retry.disabled=loading;waiting.hidden=!processing;companion?.status({connected,processing,loading});};
   const message=(text,kind='bot')=>{const p=document.createElement('p');const value=String(text).slice(0,30000);p.textContent=value;p.className=kind;if(kind==='bot')formatting.then(({formatarMensagem})=>p.replaceChildren(formatarMensagem(value))).catch(()=>{});log.append(p);while(log.children.length>60)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;if(kind!=='user')companion?.received(kind);};
   const connect=async()=>{if(loading||disposed)return;loading=true;connected=false;client?.dispose();client=null;controls();status.textContent='Carregando Sparky…';
    try{const {createSparky}=await import(new URL('../services/sparky.js',base));if(disposed)return;
     client=await createSparky({status:(text,online)=>{status.textContent=text;connected=online;retry.textContent=online?'Reconectar':'Tentar novamente';controls();},message,busy:value=>{processing=value;controls();}});
     if(disposed)client.dispose();
    }catch(error){status.textContent=error.message;connected=false;}finally{loading=false;controls();}
   };
   const toggle=open=>{panel.hidden=!open;panel.inert=!open;button.setAttribute('aria-expanded',String(open));if(open){input.focus();if(!client&&!loading)connect();}else button.focus();};
   button.onclick=()=>toggle(panel.hidden);root.querySelector('.close').onclick=()=>toggle(false);retry.onclick=connect;
   root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!inline&&!panel.hidden){event.preventDefault();event.stopPropagation();toggle(false);}});
   root.querySelector('form').onsubmit=event=>{event.preventDefault();const text=input.value.trim();if(!connected||processing||!text)return;if(client?.send(text)){message(text,'user');input.value='';}};
   const stop=()=>{disposed=true;companion?.pause();profileCompanion?.pause();client?.dispose();client=null;connected=false;processing=false;};
   const resume=event=>{if(event.persisted){disposed=false;profileCompanion?.resume();companion?.resume();status.textContent='Conversa pausada. Reconecte para continuar.';controls();if(!panel.hidden)connect();}};
   window.addEventListener('pagehide',stop);window.addEventListener('pageshow',resume);
   this.cleanup=()=>{stop();profileCompanion?.dispose();companion?.dispose();window.removeEventListener('pagehide',stop);window.removeEventListener('pageshow',resume);};
   interactions.then(({iniciarInteracoes})=>{
    if(disposed)return;
    const art = '../../assets/imagens/aluno/assistente/';
    companion = iniciarInteracoes({
      root, inline,
      sprite: new URL(art + (pixel ? 'pixel/sparky-lilas.png' : 'sparky-pagina-lilas.png'), base).href,
      poses: new URL(art + (pixel ? 'pixel/sparky-poses.png' : 'sparky-pagina-poses.png'), base).href,
    });
    if (inline) {
      const placement = document.createElement('style');
      placement.textContent = `
        @media(min-width:801px){
          :host([inline]){position:static;inset:auto;display:grid;grid-template-columns:minmax(0,58fr) minmax(0,42fr);gap:16px;align-items:stretch;min-width:0;max-width:100%}
          .panel{grid-column:1;grid-row:1;min-width:0}
          .companion{position:static;inset:auto;grid-column:2;grid-row:1;align-self:stretch;justify-self:stretch;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto minmax(0,1fr);justify-items:center;align-items:start;width:100%;min-width:0;max-width:100%;height:auto;margin:0;padding:0;gap:0;transform:none}
          .companion-character{position:relative;grid-column:1;grid-row:2;align-self:center;justify-self:center;width:min(100%,360px);max-width:100%;aspect-ratio:1;margin:0;transform:none}
          .companion-caption{position:static;inset:auto;grid-column:1;grid-row:3;align-self:start;justify-self:center;width:100%;max-width:240px;margin:12px 0 0;transform:none;text-align:center}
        }
        @media(max-width:800px){
          .companion{position:static;inset:auto;justify-content:center;width:100%;min-width:0;margin-inline:auto;transform:none}
        }
      `;
      root.append(placement);
    }
    if (inline) {
      import(new URL('./assistente-avatar-perfil.js?v=perfil-1',base))
        .then(({vincularAvatarPerfil})=>{if(!disposed)profileCompanion=vincularAvatarPerfil(companion);})
        .catch(()=>{});
    }
    controls();
   });
   if(inline)connect();
  }
  disconnectedCallback(){this.cleanup?.();}
 }
 if(!customElements.get('astro-assistente'))customElements.define('astro-assistente',AstroAssistente);
 const node=document.createElement('astro-assistente');
 if(embedded){node.setAttribute('inline','');document.querySelector('[data-sparky-page]').append(node);}else document.body.append(node);
})();

