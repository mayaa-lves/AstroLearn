/* Estilo visual compartilhado com a landing. Não altera autenticação ou tokens. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'astrolearn-landing-style';
  const saved = () => { try { return localStorage.getItem(key) === 'pixel' ? 'pixel' : 'realista'; } catch { return 'realista'; } };
  root.dataset.visualStyle = saved();
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('authStyleToggle');
    if (!button) return;
    const label = button.querySelector('[data-style-label]');
    const extras = [...document.querySelectorAll('.rocket img, .planet-light img')];
    const source = new Map(extras.map(img => [img, img.getAttribute('src')]));
    const pixelImages = new Map();
    const status = document.createElement('span');
    status.className = 'auth-theme-status'; status.setAttribute('role', 'status');
    button.after(status);
    async function pixelImage(img) {
      if (pixelImages.has(img)) return pixelImages.get(img);
      try {
        if (!img.complete) await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = Math.max(1, Math.round(64 * img.naturalHeight / img.naturalWidth));
        const ctx = canvas.getContext('2d'); if (!ctx) return null;
        ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/png'); pixelImages.set(img, url); return url;
      } catch { return null; }
    }
    function apply(mode, persist = false) {
      root.dataset.visualStyle = mode;
      const pixel = mode === 'pixel';
      button.setAttribute('aria-pressed', String(pixel));
      button.setAttribute('aria-label', pixel ? 'Ativar estilo realista' : 'Ativar estilo pixel art');
      label.textContent = pixel ? 'Realista' : 'Pixel art';
      if (persist) try { localStorage.setItem(key, mode); } catch {}
      extras.forEach(async img => {
        if (!pixel) { img.src = source.get(img); return; }
        const url = await pixelImage(img);
        if (url && root.dataset.visualStyle === 'pixel') img.src = url;
      });
      document.dispatchEvent(new Event('astrolearn:visual-style'));
    }
    apply(saved());
    let busy = false;
    button.addEventListener('click', async () => {
      if (busy) return;
      const next = root.dataset.visualStyle === 'pixel' ? 'realista' : 'pixel';
      status.textContent = '';
      if (next === 'pixel') {
        busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true');
        const base = '../public/assets/imagens/login/pixel/';
        const files = document.body.classList.contains('cadastro-page')
          ? ['observatory-neutral.webp', 'observatory-shy.webp']
          : document.body.classList.contains('login-page') ? ['scene.webp', 'alien.webp'] : ['scene.webp'];
        try {
          await Promise.all(files.map(file => new Promise((resolve, reject) => {
            const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = base + file;
          })));
        } catch {
          status.textContent = 'Não foi possível carregar o estilo. Tente novamente.';
          busy = false; button.disabled = false; button.removeAttribute('aria-busy'); return;
        }
        busy = false; button.disabled = false; button.removeAttribute('aria-busy');
      }
      apply(next, true);
    });
    window.addEventListener('storage', event => { if (event.key === key) apply(saved()); });
  }, { once: true });
})();
