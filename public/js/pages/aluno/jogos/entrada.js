import { sessaoObrigatoria } from '../../../services/conexao.js';
import { acompanharAcessoJogos } from '../../../services/jogos-acesso.js';

sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);
const entry = $('launchEntry');
const link = $('exploreGames');
let allowed = false;
let departing = false;
let flight;

function applyAccess(state) {
  allowed = state.liberado === true && !state.erro;
  if (!allowed) resetFlight();
  const view = allowed ? 'ready' : state.erro ? 'error' : 'blocked';
  entry.dataset.state = view;
  entry.setAttribute('aria-busy', 'false');
  document.body.classList.toggle('is-blocked', !allowed);
  link.setAttribute('aria-disabled', String(!allowed));
  link.tabIndex = allowed ? 0 : -1;
  if (allowed) link.setAttribute('href', 'galaxia.html');
  else link.removeAttribute('href');
  $('launchLock').hidden = allowed;
  $('launchArrow').hidden = !allowed;
  $('retryAccess').hidden = allowed;
  $('retryAccess').disabled = false;
  $('entryEyebrow').textContent = allowed ? 'UMA NOVA DESCOBERTA' : state.erro ? 'VAMOS TENTAR NOVAMENTE' : 'AGUARDANDO LIBERAÇÃO';
  // Static line break belongs only to the approved unlocked heading.
  $('entryTitle').replaceChildren();
  if (allowed) $('entryTitle').append('Pronto para', document.createElement('br'), 'explorar?');
  else $('entryTitle').textContent = state.erro ? 'Não foi possível consultar o acesso.' : 'Em breve, uma nova aventura.';
  $('entryDescription').textContent = allowed
    ? 'Aprenda e divirta-se em uma aventura pelo espaço.'
    : state.erro ? 'Tente consultar novamente para saber se os jogos estão disponíveis.'
      : 'Seu professor precisa liberar os jogos da turma para você explorar.';
  $('launchLabel').textContent = allowed ? 'Explorar jogos' : state.erro ? 'Acesso indisponível' : 'Aguardando liberação';
  $('accessState').textContent = allowed ? '' : state.mensagem || 'Aguarde a liberação da sua turma.';
}

function resetFlight() {
  clearTimeout(flight);
  departing = false;
  entry.classList.remove('is-launching');
}

$('retryAccess').addEventListener('click', () => {
  $('retryAccess').disabled = true;
  entry.dataset.state = 'loading';
  entry.setAttribute('aria-busy', 'true');
  $('launchLabel').textContent = 'Consultando acesso…';
  $('accessState').textContent = 'Consultando a liberação da sua turma…';
  document.dispatchEvent(new Event('astrolearn:refresh-games-access'));
});

link.addEventListener('click', event => {
  if (!allowed || departing) { event.preventDefault(); return; }
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('astro-motion-off')) return;
  event.preventDefault();
  departing = true;
  entry.classList.add('is-launching');
  flight = setTimeout(() => { if (allowed) location.assign(link.href); }, 380);
});
window.addEventListener('pageshow', resetFlight);
window.addEventListener('pagehide', resetFlight);
acompanharAcessoJogos(applyAccess);
