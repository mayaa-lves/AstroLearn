// Oito fotografias de cada personagem, interpoladas em um único canvas.
// A rotação sempre percorre o caminho mais curto, inclusive de 315° a 0°.
export function iniciarVistas({ render, slider, angleLabel, stage, stopped }) {
  const names = ['Lilás astronauta','Verde cientista','Azul artista','Turquesa leitor','Lilás engenheiro','Verde astronauta','Azul explorador','Turquesa astronauta'];
  const views = ['De frente','Em três quartos à esquerda','De perfil à esquerda','De costas em três quartos à esquerda','De costas','De costas em três quartos à direita','De perfil à direita','Em três quartos à direita'];
  const canvas = document.createElement('canvas');
  canvas.width = 384; canvas.height = 512;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'avatar-turntable';
  const ctx = canvas.getContext('2d');
  let image = null, selected = 0, rotation = 0, target = 0, frame = 0, previous = 0, revision = 0;
  slider.min = '0'; slider.max = '359'; slider.step = '1'; slider.value = '0';
  const wrap = x => ((x % 360) + 360) % 360;
  function describe() {
    const view = views[Math.round(wrap(rotation) / 45) % 8];
    slider.setAttribute('aria-valuetext', view);
    angleLabel.textContent = view;
    stage.setAttribute('aria-label', `Interagir com ${names[selected]}, ${view.toLowerCase()}`);
  }
  function draw() {
    if (!ctx || !image) return;
    ctx.clearRect(0, 0, 384, 512);
    // Frames usam células 4×2, com pés e eixo do corpo alinhados.
    const value = wrap(rotation) / 45, a = Math.floor(value), mix = value - a;
    const paint = (index, opacity) => {
      const w = image.naturalWidth / 4, h = image.naturalHeight / 2;
      ctx.globalAlpha = opacity;
      ctx.drawImage(image, index % 4 * w, Math.floor(index / 4) * h, w, h, 0, 0, 384, 512);
    };
    // Transição breve no meio do intervalo; evita duas faces durante todo o giro.
    const blend = Math.max(0, Math.min(1, (mix - .32) / .36));
    paint(a, 1 - blend);
    if (blend) paint((a + 1) % 8, blend);
    ctx.globalAlpha = 1;
    canvas.dataset.angle = String(wrap(rotation));
    canvas.dataset.avatar = String(selected);
    describe();
  }
  function tick(now) {
    frame = 0;
    const dt = Math.min(48, previous ? now - previous : 16); previous = now;
    const delta = ((target - rotation + 540) % 360) - 180;
    if (stopped() || Math.abs(delta) < .12) { rotation = target; draw(); previous = 0; return; }
    rotation = wrap(rotation + delta * (1 - Math.exp(-dt / 65)));
    draw(); frame = requestAnimationFrame(tick);
  }
  function rotate() {
    target = wrap(Number(slider.value));
    if (stopped()) { cancelAnimationFrame(frame); frame = 0; rotation = target; draw(); }
    else if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
  }
  async function select(index) {
    const next = Number.isInteger(index) && index >= 0 && index < 8 ? index : 0;
    if (image && next === selected) return;
    const request = ++revision;
    const asset = new Image();
    asset.src = new URL((globalThis.astroArte || (url => url))(`../../assets/avatares/vistas/et-${next}.png`), import.meta.url).href;
    try { await asset.decode(); } catch { return; }
    if (request !== revision || !ctx) return;
    cancelAnimationFrame(frame); frame = 0;
    selected = next; image = asset; rotation = target = 0; slider.value = '0';
    render.classList.add('has-turntable');
    render.replaceChildren(canvas);
    draw();
  }
  function settle() { cancelAnimationFrame(frame); frame = 0; rotation = target; previous = 0; draw(); }
  document.addEventListener('astrolearn:motion', () => { if (stopped()) settle(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  window.addEventListener('pagehide', settle);
  return { rotate, select };
}

/* astro-tema-v2 */