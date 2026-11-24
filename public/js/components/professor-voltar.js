// Padroniza somente retornos existentes. Mantém href, parâmetros e eventos originais.
export function textoRetorno(link) {
  const text = (link.getAttribute('aria-label') || link.textContent || '').replace(/^[←‹↩\s]+/, '').trim();
  if (/login|sair/i.test(text)) return null;
  if (/^Todas as entregas$/i.test(text)) return 'Voltar às entregas';
  if (/^Atividades da turma$/i.test(text)) return 'Voltar às atividades';
  return /^Voltar\b/i.test(text) ? text : null;
}
function seta() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', 'M20 12H4m6-6-6 6 6 6'); svg.append(path); return svg;
}
export function padronizarRetornos(main) {
  const rows = new Set();
  for (const link of main.querySelectorAll('a')) {
    if (link.closest('nav, dialog, .sidebar')) continue;
    const label = textoRetorno(link);
    if (!label) continue;
    if (!link.classList.contains('teacher-return')) link.classList.add('teacher-return');
    if (link.getAttribute('aria-label') !== label) link.setAttribute('aria-label', label);
    if (!link.querySelector('.teacher-return-label')) {
      const text = document.createElement('span'); text.className = 'teacher-return-label'; text.textContent = label;
      link.replaceChildren(seta(), text);
    }
    let parent = link.parentElement;
    if (parent.tagName === 'HEADER' && link.classList.contains('home-fallback')) {
      parent.classList.add('teacher-return-header');
      continue;
    }
    const controlsOnly = [...parent.children].every(child => child.matches('a, button, select, input'));
    if (!parent.matches('#pageActions, .page-actions, .teacher-return-row') && !controlsOnly) {
      const row = document.createElement('div'); row.className = 'teacher-return-row';
      link.before(row); row.append(link); parent = row;
    }
    if (!parent.classList.contains('teacher-return-row')) parent.classList.add('teacher-return-row');
    rows.add(parent);
  }
  // A posição no DOM acompanha a ordem visual, inclusive para teclado e leitor de tela.
  for (const row of rows) {
    const backs = [...row.children].filter(child => child.classList.contains('teacher-return'));
    const ordered = [...row.children].filter(child => !backs.includes(child)).concat(backs);
    ordered.forEach((node, index) => {
      if (row.children[index] !== node) row.insertBefore(node, row.children[index] || null);
    });
  }
}
if (location.pathname.includes('/professor/')) {
  const main = document.querySelector('main');
  if (main) {
    const css = document.createElement('link'); css.rel = 'stylesheet';
    css.href = new URL('../../css/professor-voltar.css?v=1', import.meta.url).href; document.head.append(css);
    let frame = 0;
    const update = () => { frame = 0; padronizarRetornos(main); };
    new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(update); })
      .observe(main, { childList: true, subtree: true });
    update();
  }
}
