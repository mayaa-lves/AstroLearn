/* AstroLearn — apresentação pública. Não modifica contas, turmas ou permissões. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manualMotion = false;
  try { manualMotion = localStorage.getItem('astrolearn-landing-reduced-motion') === 'true'; } catch {}
  const noMotion = () => reduced.matches || manualMotion;
  const motionButton = $('motionToggle');
  function syncMotion() {
    document.body.classList.toggle('motion-off', noMotion());
    motionButton.setAttribute('aria-pressed', String(noMotion()));
    motionButton.textContent = reduced.matches ? 'Movimento reduzido pelo sistema' : manualMotion ? 'Ativar movimentos' : 'Reduzir movimentos';
    motionButton.disabled = reduced.matches;
    document.dispatchEvent(new Event('landing:motion'));
  }
  motionButton.addEventListener('click', () => {
    manualMotion = !manualMotion;
    try { localStorage.setItem('astrolearn-landing-reduced-motion', String(manualMotion)); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  syncMotion();
  $('year').textContent = String(new Date().getFullYear());

  const nav = $('siteNav'), toggle = $('mobileNavToggle');
  function closeNav() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir navegação'); }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeNav(); });
  matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeNav(); });

  if ('IntersectionObserver' in window && !noMotion()) {
    document.body.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold: .1});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const iconPaths = {
    science: 'M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10',
    technology: 'M5 4h14v12H5zM9 20h6m-3-4v4M8 8h8m-8 4h5',
    engineering: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1Z',
    art: 'M15 3 21 9 8 22H2v-6ZM12 6l6 6M3 15l6 6',
    math: 'M3 3h18v18H3ZM7 8h4M9 6v4m5-2h4M7 15l4 4m0-4-4 4m7-3h4m-4 2h4',
  };
  document.querySelectorAll('[data-icon]').forEach(el => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', iconPaths[el.dataset.icon]); svg.append(path); el.append(svg);
  });

  const dialog = $('infoDialog');
  let previousFocus;
  function openInfo(title, paragraphs, eyebrow = 'UMA NOVA DESCOBERTA') {
    previousFocus = document.activeElement;
    $('dialogTitle').textContent = title; $('dialogEyebrow').textContent = eyebrow;
    $('dialogBody').replaceChildren(...paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    dialog.showModal();
  }
  dialog.querySelectorAll('.dialog-close,.dialog-ok').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => previousFocus?.focus());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  const info = {
    privacidade: ['Privacidade deste site', [
      'Esta página de apresentação não possui formulário de coleta, checkout nem ferramenta de análise adicionada por esta implementação. As preferências de movimento são guardadas somente neste navegador.',
      'Ao acessar login, cadastro ou a plataforma, você passa a usar os serviços de conta e dados do projeto. As informações completas sobre responsáveis pelo tratamento, finalidades, retenção e direitos dos usuários ainda precisam ser definidas e publicadas pela equipe.',
      'Este resumo descreve a landing page e não substitui uma política de privacidade completa da plataforma.',
    ]],
    uso: ['Sobre o uso do AstroLearn', [
      'O AstroLearn é um projeto acadêmico em desenvolvimento no SENAI. Os planos e valores apresentados são propostas em validação; esta página não realiza contratação nem recebe pagamentos.',
      'O seletor Realista / Pixel art altera as ilustrações desta landing page. As páginas internas ainda mantêm seu estilo atual. Os recursos devem ser validados com a equipe antes de uma adoção pela escola.',
      'As condições completas de uso serão publicadas quando forem definidas pela equipe. Este texto não apresenta uma oferta comercial definitiva.',
    ]],
    acessibilidade: ['Uma experiência para explorar com autonomia', [
      'Use Tab e Shift + Tab para navegar, Enter ou Espaço para acionar botões e Escape para fechar esta janela. O menu e a comparação de estilos podem ser usados pelo teclado.',
      'A opção Reduzir movimentos fica no rodapé e a preferência do sistema também é respeitada. O conteúdo continua disponível sem animações.',
      'A pintura tem botões alternativos para comparar os estilos. Este projeto ainda não passou por uma auditoria formal de acessibilidade.',
    ]],
  };
  document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
    const [title, paragraphs] = info[button.dataset.info]; openInfo(title, paragraphs, 'INFORMAÇÕES DO PROJETO');
  }));

  const tabs = [$('studentTab'), $('teacherTab')];
  const panels = [$('studentPanel'), $('teacherPanel')];
  function selectTab(index, focus = false) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(next, true); }
    });
  });

  // Two aligned layers; the mask records strokes instead of moving a divider.
  const scene = $('paintScene'), canvas = $('paintCanvas'), ctx = canvas.getContext('2d');
  const cursor = $('brushCursor'), real = $('realScene'), pixel = new Image();
  const mask = document.createElement('canvas');
  mask.width = canvas.width; mask.height = canvas.height;
  const maskCtx = mask.getContext('2d');
  const reset = $('resetPaint'), complete = $('completePaint');
  let paintReady = false, pixelMode = false, lastPoint = null, drawingTouch = false, paintFrame = 0;
  function renderPaint() {
    paintFrame = 0;
    if (!paintReady || !ctx || !maskCtx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(pixel, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  function schedulePaint() { if (!paintFrame) paintFrame = requestAnimationFrame(renderPaint); }
  function beginReady() {
    if (paintReady || !real.complete || !real.naturalWidth || !pixel.complete || !pixel.naturalWidth || !ctx || !maskCtx) return;
    const ratio = real.naturalWidth / real.naturalHeight;
    // Keep a bounded drawing surface and the same aspect ratio on every screen.
    canvas.height = Math.round(canvas.width / ratio);
    mask.height = canvas.height;
    scene.style.aspectRatio = String(ratio);
    paintReady = true; reset.disabled = false; complete.disabled = false;
    // A quiet initial preview makes the two styles visible before painting.
    maskCtx.fillStyle = '#fff'; maskCtx.beginPath();
    maskCtx.moveTo(canvas.width * .72, 0);
    maskCtx.lineTo(canvas.width, 0); maskCtx.lineTo(canvas.width, canvas.height);
    maskCtx.lineTo(canvas.width * .58, canvas.height);
    maskCtx.lineTo(canvas.width * .63, canvas.height * .74);
    maskCtx.lineTo(canvas.width * .59, canvas.height * .52);
    maskCtx.lineTo(canvas.width * .68, canvas.height * .27);
    maskCtx.closePath(); maskCtx.fill();
    $('paintLoading').hidden = true; scene.setAttribute('aria-busy', 'false');
    renderPaint();
  }
  function imageFailed() {
    $('paintLoading').textContent = 'A comparação não carregou. Atualize a página para tentar novamente.';
    scene.setAttribute('aria-busy', 'false');
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    cursor.style.left = (event.clientX - rect.left) + 'px'; cursor.style.top = (event.clientY - rect.top) + 'px';
    return {x: (event.clientX - rect.left) / rect.width * canvas.width, y: (event.clientY - rect.top) / rect.height * canvas.height};
  }
  function paint(event) {
    if (!paintReady || pixelMode) return;
    const p = point(event), rect = canvas.getBoundingClientRect();
    const radius = Math.min(90, Math.max(38, 42 / rect.width * canvas.width));
    maskCtx.strokeStyle = '#fff'; maskCtx.fillStyle = '#fff'; maskCtx.lineWidth = radius * 2;
    maskCtx.lineCap = 'round'; maskCtx.lineJoin = 'round';
    if (lastPoint) { maskCtx.beginPath(); maskCtx.moveTo(lastPoint.x, lastPoint.y); maskCtx.lineTo(p.x, p.y); maskCtx.stroke(); }
    else { maskCtx.beginPath(); maskCtx.arc(p.x, p.y, radius, 0, Math.PI * 2); maskCtx.fill(); }
    lastPoint = p; cursor.classList.add('visible'); schedulePaint();
  }
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || drawingTouch) {
      if (drawingTouch) event.preventDefault();
      paint(event);
    }
  });
  canvas.addEventListener('pointerdown', event => {
    lastPoint = null;
    if (event.pointerType === 'touch') { drawingTouch = true; canvas.setPointerCapture(event.pointerId); }
    paint(event);
  });
  function endPointer() { lastPoint = null; drawingTouch = false; cursor.classList.remove('visible'); }
  canvas.addEventListener('pointerleave', endPointer);
  canvas.addEventListener('pointerup', event => { if (event.pointerType === 'touch') endPointer(); });
  canvas.addEventListener('pointercancel', endPointer);
  reset.addEventListener('click', () => {
    maskCtx.clearRect(0, 0, mask.width, mask.height); pixelMode = false; lastPoint = null;
    complete.textContent = 'Ver transformação ↗';
    $('paintStatus').textContent = 'Tudo pronto para pintar de novo.';
    renderPaint();
  });
  complete.addEventListener('click', () => {
    pixelMode = !pixelMode; lastPoint = null;
    maskCtx.clearRect(0, 0, mask.width, mask.height);
    if (pixelMode) maskCtx.fillRect(0, 0, mask.width, mask.height);
    complete.textContent = pixelMode ? (document.documentElement.dataset.visualStyle==='pixel'?'Ver pixel art ↗':'Ver realismo ↗') : 'Ver transformação ↗';
    const reversed=document.documentElement.dataset.visualStyle==='pixel';
    $('paintStatus').textContent = 'Cena completa em '+(pixelMode?(reversed?'realismo':'pixel art'):(reversed?'pixel art':'realismo'))+'.';
    cursor.classList.remove('visible'); renderPaint();
  });
  real.addEventListener('load', beginReady); real.addEventListener('error', imageFailed);
  pixel.onload = beginReady; pixel.onerror = imageFailed;
  pixel.src = 'public/assets/imagens/landing-v2/cena-pixel.webp';
  function syncPaintingStyle(){
    const reversed=document.documentElement.dataset.visualStyle==='pixel';
    paintReady=false;pixelMode=false;lastPoint=null;reset.disabled=true;complete.disabled=true;
    maskCtx.clearRect(0,0,mask.width,mask.height);ctx.clearRect(0,0,canvas.width,canvas.height);
    real.src='public/assets/imagens/landing-v2/'+(reversed?'cena-pixel.webp':'cena-realista.webp');
    pixel.src='public/assets/imagens/landing-v2/'+(reversed?'cena-realista.webp':'cena-pixel.webp');
    real.alt='Explorador de três olhos em um cenário espacial, em '+(reversed?'pixel art':'realismo')+'.';
    const labels=scene.querySelectorAll('.style-labels>span');
    labels[0].lastChild.textContent=reversed?' Pixel art':' Realismo';labels[1].lastChild.textContent=reversed?' Realismo':' Pixel art';
    complete.textContent='Ver transformação ↗';$('paintStatus').textContent='Pinte para revelar '+(reversed?'o realismo.':'a pixel art.');
    beginReady();
  }
  document.addEventListener('landing:style',syncPaintingStyle);
  if(document.documentElement.dataset.visualStyle==='pixel')syncPaintingStyle();else beginReady();
  // A gesture inside the scene paints on touch; scroll outside the scene.
  // The buttons provide the same comparison without requiring gestures.

  // Sparse decorative stars. Canvas is capped to the opening section, not the full document.
  const stars = $('landingStars'), starCtx = stars.getContext('2d');
  let width = 0, height = 0, starFrame = 0, lastTime = 0;
  const particles = [], mouse = {x: -1000, y: -1000};
  function resizeStars() {
    width = window.innerWidth; height = Math.min(850, window.innerHeight + 160);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    stars.width = Math.round(width * dpr); stars.height = Math.round(height * dpr);
    stars.style.height = height + 'px';
    if (starCtx) starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function newStar(x = Math.random() * width, y = Math.random() * height) { return {x, y, vx: .1 + Math.random() * .18, vy: .03 + Math.random() * .1, r: .6 + Math.random() * 1.5}; }
  resizeStars();
  for (let i = 0; i < 28; i++) particles.push(newStar());
  function drawStars(time = 0) {
    starFrame = 0;
    if (!starCtx || document.hidden || stars.hidden) return;
    const elapsed = Math.min(2, (time - lastTime) / 16.67 || 1); lastTime = time;
    starCtx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      if (!noMotion()) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 90) { p.x += dx / distance * .7; p.y += dy / distance * .7; }
        p.x = (p.x + p.vx * elapsed + width) % width; p.y = (p.y + p.vy * elapsed + height) % height;
      }
      starCtx.fillStyle = '#a998d24d'; starCtx.beginPath(); starCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); starCtx.fill();
    });
    if (!noMotion() && window.scrollY < height) starFrame = requestAnimationFrame(drawStars);
  }
  function refreshStars() { if (!starFrame && !document.hidden && !stars.hidden) { lastTime = performance.now(); starFrame = requestAnimationFrame(drawStars); } }
  window.addEventListener('resize', () => { resizeStars(); refreshStars(); }, {passive: true});
  document.addEventListener('pointermove', event => { mouse.x = event.clientX; mouse.y = event.clientY + scrollY; }, {passive: true});
  document.addEventListener('click', event => {
    if (event.target.closest('a,button,input,textarea,summary,dialog,.paint-scene') || event.clientY + scrollY > height) return;
    particles.push(newStar(event.clientX, event.clientY + scrollY)); if (particles.length > 65) particles.shift(); refreshStars();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && starFrame) { cancelAnimationFrame(starFrame); starFrame = 0; } else refreshStars(); });
  document.addEventListener('landing:motion', refreshStars);
  window.addEventListener('scroll', refreshStars, {passive: true});
  refreshStars();
})();
