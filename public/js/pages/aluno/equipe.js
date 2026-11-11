import {normalizarIntegrantes,pintarRetrato} from '../../components/equipe-avatares.js';
import { api, sessaoObrigatoria } from '../../services/conexao.js';
import { dashboard } from '../../services/aluno.js';

const session = sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);

const statusNames = {
  todo: 'A fazer',
  doing: 'Em andamento',
  done: 'Concluída'
};

const kindNames = {
  idea: 'Ideia',
  notice: 'Aviso',
  agreement: 'Combinado'
};

const emptyDraft = () => ({
  version: 1,
  tasks: [],
  notes: []
});

let team = null;
let members = [];
let draft = emptyDraft();
let editingNote = null;
let mutating = false;
let busy = false;
let ready = false;
let editingTask = null;
let removal = null;
let toastTimer;

const openers = new WeakMap();

const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  Date.now().toString(36) + Math.random().toString(36).slice(2);

function element(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function portrait(member, className = '') {
  return pintarRetrato(element('span'), member, className);
}

function iconButton(label, path) {
  const button = element('button', '', 'icon-button');

  button.type = 'button';
  button.setAttribute('aria-label', label);

  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="${path}"/>
    </svg>
  `;

  return button;
}

function tell(message) {
  clearTimeout(toastTimer);

  $('teamToast').textContent = message;
  $('teamToast').hidden = false;

  toastTimer = setTimeout(() => {
    $('teamToast').hidden = true;
  }, 2800);
}

function show(dialog, trigger) {
  openers.set(dialog, trigger || document.activeElement);

  if (!dialog.open) {
    dialog.showModal();
  }

  (
    dialog.querySelector('input') ||
    dialog.querySelector('button')
  )?.focus();
}

function controls(enabled) {
  ['organize', 'idea', 'noteType', 'saveNote'].forEach(name => {
    $(name).disabled = !enabled;
  });
}

const serverStatus = {todo:'pendente', doing:'em_andamento', done:'concluida'};
const localStatus = {pendente:'todo', em_andamento:'doing', concluida:'done'};
const teamRoute = suffix => '/api/aluno/equipes/' + encodeURIComponent(team.id) + '/' + suffix;
function taskFromServer(t) {
  if (!t || typeof t.id !== 'string') throw new Error('A tarefa não foi confirmada pelo servidor. Atualize para conferir.');
  return {id:t.id,title:t.titulo,owner:t.responsavel_id,status:localStatus[t.status] || 'todo',prazo:t.prazo};
}
function noteFromServer(n) {
  if (!n || typeof n.id !== 'string') throw new Error('O aviso não foi confirmado pelo servidor. Atualize para conferir.');
  return {id:n.id,text:n.texto,kind:'notice',createdAt:n.criado_em,author:n.autor_id,authorName:n.autor?.nome || 'Integrante'};
}
async function refreshShared() {
  const [tasks,notes] = await Promise.all([api(teamRoute('tarefas')),api(teamRoute('avisos'))]);
  draft.tasks = (tasks.tarefas || []).map(taskFromServer);
  draft.notes = (notes.avisos || []).map(noteFromServer);
}
async function mutate(action, onSuccess) {
  if (mutating || busy || !ready) { tell('Aguarde a atualização da equipe e tente novamente.'); return false; }
  mutating = true; controls(false);
  try {
    const data = await action();
    if (!data || typeof data !== 'object') throw new Error('O servidor não confirmou a alteração. Atualize a equipe para conferir.');
    onSuccess(data);
    renderWorkspace();
    $('storageNotice').textContent = '';
    return true;
  } catch (error) {
    $('storageNotice').textContent = error.message;
    tell('Não foi possível confirmar a alteração. Atualize antes de tentar novamente.');
    return false;
  } finally {mutating=false; controls(ready);}
}

function ownerName(owner) {
  const member = members.find(item => item.id === owner);

  return !member
    ? 'Integrante indisponível'
    : owner === session.usuario.id
      ? 'Você'
      : member.nome;
}

/* Integrantes reais da equipe. */
function showMember(member, index, trigger) {
  pintarRetrato($('memberPortrait'),member);

  $('memberTitle').textContent =
    member.nome +
    (member.id === session.usuario.id ? ' (você)' : '');

  $('memberTasks').replaceChildren();

  const tasks = draft.tasks.filter(
    task => task.owner === member.id
  );

  tasks.forEach(task => {
    $('memberTasks').append(
      element(
        'li',
        `${task.title} · ${statusNames[task.status]}`
      )
    );
  });

  if (!tasks.length) {
    $('memberTasks').append(
      element(
        'li',
        'Sem responsabilidades da equipe.'
      )
    );
  }

  show($('memberDialog'), trigger);
}

function renderMembers() {
  $('members').replaceChildren();

  members.forEach((member, index) => {
    const button = element('button', '', 'member');

    button.type = 'button';

    button.setAttribute(
      'aria-label',
      `Ver tarefas de ${member.nome}`
    );

    const copy = element('span', '', 'member-copy');

    const count = draft.tasks.filter(
      task => task.owner === member.id
    ).length;

    copy.append(
      element(
        'strong',
        member.id === session.usuario.id
          ? member.nome + ' (você)'
          : member.nome
      ),
      element(
        'span',
        count
          ? `${count} ${count === 1 ? 'tarefa' : 'tarefas'} na equipe`
          : 'Integrante da equipe'
      )
    );

    button.append(portrait(member), copy);

    button.addEventListener('click', () => {
      showMember(member, index, button);
    });

    $('members').append(button);
  });
}

/* Tarefas do rascunho pessoal. */
function openTask(task, trigger) {
  if (!ready) return;

  if (!task && draft.tasks.length >= 60) {
    tell(
      'Sua equipe já tem 60 tarefas. Remova uma antes de adicionar outra.'
    );
    return;
  }

  editingTask = task?.id || null;

  $('taskDialogTitle').textContent =
    task ? 'Editar tarefa' : 'Adicionar tarefa';

  $('taskTitle').value = task?.title || '';

  $('taskOwner').replaceChildren(
    element('option', 'Selecione um integrante')
  );

  $('taskOwner').firstChild.value = '';

  members.forEach(member => {
    const option = element(
      'option',
      ownerName(member.id)
    );

    option.value = member.id;
    $('taskOwner').append(option);
  });

  $('taskOwner').value =
    task?.owner || session.usuario.id;

  $('taskPrazo').value = task?.prazo?.slice(0,10) || '';
  $('taskStatus').value =
    task?.status || 'todo';

  $('taskError').textContent = '';

  show($('taskDialog'), trigger);
}

function askRemove(type, targetId, trigger) {
  if (!ready) return;

  removal = {
    type,
    id: targetId
  };

  $('removeTitle').textContent =
    type === 'task'
      ? 'Remover tarefa da equipe?'
      : 'Remover sua anotação?';

  show($('removeDialog'), trigger);
}

function renderTasks() {
  $('taskList').replaceChildren();

  $('tasksEmpty').hidden =
    draft.tasks.length > 0;

  draft.tasks.forEach(task => {
    const row = element(
      'li',
      '',
      'task ' + task.status
    );

    const checkLabel = element(
      'label',
      '',
      'task-check'
    );

    const check = document.createElement('input');

    check.type = 'checkbox';
    check.checked = task.status === 'done';
    check.dataset.taskId = task.id;

    check.setAttribute(
      'aria-label',
      `Marcar ${task.title} como ${check.checked ? 'não concluída' : 'concluída'
      } da equipe`
    );

    check.addEventListener('change', async () => {
      check.disabled = true;
      const saved = await mutate(
        () => api('/api/aluno/tarefas/' + encodeURIComponent(task.id),'PUT',{status:check.checked?'concluida':'pendente'}),
        data => Object.assign(task,taskFromServer(data))
      );
      if (!saved) { check.checked = task.status === 'done'; check.disabled = false; }
      else tell('Situação atualizada para a equipe.');
    });

    checkLabel.append(check);

    const copy = element('div', '', 'task-copy');

    copy.append(
      element('strong', task.title),
      element('span', ownerName(task.owner) + (task.prazo ? ' · Prazo: ' + new Date(task.prazo.slice(0,10)+'T12:00:00').toLocaleDateString('pt-BR') : ''))
    );

    const edit = iconButton(
      'Editar tarefa: ' + task.title,
      'm15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z'
    );

    edit.addEventListener('click', () => {
      openTask(task, edit);
    });

    const remove = iconButton(
      'Remover tarefa: ' + task.title,
      'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7'
    );

    remove.addEventListener('click', () => {
      askRemove('task', task.id, remove);
    });

    row.append(
      checkLabel,
      copy,
      element(
        'span',
        statusNames[task.status],
        'task-state'
      ),
      edit,
      remove
    );

    $('taskList').append(row);
  });
}

/* Mural compartilhado; somente o autor edita ou remove seus avisos. */
function renderNotes() {
  $('wall').replaceChildren();
  $('wallEmpty').hidden = draft.notes.length > 0;
  [...draft.notes].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).forEach(note => {
    const row = element('li','','idea-note');
    const copy = element('div','','idea-content');
    const time = element('time',new Date(note.createdAt).toLocaleString('pt-BR'));
    time.dateTime = note.createdAt;
    copy.append(element('strong',note.author === session.usuario.id ? 'Você' : note.authorName),time,element('p',note.text));
    row.append(portrait(members.find(member=>member.id===note.author)||{nome:note.authorName}),copy);
    if (note.author === session.usuario.id) {
      const edit = iconButton('Editar aviso','m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z');
      edit.onclick = () => {
        editingNote = note.id; $('idea').value = note.text;
        $('ideaCount').textContent = note.text.length + ' / 1000';
        $('saveNote').textContent = 'Salvar edição';
        $('cancelNote').hidden = false; $('idea').focus();
      };
      const remove = iconButton('Remover aviso','M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7');
      remove.onclick = () => askRemove('note',note.id,remove);
      row.append(edit,remove);
    }
    $('wall').append(row);
  });
}

function renderWorkspace() {
  renderMembers();
  renderTasks();
  renderNotes();
}

/* Usa apenas uma atividade real disponível na trilha. */
function renderMission(data) {
  const periods = Array.isArray(data.periodos_trilha)
    ? data.periodos_trilha
    : [];

  const mission = periods
    .filter(period => period?.acessivel !== false)
    .flatMap(period =>
      Array.isArray(period?.missoes)
        ? period.missoes
        : []
    )
    .find(item =>
      item &&
      typeof item.id === 'string' &&
      item.status_aluno === 'disponivel'
    );

  $('missionTitle').textContent =
    mission?.titulo ||
    'As atividades continuam na sua trilha';

  $('missionDescription').textContent =
    mission?.descricao ||
    'Consulte as orientações do professor para saber quais atividades devem ser feitas em equipe.';

  $('missionLink').textContent =
    mission
      ? 'Abrir atividade →'
      : 'Ir para minha trilha →';

  $('missionLink').href =
    mission
      ? 'atividade.html?atividade=' +
      encodeURIComponent(mission.id)
      : 'home.html#journey';
}

async function load() {
  if (busy || mutating) return;

  busy = true;
  ready = false;
  team = null;
  members = [];
  draft = emptyDraft();
  editingNote = null;

  controls(false);

  $('refresh').disabled = true;
  $('workspace').hidden = true;
  $('noTeam').hidden = true;
  $('memberHint').hidden = true;
  $('loadError').hidden = true;

  $('storageNotice').textContent = '';
  $('teamLabel').textContent = 'Carregando equipe…';
  $('teamPeriod').textContent = '';

  $('members').replaceChildren();
  $('members').setAttribute('aria-busy', 'true');

  document.querySelectorAll('dialog[open]').forEach(dialog => {
    dialog.close();
  });

  try {
    const [data, teamData, ownProfile] = await Promise.all([dashboard(),api('/api/aluno/equipe'),api('/api/perfil').catch(()=>null)]);

    if (!teamData?.equipe) {
      $('teamLabel').textContent = 'Sem equipe';
      $('noTeam').hidden = false;
      return;
    }

    team = teamData.equipe;

    members = normalizarIntegrantes(team.membros, session.usuario.id, ownProfile);

    $('teamLabel').textContent =
      `${team.nome || 'Minha equipe'} · ${members.length
      } ${members.length === 1 ? 'integrante' : 'integrantes'
      }`;

    $('teamPeriod').textContent =
      typeof data.equipe_periodo_nome === 'string'
        ? data.equipe_periodo_nome
        : '';

    if (
      typeof team.id !== 'string' ||
      !team.id
    ) {
      throw Error(
        'Não foi possível identificar a equipe. Tente atualizar.'
      );
    }

    await refreshShared();
    renderMission(data);

    ready = true;

    renderWorkspace();

    $('workspace').hidden = false;
    $('memberHint').hidden = false;

    controls(true);
  } catch (error) {
    $('teamLabel').textContent =
      'Não foi possível carregar a equipe';

    $('loadError').textContent =
      error.message || 'Tente atualizar novamente.';

    $('loadError').hidden = false;
  } finally {
    busy = false;

    $('refresh').disabled = false;
    $('members').setAttribute('aria-busy', 'false');
  }
}

$('refresh').addEventListener('click', load);

$('organize').addEventListener('click', () => {
  openTask(null, $('organize'));
});

$('taskForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!ready || mutating) return;
  const titulo = $('taskTitle').value.trim();
  const responsavel_id = $('taskOwner').value;
  const status = serverStatus[$('taskStatus').value];
  if (!titulo || !members.some(m=>m.id===responsavel_id) || !status) {
    $('taskError').textContent = 'Informe o título e um responsável da equipe.'; return;
  }
  const payload={titulo,responsavel_id,status,prazo:$('taskPrazo').value || null};
  const submit = $('taskForm').querySelector('[type="submit"]'); submit.disabled = true;
  const currentId = editingTask;
  const saved = await mutate(
    () => api(currentId?'/api/aluno/tarefas/'+encodeURIComponent(currentId):teamRoute('tarefas'),currentId?'PUT':'POST',payload),
    data => { const task=taskFromServer(data); if(currentId) draft.tasks=draft.tasks.map(t=>t.id===currentId?task:t); else draft.tasks.push(task); }
  );
  submit.disabled=false;
  if(saved) {tell('Tarefa salva para a equipe.'); $('taskDialog').close();}
  else $('taskError').textContent=$('storageNotice').textContent;
});

$('idea').addEventListener('input', () => {
  $('ideaCount').textContent =
    $('idea').value.length + ' / 1000';

  $('formError').textContent = '';
});

function resetNote() {
  editingNote = null; $('idea').value=''; $('ideaCount').textContent='0 / 1000';
  $('saveNote').textContent='Publicar aviso'; $('cancelNote').hidden=true;
}
$('cancelNote').onclick = resetNote;
$('ideaForm').addEventListener('submit', async event => {
  event.preventDefault();
  const texto=$('idea').value.trim();
  if(!texto || !ready || mutating) return;
  const currentId=editingNote;
  const saved=await mutate(
    () => api(currentId?'/api/aluno/avisos/'+encodeURIComponent(currentId):teamRoute('avisos'),currentId?'PUT':'POST',{texto}),
    data => {const note=noteFromServer({...data,autor:{nome:session.usuario.nome}}); if(currentId) draft.notes=draft.notes.map(n=>n.id===currentId?note:n); else draft.notes.push(note);}
  );
  if(saved) {resetNote(); tell('Aviso publicado para a equipe.'); $('wallStatus').textContent='Aviso salvo no servidor.';}
  else $('formError').textContent=$('storageNotice').textContent;
});
$('confirmRemove').addEventListener('click', async () => {
  if(!ready || !removal || mutating) return;
  const item={...removal}; const button=$('confirmRemove'); button.disabled=true;
  const saved=await mutate(
    () => api('/api/aluno/'+(item.type==='task'?'tarefas':'avisos')+'/'+encodeURIComponent(item.id),'DELETE'),
    () => {if(item.type==='task') draft.tasks=draft.tasks.filter(t=>t.id!==item.id); else draft.notes=draft.notes.filter(n=>n.id!==item.id);}
  );
  button.disabled=false;
  if(saved) {tell('Item removido da equipe.'); $('removeDialog').close();}
});
async function refreshMemberProfiles() {
  const [teamData,ownProfile] = await Promise.all([api('/api/aluno/equipe'),api('/api/perfil').catch(()=>null)]);
  if (!team || teamData?.equipe?.id !== team.id) return;
  const updated = normalizarIntegrantes(teamData.equipe.membros,session.usuario.id,ownProfile);
  members = updated;
  $('teamLabel').textContent = `${team.nome || 'Minha equipe'} · ${members.length} ${members.length === 1 ? 'integrante' : 'integrantes'}`;
}
async function refreshProfilePictures() {
  if(document.hidden || !ready || busy || mutating || document.querySelector('dialog[open]') || editingNote) return;
  busy=true;
  try {await refreshMemberProfiles();renderMembers();renderNotes();}
  catch { /* Mantém os últimos retratos confirmados se a conexão cair. */ }
  finally {busy=false;}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProfilePictures();});
addEventListener('pageshow',event=>{if(event.persisted)refreshProfilePictures();});

setInterval(async () => {
  if(document.hidden || !ready || busy || mutating || document.querySelector('dialog[open]') || editingNote) return;
  busy=true; controls(false);
  try {await Promise.all([refreshShared(),refreshMemberProfiles()]); renderWorkspace(); $('storageNotice').textContent='';}
  catch(error) {$('storageNotice').textContent='Atualização automática: '+error.message;}
  finally {busy=false; controls(ready);}
},30000);

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => {
    button.closest('dialog').close();
  });
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    const opener = openers.get(dialog);

    if (
      opener?.isConnected &&
      opener.getClientRects().length
    ) {
      opener.focus({ preventScroll: true });
    } else {
      (
        ready
          ? $('organize')
          : $('refresh')
      ).focus({ preventScroll: true });
    }

    if (dialog.id === 'removeDialog') {
      removal = null;
    }
  });
});

/* Estrelas: fluxo, resposta ao mouse e criação no clique. */

const canvas = $('teamStars');
const ctx = canvas.getContext('2d');

const media = matchMedia(
  '(prefers-reduced-motion: reduce)'
);

const cursor = {
  x: -999,
  y: -999
};

const stars = [];

let width = innerWidth;
let height = innerHeight;
let frame = 0;
let last = 0;

const stopped = () =>
  media.matches ||
  document.body.classList.contains('astro-motion-off') ||
  document.hidden;

function addStar(
  x = Math.random() * width,
  y = Math.random() * height,
  born = false
) {
  if (stars.length >= 80) stars.shift();

  stars.push({
    x,
    y,
    r: born ? 1.5 : .5 + Math.random(),
    vx: 0,
    vy: 0,
    speed: 5 + Math.random() * 8,
    age: 0,
    born,
    pin: born ? .8 : 0
  });
}

function draw(dt) {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  for (let i = stars.length - 1; i >= 0; i--) {
    const particle = stars[i];

    particle.age += dt;

    if (particle.born && particle.age > 12) {
      stars.splice(i, 1);
      continue;
    }

    if (dt && particle.pin <= 0) {
      const dx = particle.x - cursor.x;
      const dy = particle.y - cursor.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 130 && distance > 0) {
        const force =
          (1 - distance / 130) * 170;

        particle.vx += dx / distance * force * dt;
        particle.vy += dy / distance * force * dt;
      }

      particle.vx *= Math.exp(-3 * dt);
      particle.vy *= Math.exp(-3 * dt);

      particle.x += (
        particle.speed + particle.vx
      ) * dt;

      particle.y += (
        -particle.speed * .12 + particle.vy
      ) * dt;

      if (particle.x > width + 5) particle.x = -5;
      if (particle.x < -10) particle.x = width + 5;
      if (particle.y < -5) particle.y = height + 5;
      if (particle.y > height + 10) particle.y = -5;
    } else {
      particle.pin -= dt;
    }

    const alpha = particle.born
      ? Math.min(.8, (12 - particle.age) / 3)
      : .16;

    ctx.fillStyle = particle.born
      ? `rgba(225,198,249,${alpha})`
      : `rgba(174,147,191,${alpha})`;

    ctx.beginPath();

    ctx.arc(
      particle.x,
      particle.y,
      particle.r,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (particle.born) {
      ctx.strokeStyle =
        `rgba(225,198,249,${alpha})`;

      ctx.lineWidth = .7;

      ctx.beginPath();

      ctx.moveTo(particle.x - 4, particle.y);
      ctx.lineTo(particle.x + 4, particle.y);

      ctx.moveTo(particle.x, particle.y - 4);
      ctx.lineTo(particle.x, particle.y + 4);

      ctx.stroke();
    }
  }
}

function tick(now) {
  frame = 0;

  if (stopped()) return;

  const dt = last
    ? Math.min((now - last) / 1000, .04)
    : 0;

  last = now;

  draw(dt);

  frame = requestAnimationFrame(tick);
}

function sync() {
  cancelAnimationFrame(frame);

  frame = 0;
  last = 0;

  draw(0);

  if (!stopped() && ctx) {
    frame = requestAnimationFrame(tick);
  }
}

function resize() {
  width = innerWidth;
  height = innerHeight;

  const dpr = Math.min(
    devicePixelRatio || 1,
    1.5
  );

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

  stars.length = 0;

  for (
    let i = 0;
    i < (width < 600 ? 22 : 36);
    i++
  ) {
    addStar();
  }

  sync();
}

addEventListener('pointermove', event => {
  if (
    event.pointerType === 'touch' ||
    stopped()
  ) {
    return;
  }

  cursor.x = event.clientX;
  cursor.y = event.clientY;
}, { passive: true });

document.documentElement.addEventListener(
  'pointerleave',
  () => {
    cursor.x = cursor.y = -999;
  }
);

document.addEventListener('click', event => {
  if (
    stopped() ||
    event.target.closest(
      'a,button,input,textarea,select,label,dialog,.sidebar,.member,.task,.idea-note,astro-assistente,#astroAccountTools'
    )
  ) {
    return;
  }

  addStar(
    event.clientX,
    event.clientY,
    true
  );

  draw(0);
});

addEventListener('resize', resize);

document.addEventListener(
  'visibilitychange',
  sync
);

document.addEventListener(
  'astrolearn:motion',
  sync
);

media.addEventListener('change', sync);

new MutationObserver(sync).observe(
  document.body,
  {
    attributes: true,
    attributeFilter: ['class']
  }
);

addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  clearTimeout(toastTimer);
  frame = 0;
});

addEventListener('pageshow', sync);

resize();
load();
