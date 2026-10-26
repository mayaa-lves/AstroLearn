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

function controls() {
  check.disabled = busy || !ready;
  save.disabled = busy || !ready || check.checked === confirmado;
  refresh.disabled = busy || !sala;
  form.setAttribute('aria-busy', String(busy));
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
    throw new Error('O servidor não retornou jogos_bloqueados como true ou false. Consulte novamente e avise o responsável pelo backend.');
  }
  confirmado = !bloqueado;
  check.checked = confirmado;
  ready = true;
  message.textContent = bloqueado
    ? 'Jogos bloqueados para esta turma. Configuração confirmada pelo servidor.'
    : 'Jogos liberados para esta turma. Configuração confirmada pelo servidor.';
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
