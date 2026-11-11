import { recortarObjetosDoCeu } from '../../components/trilha-cena.js?v=1';
/* Céu vivo: um canvas atrás de toda a interface. Não altera dados escolares. */
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const media = matchMedia("(prefers-reduced-motion: reduce)");
let width = 0,
  height = 0,
  time = 0,
  previous = 0,
  frame = 0;
const pointer = { x: -2000, y: -2000 };
const stars = [];
const initialCount = 38,
  maxStars = 240;
const stopped = () =>
  media.matches ||
  document.hidden ||
  document.body.classList.contains("motion-reduced") ||
  document.body.classList.contains("astro-motion-off");
function createStar(x, y, extra = false) {
  return {
    born: extra ? time : -10,
    extra,
    x: x / width,
    y: y / height,
    speed: 9 + Math.random() * 15,
    drift: 1 + Math.random() * 3,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    size: extra ? 1.15 + Math.random() * 0.4 : 0.55 + Math.random() * 0.8,
    phase: Math.random() * 6.28,
    gold: Math.random() < 0.25,
  };
}
function resize() {
  width = innerWidth;
  height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (!stars.length)
    for (let i = 0; i < initialCount; i++)
      stars.push(createStar(Math.random() * width, Math.random() * height));
  canvas.dataset.stars = String(stars.length);
  draw(0);
}
function star(p, dt) {
  const newborn = p.extra && time - p.born < 1.2;
  if (dt && !newborn) {
    p.x += p.speed * dt / width;
    p.y += p.drift * dt / height;
    if (p.x > 1.03) { p.x = -.03; p.y = Math.random(); }
    if (p.y > 1.03) p.y = -.03;
  }
  const bx = p.x * width, by = p.y * height;
  if (dt) {
    const dx = bx + p.dx - pointer.x,
      dy = by + p.dy - pointer.y,
      dist = Math.hypot(dx, dy),
      step = dt * 60;
    let ax = -p.dx * 0.01,
      ay = -p.dy * 0.01;
    if (!newborn && dist < 100) {
      const force = (1 - dist / 100) * .85;
      ax += (dist > 1 ? dx / dist : 1) * force;
      ay += (dist > 1 ? dy / dist : 0) * force;
    }
    p.vx = (p.vx + ax * step) * Math.pow(0.87, step);
    p.vy = (p.vy + ay * step) * Math.pow(0.87, step);
    p.dx = Math.max(-70, Math.min(70, p.dx + p.vx * step));
    p.dy = Math.max(-70, Math.min(70, p.dy + p.vy * step));
  }
  const x = bx + p.dx,
    y = by + p.dy;
  if (x < -15 || x > width + 15 || y < -15 || y > height + 15) return;
  const alpha = 0.46 + Math.sin(time * 0.7 + p.phase) * 0.17;
  ctx.save();
  ctx.globalAlpha = newborn ? .95 : alpha;
  ctx.fillStyle = p.gold ? "#fff2c9" : "#fff9ff";
  ctx.shadowColor = p.gold ? "#f2ce92" : "#e7d5ff";
  ctx.shadowBlur = p.size > 1 ? 5 : 2;
  ctx.beginPath();
  ctx.arc(x, y, newborn ? p.size + .65 : p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  if (newborn) {
    const age = time - p.born;
    ctx.globalAlpha = Math.max(0, .65 * (1-age/1.2));
    ctx.strokeStyle = '#fff5df';
    ctx.lineWidth = 1;
    ctx.beginPath();ctx.arc(x,y,4+age*12,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha = .95;
  }
  if (p === stars[stars.length-1] && p.extra) {
    canvas.dataset.lastStarX = String(x);
    canvas.dataset.lastStarY = String(y);
  }
  if (p.size > 1.3) {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#fffa";
    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.lineTo(x + 3, y);
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x, y + 3);
    ctx.stroke();
  }
  ctx.restore();
}
// Imagens de produção com transparência, sem emojis ou desenhos de ícones.
const objects = new Image();
objects.src = new URL((globalThis.astroArte || (url => url))("../../../assets/imagens/aluno/inicial/objetos-realistas.png"), import.meta.url).href;
objects.onload = () => draw(0);
function objectSprite(index, x, y, size, angle = 0) {
  if (!objects.complete || !objects.naturalWidth) return;
  const crops = [[.008,.351],[.38,.635],[.66,.998]];
  const [left,right] = crops[index];
  const sourceWidth = (right-left)*objects.naturalWidth;
  const drawWidth = size*sourceWidth/objects.naturalHeight;
  ctx.save();
  ctx.imageSmoothingEnabled = document.documentElement.dataset.astroTema !== 'pixel';
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (index === 2) ctx.scale(-1,1);
  ctx.drawImage(objects, left*objects.naturalWidth, 0, sourceWidth, objects.naturalHeight, -drawWidth/2, -size/2, drawWidth, size);
  ctx.restore();
}
function draw(dt) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  stars.forEach((p) => star(p, dt));
  // Só um tipo de objeto cruza o céu por vez: a composição continua calma.
  const cycle = time % 120;
  ctx.save();
  recortarObjetosDoCeu(ctx, width, height, document.body.classList.contains('planets-ready'));
  ctx.globalAlpha = 0.62;
  if (cycle < 40) {
    const p = cycle / 40;
    objectSprite(0, width * (1.08 - p * 1.2), height * 0.16 + Math.sin(p * Math.PI) * 24, 105, -0.15);
  } else if (cycle < 70) {
    const p = (cycle - 40) / 30;
    objectSprite(1, width * (1.1 - p * 1.25), height * 0.25 + Math.sin(p * Math.PI) * 35, 58, time * .025);
  } else if (cycle < 105) {
    const p = (cycle - 70) / 35;
    objectSprite(2, width * (-0.1 + p * 1.2), height * 0.13 + Math.sin(p * Math.PI) * 25, 95, -.1);
  }
  ctx.restore();
}
function tick(now) {
  frame = 0;
  if (stopped()) return;
  const dt = Math.min(0.04, previous ? (now - previous) / 1000 : 1 / 60);
  previous = now;
  time += dt;
  draw(dt);
  frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = 0;
  pointer.x = pointer.y = -2000;
  draw(0);
  if (ctx && !stopped()) frame = requestAnimationFrame(tick);
}
window.addEventListener(
  "pointermove",
  (e) => {
    if (e.pointerType !== "touch") {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", () => {
  pointer.x = pointer.y = -2000;
});
document.addEventListener("click", (e) => {
  if (
    !ctx ||
    stopped() ||
    e.defaultPrevented ||
    e.target.closest(
      "a,button,input,select,textarea,label,dialog,nav,header,aside,.step-copy,.chat-panel",
    )
  )
    return;
  if (stars.length >= maxStars) stars.splice(initialCount, 1);
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX-rect.left) * width / rect.width;
  const y = (e.clientY-rect.top) * height / rect.height;
  stars.push(createStar(x, y, true));
  canvas.dataset.birthX = String(x);
  canvas.dataset.birthY = String(y);
  draw(0);
  canvas.dataset.stars = String(stars.length);
});
window.addEventListener("resize", resize, { passive: true });
document.addEventListener("visibilitychange", sync);
media.addEventListener("change", sync);
document.addEventListener("astrolearn:motion", sync);
new MutationObserver(sync).observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});
window.addEventListener("pagehide", () => {
  cancelAnimationFrame(frame);
  frame = 0;
});
window.addEventListener("pageshow", sync);
resize();
sync();

/* astro-tema-v2 */