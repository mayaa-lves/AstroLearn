import { sessaoObrigatoria, api } from '../../services/conexao.js';
import { consultarAtividade, enviarEntrega, validarArquivos, urlSegura, normalizarAnexo, ACCEPT_ARQUIVOS, AVISO_UPLOAD, formatarPrazo } from '../../services/atividades.js';

const params = new URLSearchParams(location.search);
const preview = params.get('preview') === '1';
sessaoObrigatoria(preview ? 'professor' : 'aluno');
const missionId = params.get('atividade');
const $ = id => document.getElementById(id);
const form = $('entrega-form'), submit = $('submitDelivery'), answer = $('resposta'), input = $('arquivos');
const review = $('revisao-dialog'), confirm = $('confirmDemoSubmission');
let data = null, selected = [], busy = false, loading = true, objectURLs = [];
const node = (tag, text = '', cls = '') => { const el = document.createElement(tag); el.textContent = text; el.className = cls; return el; };
const text = (id, value) => { if ($(id)) $(id).textContent = value; };
function link(raw, title) {
  const url = urlSegura(raw);
  if (!url) return null;
  const el = node('a', title, 'resource'); el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer';
  return el;
}

$('criteriaList').replaceChildren();
$('atividade-passos').replaceChildren(); $('atividade-passos').hidden = true;
$('example').closest('.learning-tip').hidden = true;
$('materials').querySelectorAll('.resource').forEach(el => el.remove());
const materialRows = node('div', '', 'activity-material-rows'); $('materials').append(materialRows);
const saved = node('section', '', 'saved-submission'); saved.id = 'savedDelivery'; saved.setAttribute('aria-label', 'Entrega registrada');
form.before(saved);
const reload = node('button', 'Atualizar atividade', 'text-button'); reload.type = 'button';
reload.onclick = () => load(); form.before(reload);
input.accept = ACCEPT_ARQUIVOS;
text('fileHint', 'Até 3 arquivos: PDF, JPG/PNG, DOCX, PPTX, XLSX, ZIP, TXT, PY ou IPYNB. ' + AVISO_UPLOAD);
answer.placeholder = 'Escreva sua resposta conforme a orientação do professor…';
text('revisao-titulo', 'Confira sua entrega');
text('demoSubmissionStatus', '');
confirm.textContent = 'Confirmar e enviar';
review.querySelector('.preview-note').textContent = 'Confira sua resposta e os arquivos. Ao confirmar, a entrega será enviada ao professor.';

