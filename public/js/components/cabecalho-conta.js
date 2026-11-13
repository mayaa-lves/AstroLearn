/* Navegação de conta compartilhada; a trilha conserva seu sino e menu já aprovados. */
import { obterSessao } from '../services/autenticacao.js';
import { encerrar } from '../services/conexao.js';
const student=/\/aluno\//.test(location.pathname),teacher=/\/professor\//.test(location.pathname);
const trail=student&&/\/home\.html$/.test(location.pathname);
const session=obterSessao();
if(session&&(student||teacher)&&!trail&&!document.getElementById('activityAccountToggle')&&!document.getElementById('astroAccountTools')){
 const base=new URL(student?'../../../aluno/':'../../../professor/',import.meta.url);
 const style=document.createElement('style');style.textContent=`
.astro-header-page .library-account-tools,.astro-header-page #motion{display:none!important}
#astroAccountTools{position:fixed;top:28px;right:30px;display:flex;gap:12px;align-items:center;z-index:42;font-family:Astro,Arial,sans-serif;color:#4e3568}
#astroAccountTools *{box-sizing:border-box}#astroAccountTools button,#astroAccountTools a{font:inherit}
#astroAccountTools .account-circle{display:grid;place-items:center;position:relative;width:44px;height:44px;flex:0 0 44px;padding:0;border:1px solid #fff;border-radius:50%;color:#704697;background:#fffaf3e8;box-shadow:0 3px 12px #43324d14;text-decoration:none;cursor:pointer}
#astroAccountTools .account-circle:hover{background:#eee2fa}#astroAccountTools .account-circle svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#astroAccountTools #astroAccountButton{background:#ded0ef;font-size:17px;font-weight:700}
#astroAccountTools :is(button,a):focus-visible{outline:3px solid #7343a6;outline-offset:4px}
#astroAccountTools .home-tip{position:absolute;top:calc(100% + 10px);right:0;white-space:nowrap;font-size:12px;background:#3d2850;color:#fff;border-radius:8px;padding:7px 10px;opacity:0;visibility:hidden;pointer-events:none}
#astroAccountTools .account-circle:is(:hover,:focus-visible) .home-tip{opacity:1;visibility:visible}
#astroAccountTools .account-wrap{position:relative}#astroAccountTools .account-wrap:before{content:'';position:absolute;top:100%;right:0;width:100%;height:15px}
#astroAccountPanel{position:absolute;right:0;top:calc(100% + 12px);width:306px;max-width:calc(100vw - 28px);padding:18px;border:1px solid #fff;border-radius:22px;background:#fffaf5f5;backdrop-filter:blur(20px);box-shadow:0 13px 38px #38244926;text-align:left}
#astroAccountTools [hidden]{display:none!important}#astroAccountPanel .account-title{display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:.08em;color:#7e638d;margin-bottom:15px}
#astroAccountPanel .account-close{border:0;width:28px;height:28px;border-radius:50%;background:#ece1f3;color:#68467b;font-size:22px;cursor:pointer}
#astroAccountPanel .account-person{display:flex;align-items:center;gap:12px;border-bottom:1px solid #e5d9e8;padding-bottom:15px;margin-bottom:7px}
#astroAccountPanel .account-avatar{display:grid;place-items:center;flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:linear-gradient(140deg,#eadcf8,#c9aedf);color:#68438c;font-size:23px}
#astroAccountPanel .account-person>div{min-width:0}#astroAccountPanel strong{display:block;font-size:15px;line-height:1.3;overflow-wrap:anywhere;color:#382344}
#astroAccountPanel p{font-size:12px;line-height:1.5;margin:4px 0;color:#705a7e;overflow-wrap:anywhere}#astroAccountPanel small{font-size:11px;color:#7e6489}
#astroAccountPanel>a{display:flex;justify-content:space-between;align-items:center;padding:12px 8px;border-radius:10px;font-size:13px;text-decoration:none;color:#60378b;line-height:1.4}
#astroAccountPanel>a:hover{background:#efe2fa}#astroAccountPanel .account-logout{width:100%;border:1px solid #dfcde5;border-radius:10px;margin-top:9px;padding:10px;background:transparent;color:#6c4d7c;font-size:13px;cursor:pointer}
.astro-header-page main>header{padding-right:125px}.astro-header-page.library-page .library-heading{padding-right:0}
@media(max-width:800px){#astroAccountTools{top:22px;right:18px;gap:8px}#astroAccountTools .account-circle{width:36px;height:36px;flex-basis:36px}#astroAccountTools #astroAccountButton{font-size:15px}.astro-header-page main>header,.astro-header-page.library-page .library-heading{padding-right:90px}}
@media(prefers-reduced-motion:reduce){#astroAccountTools *{animation:none!important;transition:none!important}}
`;document.head.append(style);document.body.classList.add('astro-header-page');
 const tools=document.createElement('div');tools.id='astroAccountTools';tools.setAttribute('aria-label','Navegação e conta');
 tools.innerHTML='<a class="account-circle" id="astroHome" aria-label="Voltar à trilha"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></svg><span class="home-tip">Voltar à trilha</span></a><div class="account-wrap"><button type="button" class="account-circle" id="astroAccountButton" aria-label="Abrir menu do perfil" aria-expanded="false" aria-controls="astroAccountPanel"></button><div id="astroAccountPanel" hidden><div class="account-title">SUA CONTA<button type="button" class="account-close" aria-label="Fechar menu do perfil">×</button></div><div class="account-person"><span class="account-avatar" aria-hidden="true"></span><div><strong></strong><p></p><small></small></div></div><a class="account-profile">Meu perfil <span aria-hidden="true">↗</span></a><a class="account-settings">Preferências <span aria-hidden="true">→</span></a><button type="button" class="account-logout">Sair da conta</button></div></div>';
 document.body.append(tools);const $=s=>tools.querySelector(s),button=$('#astroAccountButton'),panel=$('#astroAccountPanel'),wrap=$('.account-wrap');
 $('#astroHome').href=new URL(student?'home.html#journey':'home.html',base).href;
 if(teacher){$('#astroHome').setAttribute('aria-label','Voltar às turmas');$('.home-tip').textContent='Voltar às turmas';}
 const initial=(session.usuario.nome||'Conta').trim().charAt(0).toUpperCase();button.textContent=initial;$('.account-avatar').textContent=initial;$('.account-person strong').textContent=session.usuario.nome||'Minha conta';$('.account-person p').textContent=session.usuario.email||'';$('.account-person small').textContent=student?'Perfil de aluno':'Perfil de professor';$('.account-profile').href=new URL('perfil.html',base).href;$('.account-settings').href=new URL(student?'perfil.html#preferencesTitle':'home.html',base).href;
 if(teacher){$('.account-profile').hidden=true;$('.account-settings').hidden=true;}let timer;function open(value){clearTimeout(timer);panel.hidden=!value;button.setAttribute('aria-expanded',String(value));}
 button.onclick=()=>open(panel.hidden);$('.account-close').onclick=()=>{open(false);button.focus();};wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')open(true);});wrap.addEventListener('pointerleave',()=>{timer=setTimeout(()=>{if(!wrap.contains(document.activeElement))open(false);},180);});wrap.addEventListener('focusout',()=>{setTimeout(()=>{if(!wrap.contains(document.activeElement)&&!wrap.matches(':hover'))open(false);},0);});document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target))open(false);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){open(false);button.focus();}});$('.account-logout').onclick=encerrar;
}

// Executa também nos cabeçalhos próprios da Trilha e da Atividade.
import { iniciarFotoCabecalho } from './foto-cabecalho.js';
if (student && session) iniciarFotoCabecalho(session.usuario);
