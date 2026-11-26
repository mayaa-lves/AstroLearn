import {api, sessaoObrigatoria} from '../../services/conexao.js';

sessaoObrigatoria('professor');
const sala = new URLSearchParams(location.search).get('sala');
const message = document.getElementById('accessMessage');
const check = document.getElementById('allowGames');
const save = document.getElementById('saveAccess');
const refresh = document.getElementById('refreshAccess');
const form = document.getElementById('accessForm');
const route = '/api/professor/salas/' + encodeURIComponent(sala || '');
let busy = false, ready = false, confirmado = null;
const badge = document.getElementById('gamesAccessBadge');
const hint = document.getElementById('gamesAccessHint');
const roomLink = document.getElementById('gamesRoomLink');
roomLink.href = sala ? 'turma.html?sala=' + encodeURIComponent(sala) : 'home.html';
const backLink = document.getElementById('gamesBackLink');
backLink.href = roomLink.href;
backLink.textContent = sala ? '← Voltar à sala' : '← Voltar às turmas';

function controls() {
  check.disabled = busy || !ready;
  save.disabled = busy || !ready || check.checked === confirmado;
  refresh.disabled = busy || !sala;
  form.setAttribute('aria-busy', String(busy));
  const pending = ready && check.checked !== confirmado;
  badge.dataset.state = busy ? 'loading' : pending ? 'pending' : !ready ? 'error' : confirmado ? 'on' : 'off';
  badge.textContent = busy ? (ready ? 'Salvando…' : 'Consultando…')
    : pending ? 'Não salvo' : !ready ? 'Indisponível' : confirmado ? 'Liberado' : 'Bloqueado';
  hint.textContent = confirmado === null
    ? 'Consulte e ajuste o acesso dos alunos desta turma.'
    : confirmado ? 'Os alunos desta turma podem acessar a área de jogos.'
      : 'O acesso aos jogos está bloqueado para esta turma.';
}
function failure(error) {
  ready = false;
  if (confirmado !== null) check.checked = confirmado;
  message.textContent = error.status === 404
    ? 'Turma não encontrada ou recurso ainda não publicado. Consulte novamente.'
    : error.message || 'Não foi possível consultar a configuração.';
}
function confirmar(bloqueado) {
  if (typeof bloqueado !== 'boolean') {
    throw new Error('Não foi possível confirmar o acesso aos jogos. Tente atualizar.');
  }
  confirmado = !bloqueado;
  check.checked = confirmado;
  ready = true;
  message.textContent = bloqueado
    ? 'Jogos bloqueados para esta turma.'
    : 'Jogos liberados para esta turma.';
}
async function load() {
  if (busy) return;
  if (!sala) {
    message.textContent = 'Abra uma turma antes de configurar os jogos.';
    controls();
    return;
  }
  busy = true; ready = false;
  message.textContent = 'Consultando configuração da turma…';
  controls();
  try {
    const data = await api(route);
    confirmar(data?.sala?.jogos_bloqueados);
    if (data?.sala?.nome) roomLink.textContent = data.sala.nome;
  } catch (error) { failure(error); }
  finally { busy = false; controls(); }
}
check.addEventListener('change', controls);
refresh.addEventListener('click', load);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !ready || check.checked === confirmado) return;
  const bloqueado = !check.checked;
  busy = true;
  message.textContent = 'Salvando configuração…';
  controls();
  try {
    const data = await api(route + '/toggle-jogos', 'PATCH', {jogos_bloqueados: bloqueado});
    confirmar(data?.jogos_bloqueados);
  } catch (error) { failure(error); }
  finally { busy = false; controls(); }
});
load();
