import { notificacoes, lerNotificacoes, destinoNotificacao } from '../../services/comunicacao.js';
const feed = document.getElementById('notificationFeed');
const status = document.getElementById('notificationStatus');
const bell = document.getElementById('notifications');
const refresh = document.getElementById('refreshNotifications');
const emptyTemplate = feed.querySelector('.notification-empty')?.cloneNode(true);
const reading = new Set();
let rows = [], filter = 'all', busy = false, loaded = false, revision = 0, snapshot = '';
const badge = document.createElement('span');
badge.className = 'notification-count'; badge.hidden = true; badge.setAttribute('aria-hidden', 'true'); bell.append(badge);
const make = (tag, text = '', className = '') => {
  const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
};
function syncBadge() {
  const count = rows.filter(notice => !notice.lida_em).length;
  badge.textContent = count > 99 ? '99+' : String(count); badge.hidden = !count;
  bell.setAttribute('aria-label', count ? 'Notificações: ' + count + ' não lidas' : 'Notificações: nenhum aviso não lido');
}
function emptyState(title, description) {
  const box = emptyTemplate ? emptyTemplate.cloneNode(true) : make('div', '', 'notification-empty');
  const heading = box.querySelector('h3') || make('h3');
  const copy = box.querySelector('p') || make('p');
  heading.textContent = title; copy.textContent = description;
  if (!heading.parentElement) box.append(heading);
  if (!copy.parentElement) box.append(copy);
  box.setAttribute('role', 'listitem'); feed.replaceChildren(box);
}
function icon() {
  const box = make('span', '', 'notice-icon'); box.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', 'M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4');
  svg.append(path); box.append(svg); return box;
}
async function markRead(notice, button) {
  if (reading.has(notice.id)) return;
  reading.add(notice.id); revision++; button.disabled = true; button.textContent = 'Salvando…';
  try {
    await lerNotificacoes([notice.id]);
    const readAt = new Date().toISOString();
    rows = rows.map(row => row.id === notice.id ? { ...row, lida_em: readAt } : row);
    snapshot = ''; render(); syncBadge();
    status.textContent = 'Aviso marcado como lido.';
    // A ação desaparece depois da leitura; mantém um destino de foco acessível.
    const next = feed.querySelector('[data-notice-id="' + CSS.escape(String(notice.id)) + '"]');
    (next || feed).focus();
  } catch (error) {
    status.textContent = error.message || 'Não foi possível marcar o aviso como lido. Tente novamente.';
    button.disabled = false; button.textContent = 'Marcar como lida';
  } finally { reading.delete(notice.id); }
}
function render() {
  const shown = rows.filter(notice => filter !== 'unread' || !notice.lida_em);
  if (!shown.length) {
    emptyState(filter === 'unread' ? 'Você está em dia!' : 'Nenhum aviso por enquanto',
      filter === 'unread' ? 'Quando chegar uma novidade, ela aparecerá aqui.' : 'Correções e novidades da turma aparecerão neste painel.');
    return;
  }
  const cards = shown.map(notice => {
    const article = make('article', '', 'student-notice'); article.setAttribute('role', 'listitem'); article.tabIndex = -1;
    article.dataset.noticeId = String(notice.id); article.dataset.unread = String(!notice.lida_em);
    const copy = make('div', '', 'notice-copy');
    const meta = make('div', '', 'notice-meta');
    if (!notice.lida_em) meta.append(make('span', 'Não lida', 'notice-unread'));
    const date = new Date(notice.criado_em);
    if (notice.criado_em && !Number.isNaN(date.valueOf())) {
      const time = make('time', date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
      time.dateTime = date.toISOString(); meta.append(time);
    }
    copy.append(meta, make('h3', notice.titulo || 'Aviso da turma'), make('p', notice.mensagem || ''));
    const controls = make('div', '', 'notice-actions');
    let destination = null;
    try { destination = destinoNotificacao(notice, 'aluno'); } catch { /* Link inválido: ainda permite ler o aviso. */ }
    if (destination) {
      const open = make('a', 'Abrir →', 'notice-open'); open.href = destination; controls.append(open);
    }
    if (!notice.lida_em) {
      const button = make('button', 'Marcar como lida'); button.type = 'button';
      button.disabled = reading.has(notice.id); button.onclick = () => markRead(notice, button); controls.append(button);
    }
    if (controls.children.length) copy.append(controls);
    article.append(icon(), copy); return article;
  });
  feed.replaceChildren(...cards);
}
async function load({ manual = false } = {}) {
  if (busy || document.hidden || reading.size) return;
  const current = revision;
  busy = true; refresh.disabled = true; feed.setAttribute('aria-busy', 'true');
  if (manual || !loaded) status.textContent = 'Buscando avisos…';
  if (!loaded) emptyState('Buscando seus avisos…', 'Só um instante.');
  try {
    const data = await notificacoes();
    if (current !== revision) return;
    const next = (data.notificacoes || []).filter(notice => notice && notice.id);
    const nextSnapshot = JSON.stringify(next);
    rows = next;
    // Evita desmontar os botões sob o foco a cada atualização automática.
    if (snapshot !== nextSnapshot || !loaded) { snapshot = nextSnapshot; render(); }
    loaded = true; syncBadge();
    if (manual || status.textContent === 'Buscando avisos…') status.textContent = 'Avisos atualizados.';
  } catch (error) {
    status.textContent = error.message || 'Não foi possível atualizar os avisos.';
    if (!loaded) emptyState('Não foi possível carregar', 'Use “Atualizar avisos” para tentar novamente.');
    // Dados confirmados anteriormente permanecem visíveis se houver uma falha de rede.
  } finally { busy = false; refresh.disabled = false; feed.setAttribute('aria-busy', 'false'); }
}
document.querySelectorAll('[data-notification-filter]').forEach(button => {
  button.onclick = () => {
    filter = button.dataset.notificationFilter;
    document.querySelectorAll('[data-notification-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    if (loaded) render();
  };
});
refresh.onclick = () => load({ manual: true });
window.addEventListener('astro-notifications-open', () => load({ manual: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
load();
let poll = setInterval(() => load(), 30000);
window.addEventListener('pagehide', () => { clearInterval(poll); poll = 0; });
window.addEventListener('pageshow', event => {
  if (!poll) poll = setInterval(() => load(), 30000);
  if (event.persisted) load();
});