function reason() {
  if (preview) return 'Prévia do professor: somente leitura, sem entrega.';
  if (loading) return 'Carregando atividade…';
  if (!data) return 'Não foi possível carregar a atividade. Use Atualizar atividade para tentar novamente.';
  if (data.missao.status === 'rascunho') return 'O professor ainda está preparando esta atividade.';
  if (data.bloqueada || data.missao.desbloqueada === false) return 'Esta missão está bloqueada. Conclua as anteriores e aguarde a correção do professor.';
  if (data.progresso?.status === 'corrigido') return 'Esta entrega já foi corrigida e não pode ser reenviada.';
  if (data.missao.modalidade === 'equipe' && !data.equipe) return 'Você precisa estar em uma equipe deste período. Peça ao professor para incluir você.';
  return '';
}
function controls() {
  const blocked = !!reason() || busy;
  form.setAttribute('aria-busy', String(busy || loading));
  [answer, input, $('adicionar-arquivos'), submit].forEach(el => el.disabled = blocked);
  reload.disabled = busy || loading;
  confirm.disabled = blocked;
  submit.textContent = busy ? 'Enviando…' : data?.progresso?.status === 'entregue' ? 'Revisar reenvio' : 'Revisar entrega';
  $('anexos-dropzone').classList.toggle('disabled', blocked);
}
function feedback(prog) {
  const target = document.querySelector('.feedback-card > div');
  if (!target) return;
  target.querySelectorAll('p').forEach(el => el.remove());
  target.parentElement.setAttribute('aria-live', 'polite');
  if (preview) target.append(node('p', 'Prévia do professor: sem retorno de aluno.'));
  else if (prog?.status === 'corrigido') target.append(node('p', 'Nota: ' + (prog.nota ?? 'Não informada')), node('p', prog.comentario_professor || 'O professor não adicionou um comentário.'));
  else target.append(node('p', prog?.status === 'entregue' ? 'Entrega registrada. Aguardando a correção do professor.' : 'A nota e a devolutiva aparecerão aqui após a correção.'));
}
function renderSaved() {
  saved.replaceChildren(); saved.hidden = !data?.progresso;
  if (!data?.progresso) return;
  const prog = data.progresso;
  saved.append(node('h3', 'Trabalho enviado'), node('p', prog.texto_entrega || 'Sem resposta em texto.', 'submission-text'));
  if (prog.entregue_em) saved.append(node('p', 'Enviado em ' + new Date(prog.entregue_em).toLocaleString('pt-BR'), 'file-hint'));
  const anexos = data.anexos_entrega?.length ? data.anexos_entrega : prog.url_entrega ? [{ url: prog.url_entrega, nome_arquivo: 'Arquivo da entrega' }] : [];
  for (const raw of anexos) {
    const file = normalizarAnexo(raw), a = link(file.url, 'Abrir ' + file.name);
    if (a) saved.append(a);
  }
}
function renderMaterials() {
  materialRows.replaceChildren();
  const own = link(data.missao.anexo_url, 'Abrir material da atividade');
  if (own) materialRows.append(own);
  for (const material of data.materiais || []) {
    const card = node('article', '', 'activity-material');
    card.append(node('h3', material.titulo || 'Material de apoio'), node('p', material.descricao || '', 'submission-text'));
    for (const raw of material.links || []) {
      const a = link(typeof raw === 'string' ? raw : raw.url, typeof raw === 'string' ? 'Abrir link' : raw.titulo || 'Abrir link');
      if (a) card.append(a);
    }
    const attachment = link(material.anexo_url, material.anexo_nome || 'Abrir anexo');
    if (attachment) card.append(attachment);
    materialRows.append(card);
  }
  if (!materialRows.children.length) materialRows.append(node('p', 'O professor não anexou materiais nesta atividade.', 'file-hint'));
}
function renderFiles() {
  objectURLs.forEach(url => URL.revokeObjectURL(url)); objectURLs = [];
  $('anexos-lista').replaceChildren();
  selected.forEach((file, index) => {
    const row = node('li', '', 'attachment');
    if (/\.(png|jpe?g)$/i.test(file.name)) {
      const img = document.createElement('img'), url = URL.createObjectURL(file); objectURLs.push(url);
      img.src = url; img.alt = ''; img.className = 'attachment-preview'; row.append(img);
    }
    row.append(node('span', file.name + ' · ' + Math.max(1, Math.ceil(file.size / 1024)) + ' KB'));
    const remove = node('button', 'Remover', 'text-button'); remove.type = 'button'; remove.disabled = busy;
    remove.setAttribute('aria-label', 'Retirar ' + file.name + ' da seleção');
    remove.onclick = () => { selected.splice(index, 1); input.value = ''; renderFiles(); text('anexos-status', ''); };
    row.append(remove); $('anexos-lista').append(row);
  });
}
function choose(files) {
  if (reason() || busy) return;
  try { selected = validarArquivos([...selected, ...files]); text('anexos-status', ''); renderFiles(); }
  catch (err) { text('anexos-status', err.message); }
  input.value = '';
}
$('adicionar-arquivos').onclick = () => input.click();
input.onchange = () => choose(input.files);
const drop = $('anexos-dropzone');
for (const event of ['dragenter', 'dragover']) drop.addEventListener(event, e => { e.preventDefault(); if (!reason() && !busy) drop.classList.add('dragover'); });
drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); choose(e.dataTransfer.files); });
answer.oninput = () => text('anexos-contador', answer.value.length.toLocaleString('pt-BR') + ' / 10.000');

