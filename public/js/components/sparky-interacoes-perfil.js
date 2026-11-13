/* Interações visuais e teclado; não cria respostas nem modifica o serviço de IA. */
export function iniciarInteracoes({ root, inline, sprite, poses }) {
  const input = root.querySelector('textarea');
  const form = root.querySelector('form');
  const send = root.querySelector('form button');
  let composing = false;
  const startComposition = () => { composing = true; };
  const endComposition = () => { composing = false; };
  const keydown = event => {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.isComposing || composing || event.keyCode === 229) return;
    event.preventDefault();
    if (event.repeat || send.disabled || input.readOnly || !input.value.trim()) return;
    form.requestSubmit(send);
  };
  input.addEventListener('compositionstart', startComposition);
  input.addEventListener('compositionend', endComposition);
  input.addEventListener('keydown', keydown);
  const hint = document.createElement('p');
  hint.className = 'composer-hint';
  hint.id = 'composerHint';
  hint.textContent = 'Enter envia · Shift + Enter quebra a linha';
  form.after(hint);
  input.setAttribute('aria-describedby', 'composerHint');

  const style = document.createElement('style');
  style.textContent = `
.composer-hint{margin:0;padding:0 16px 12px;font-size:10px;color:#766480}
:host([inline]){display:grid;grid-template-columns:minmax(0,1fr) minmax(260px, 36%);gap:24px;align-items:start}
:host([inline]) .panel{min-width:0}
.companion{align-self:center;min-width:0;display:flex;align-items:center;flex-direction:column;gap:12px;text-align:center}
.companion-character{position:relative;display:block;width:100%;aspect-ratio:1;border:0;background:transparent;padding:0;border-radius:22px;color:#785294}
.companion-sprite{display:block;width:100%;height:100%;position:relative;filter:drop-shadow(0 8px 10px #59426717)}
.companion-pose{position:absolute;inset:0;background-size:300% 200%;background-repeat:no-repeat;opacity:0;transition:opacity .32s ease}
.companion-pose.is-current{opacity:1}
.companion-pose.neutral{background-size:200% 300%;background-position:0 50%}
.companion-character:hover{background:#efe6f833}.companion-character:focus-visible{outline:3px solid #9d6ad3;outline-offset:4px}
.companion-caption{margin:0;width:100%;max-width:240px;min-height:3.2em;font-size:12px;line-height:1.6;color:#776280}
.panel > :is(header,.connection,form,.waiting,.notice,.composer-hint){flex-shrink:0}
.panel .log{min-height:0}
@media(max-width:1100px){:host([inline]){grid-template-columns:minmax(0,1fr) minmax(210px, 34%);gap:14px}}
@media(max-width:800px){:host([inline]){grid-template-columns:1fr;gap:4px}.companion{grid-row:1;padding:0;flex-direction:row-reverse;justify-content:flex-start;gap:4px}.companion-character{width:122px;flex:0 0 122px}.companion-caption{font-size:11px;max-width:190px;min-height:0;text-align:right}:host([inline]) .panel{grid-row:2}.composer-hint{font-size:10px}}
@media(prefers-reduced-motion:reduce){.companion-pose{transition:none!important}}
:host-context(.astro-motion-off) .companion-pose{transition:none!important}
:host-context(.astro-high-contrast) .companion-caption,:host-context(.astro-high-contrast) .composer-hint{color:#382044}
`;
  root.append(style);

  let companion, character, art, caption;
  const frames = new Map();
  const poseForState = {
    ready: 'neutral', attentive: 'attentive', thinking: 'thinking',
    connecting: 'thinking', offline: 'error', idle: 'idle',
    reply: 'reply', wave: 'wave', error: 'error'
  };
  let base = 'offline', state = 'offline', timer, transient, paused = false, disposed = false;
  const states = {
    ready: 'O que vamos descobrir agora?',
    attentive: 'Estou acompanhando sua pergunta.',
    thinking: 'Pensando na sua pergunta…',
    connecting: 'Só um instante, estou conectando…',
    offline: 'Reconecte para continuarmos.',
    idle: 'Bateu um soninho… Estou por aqui!',
    reply: 'Chegou uma resposta para você!',
    wave: 'Oi! Vamos investigar juntos?',
    error: 'Vamos tentar de novo?'
  };
  if (inline) {
    companion = document.createElement('aside');
    companion.className = 'companion';
    companion.setAttribute('aria-label', 'Mascote Sparky');
    character = document.createElement('button');
    character.type = 'button';
    character.className = 'companion-character';
    character.setAttribute('aria-label', 'Cumprimentar o Sparky');
    art = document.createElement('span');
    art.className = 'companion-sprite';
    const poseNames = ['attentive', 'thinking', 'idle', 'reply', 'wave', 'error'];
    for (const [index, name] of [...poseNames, 'neutral'].entries()) {
      const frame = document.createElement('span');
      frame.className = 'companion-pose' + (name === 'neutral' ? ' neutral' : '');
      frame.style.backgroundImage = `url("${name === 'neutral' ? sprite : poses}")`;
      if (name !== 'neutral') frame.style.backgroundPosition = `${index % 3 * 50}% ${index < 3 ? 0 : 100}%`;
      frames.set(name, frame);
      art.append(frame);
    }
    art.setAttribute('aria-hidden', 'true');
    caption = document.createElement('p');
    caption.className = 'companion-caption';
    character.append(art);
    companion.append(character, caption);
    root.append(companion);
  }
  function draw(next) {
    state = next;
    if (!companion) return;
    for (const [name, frame] of frames) {
      frame.classList.toggle('is-current', name === poseForState[next]);
    }
    const text = states[next];
    companion.dataset.state = next;
    caption.textContent = text;
    // O status de conexão/resposta já é anunciado no painel de conversa.
  }
  // Each atlas has six realistic poses followed by the same six pixel poses.
  function setPortrait({url, pixel, name}) {
    if (!companion || disposed) return;
    const positions = {neutral:0, thinking:1, idle:2, reply:3, wave:4, attentive:5, error:5};
    for (const [pose, frame] of frames) {
      const index = positions[pose];
      const row = Math.floor(index / 3) + (pixel ? 2 : 0);
      frame.style.backgroundImage = `url("${url}")`;
      frame.style.backgroundSize = '300% 400%';
      frame.style.backgroundPosition = `${index % 3 * 50}% ${row * 100 / 3}%`;
      frame.style.imageRendering = pixel ? 'pixelated' : 'auto';
    }
    companion.dataset.avatar = name;
    companion.setAttribute('aria-label', `Seu assistente: ${name}`);
    character.setAttribute('aria-label', `Cumprimentar ${name}`);
  }
  function armIdle() {
    clearTimeout(timer);
    if (!inline || paused || disposed || document.hidden || base !== 'ready') return;
    timer = setTimeout(() => draw('idle'), 45000);
  }
  function activity() {
    if (disposed || paused) return;
    if (base === 'ready' && !['reply', 'wave'].includes(state)) draw(input.value.trim() ? 'attentive' : 'ready');
    armIdle();
  }
  function reaction(next) {
    if (!inline || base !== 'ready' || paused || disposed) return;
    clearTimeout(transient);
    draw(next);
    transient = setTimeout(() => { draw(base); armIdle(); }, 3000);
    armIdle();
  }
  function status({ connected, processing, loading }) {
    const next = processing ? 'thinking' : loading ? 'connecting' : connected ? 'ready' : 'offline';
    if (next !== base || !['attentive', 'reply', 'wave', 'idle'].includes(state)) {
      clearTimeout(transient);
      draw(next);
    }
    base = next;
    armIdle();
  }
  const greet = () => reaction('wave');
  character?.addEventListener('click', greet);
  root.addEventListener('input', activity);
  root.addEventListener('pointerdown', activity);
  root.addEventListener('keydown', activity);
  const visibility = () => { if (document.hidden) pause(); else resume(); };
  document.addEventListener('visibilitychange', visibility);
  function pause() { paused = true; clearTimeout(timer); clearTimeout(transient); }
  function resume() { paused = false; draw(base); armIdle(); }
  draw('offline');
  return {
    status, setPortrait, received: kind => reaction(kind === 'system' ? 'error' : 'reply'), pause, resume,
    dispose() {
      disposed = true; pause();
      input.removeEventListener('compositionstart', startComposition);
      input.removeEventListener('compositionend', endComposition);
      input.removeEventListener('keydown', keydown);
      root.removeEventListener('input', activity);
      root.removeEventListener('pointerdown', activity);
      root.removeEventListener('keydown', activity);
      document.removeEventListener('visibilitychange', visibility);
      character?.removeEventListener('click', greet);
      companion?.remove(); style.remove(); hint.remove();
    }
  };
}
