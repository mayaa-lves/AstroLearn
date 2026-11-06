import {obterSessao} from './autenticacao.js';
let context, toggle;
const preference = 'astrolearn-som-notificacoes';
let muted = false;
try { muted = localStorage.getItem(preference) === 'off'; } catch {}
function unlock() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    if (context.state === 'suspended') context.resume().catch(()=>{});
  } catch {}
}
document.addEventListener('pointerdown', unlock, {passive:true});
document.addEventListener('keydown', unlock);
function control() {
  if (toggle) return;
  const anchor = document.getElementById('notifications') || document.getElementById('noticeBell') || document.getElementById('pageActions');
  if (!anchor) return;
  toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'text-button';
  const update = () => { toggle.textContent = muted ? 'Som: desligado' : 'Som: ligado'; toggle.setAttribute('aria-pressed',String(!muted)); toggle.setAttribute('aria-label',muted ? 'Ativar som de notificações' : 'Silenciar notificações'); };
  toggle.onclick = () => { muted = !muted; try {localStorage.setItem(preference,muted?'off':'on');} catch {} unlock(); update(); };
  update(); anchor.after(toggle);
}
export function observarNotificacoes(rows) {
  control();
  const user = obterSessao()?.usuario?.id;
  if (!user) return;
  const key = 'astrolearn-notificacoes-vistas:'+user;
  let previous;
  try { previous = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch {}
  const known = new Set(Array.isArray(previous) ? previous : []);
  const fresh = Array.isArray(previous) && rows.some(n => !n.lida_em && !known.has(n.id));
  rows.forEach(n=>known.add(n.id));
  try {sessionStorage.setItem(key,JSON.stringify([...known].slice(-300)));} catch {}
  if (!fresh || muted || context?.state !== 'running' || document.hidden) return;
  // Um toque por lote de avisos novos; nenhuma reprodução na carga inicial.
  try {
    const start = context.currentTime;
    [660,880].forEach((frequency,index)=>{
      const osc=context.createOscillator(), gain=context.createGain();
      osc.type='sine'; osc.frequency.value=frequency;
      gain.gain.setValueAtTime(0,start+index*.12);
      gain.gain.linearRampToValueAtTime(.065,start+index*.12+.015);
      gain.gain.exponentialRampToValueAtTime(.001,start+index*.12+.2);
      osc.connect(gain);gain.connect(context.destination);
      osc.start(start+index*.12);osc.stop(start+index*.12+.21);
    });
  } catch {}
}