async function load() {
  if (busy) return false;
  loading = true; controls(); text('entrega-status', 'Carregando atividade…');
  try {
    if (!missionId) throw new Error('Abra uma atividade pela trilha da sua turma.');
    if (preview) {
      const room = await api('/api/professor/salas/' + encodeURIComponent(params.get('sala') || ''));
      const mission = room.missoes.find(item => item.id === missionId);
      if (!mission) throw new Error('Atividade não encontrada nesta turma.');
      data = { missao: { ...mission, salas: room.sala }, bloqueada: true, materiais: [], progresso: null };
    } else data = await consultarAtividade(missionId);
    const mission = data.missao;
    document.title = mission.titulo + ' · AstroLearn'; text('atividade-titulo', mission.titulo);
    text('atividade-resumo', mission.salas?.nome || 'Atividade da turma');
    text('atividade-objetivo', mission.descricao || (mission.status === 'rascunho' ? 'Conteúdo em preparação.' : 'Aguarde as orientações do professor.'));
    text('missionNumber', 'MISSÃO ' + (mission.ordem ?? ''));
    text('missionType', mission.modalidade === 'equipe' ? 'Entrega em equipe' : 'Entrega individual');
    text('missionDuration', mission.data_limite ? 'Prazo: ' + formatarPrazo(mission.data_limite) : 'Sem prazo definido');
    $('criteriaList').replaceChildren(node('li', mission.o_que_entregar || 'Siga as orientações do professor para preparar sua entrega.', 'submission-text'));
    $('criteriaList').closest('details').open = true;
    feedback(data.progresso); renderMaterials(); renderSaved();
    // Recarregar não apaga um texto ainda não enviado nesta visita.
    if (!answer.value) answer.value = data.progresso?.texto_entrega || '';
    answer.oninput();
    text('deliveryStatus', data.progresso?.status === 'corrigido' ? 'Corrigida' : data.progresso?.status === 'entregue' ? 'Aguardando correção' : data.bloqueada ? 'Bloqueada' : 'Não enviada');
    loading = false;
    let notice = reason();
    if (!notice) {
      notice = mission.modalidade === 'equipe' ? 'A entrega será registrada para os integrantes de ' + (data.equipe?.nome || 'sua equipe') + '.' : 'Sua resposta e seus arquivos serão enviados ao professor.';
      if (data.progresso?.status === 'entregue') notice += ' Você pode reenviar antes da correção. Sem novos arquivos, os anexos anteriores são mantidos; ao enviar novos arquivos, a lista anterior é substituída por completo.';
    }
    text('deliveryNotice', notice); text('entrega-status', reason() || ''); return true;
  } catch (err) {
    data = null; text('entrega-status', err.message); text('deliveryNotice', 'Não foi possível consultar a atividade.'); feedback(null); return false;
  } finally { loading = false; controls(); }
}
form.onsubmit = event => {
  event.preventDefault();
  if (reason() || busy) return;
  try {
    validarArquivos(selected);
    if (!answer.value.trim() && !selected.length) throw new Error('Escreva uma resposta ou adicione pelo menos um arquivo.');
    text('entrega-status', ''); text('revisao-resposta', answer.value.trim() || 'Entrega somente com arquivos.');
    $('revisao-arquivos').replaceChildren(...selected.map(file => node('li', file.name)));
    if (!selected.length) $('revisao-arquivos').append(node('li', data.anexos_entrega?.length ? 'Os anexos já enviados serão mantidos.' : 'Sem novos arquivos.'));
    text('demoSubmissionStatus', data.missao.modalidade === 'equipe' ? 'Um envio vale para todos os integrantes da sua equipe neste período.' : 'Confirme para enviar seu trabalho ao professor.');
    if (!review.open) review.showModal();
  } catch (err) { text('entrega-status', err.message); }
};
confirm.onclick = async () => {
  if (reason() || busy) return;
  busy = true; controls(); renderFiles(); text('demoSubmissionStatus', 'Enviando ao professor…');
  // Não repetir automaticamente: uma falha de rede pode ocorrer depois de o servidor salvar.
  try {
    const result = await enviarEntrega(missionId, answer.value, selected);
    review.close(); selected = []; renderFiles(); busy = false;
    const refreshed = await load();
    text('entrega-status', refreshed ? (result?.message || 'Entrega enviada. Aguarde a correção do professor.') + (result?.atrasado ? ' Envio registrado após o prazo.' : '') : 'Entrega salva, mas não foi possível atualizar a consulta. Use Atualizar atividade.');
  } catch (err) {
    text('demoSubmissionStatus', err.message + (!err.status ? ' Confira a atividade antes de repetir o envio.' : ''));
  } finally { busy = false; controls(); renderFiles(); }
};
review.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
review.querySelectorAll('form[method="dialog"]').forEach(form => form.addEventListener('submit', event => { if (busy) event.preventDefault(); }));
window.addEventListener('pagehide', () => objectURLs.forEach(url => URL.revokeObjectURL(url)));
feedback(null);
text('deliveryNotice', 'Consultando os dados da atividade…');
text('atividade-titulo', 'Carregando atividade…');
text('atividade-objetivo', 'Consultando as orientações do professor…');
load();
