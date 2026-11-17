(() => {
  if (document.body.dataset.page !== 'activity') return;
  const actions = document.getElementById('pageActions');
  const content = document.getElementById('content');
  const activityId = new URLSearchParams(location.search).get('atividade');
  const teacherData = window.TeacherData;
  const loadRoom = teacherData?.room;
  let roomData;
  if (typeof loadRoom === 'function') {
    teacherData.room = async function (...args) {
      roomData = await loadRoom.apply(this, args);
      return roomData;
    };
  }

  const shortcuts = [
    ['correcoes.html', 'Ver entregas', 'M8 3H5v18h14V3h-3M8 2h8v4H8ZM8 13l3 3 5-6'],
    ['editor-atividade.html', 'Editar atividade', 'm4 16 12-12 4 4L8 20H4ZM13 7l4 4'],
    [null, 'Ver como aluno', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
    ['atividades.html', 'Voltar às atividades', 'M20 12H4m6-6-6 6 6 6'],
  ];

  function icon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const drawing = document.createElementNS(svg.namespaceURI, 'path');
    drawing.setAttribute('d', path);
    svg.append(drawing);
    return svg;
  }

  function updateActions() {
    const links = [...actions.querySelectorAll('a')];
    const ordered = shortcuts.flatMap(([file, label, path], index) => {
      const link = links.find(link => file
        ? new URL(link.href).pathname.endsWith('/' + file)
        : link.textContent.trim() === label);
      if (!link) return [];
      if (!link.classList.contains('detail-shortcut')) {
        link.classList.add('detail-shortcut');
        if (index === 3) link.classList.add('detail-back');
        link.setAttribute('aria-label', label);
        const text = document.createElement('span');
        text.textContent = label;
        link.replaceChildren(icon(path), text);
      }
      return [link];
    });
    ordered.forEach((link, index) => {
      if (actions.children[index] !== link) actions.insertBefore(link, actions.children[index] || null);
    });
  }

  function updatePanels() {
    const panels = content.querySelector('.two-columns');
    if (!panels || panels.classList.contains('detail-panels')) return;
    panels.classList.add('detail-panels');
    const [guide, materials] = panels.children;
    const requirement = guide.querySelector('h3');
    if (requirement?.nextElementSibling) {
      const callout = document.createElement('div');
      callout.className = 'detail-requirement';
      const description = requirement.nextElementSibling;
      requirement.before(callout);
      callout.append(requirement, description);
    }
    materials.querySelector('h2').textContent = 'Materiais da atividade';
    const subtitle = document.getElementById('pageSubtitle');
    const activity = roomData?.missoes?.find(item => String(item.id) === activityId);
    const draft = activity
      ? activity.status_publicacao === 'rascunho'
      : subtitle.textContent.startsWith('Rascunho');
    if (activity) {
      const period = roomData.periodos?.find(item => item.id === activity.periodo_id);
      const metadata = [
        period?.nome,
        activity.tipo_atividade === 'equipe' ? 'Em equipe' : 'Individual',
      ];
      if (Array.isArray(roomData.entregas)) {
        const count = roomData.entregas.filter(item =>
          String(item.missao_id ?? item.missoes?.id) === activityId
          && ['entregue', 'corrigido'].includes(item.status)
        ).length;
        metadata.push(count === 1 ? '1 entrega' : count + ' entregas');
      }
      subtitle.textContent = metadata.filter(Boolean).join('  ·  ');
    }
    const badge = document.createElement('span');
    badge.className = 'detail-publication ' + (draft ? 'detail-draft' : '');
    badge.textContent = draft ? 'Rascunho' : 'Publicada';
    subtitle.before(badge);
    document.querySelectorAll('.detail-publication').forEach(existing => {
      if (existing !== badge) existing.remove();
    });
  }

  function updateUpload() {
    const input = content.querySelector('input[type="file"][name="extra-files"]');
    const form = input?.form;
    if (!form || form.classList.contains('detail-upload')) return;
    form.classList.add('detail-upload');
    const field = document.createElement('div');
    field.className = 'detail-file-field';
    const name = document.createElement('span');
    name.className = 'detail-file-name';
    name.setAttribute('aria-live', 'polite');
    const caption = document.createElement('strong');
    caption.textContent = 'Escolher arquivo';
    const refresh = () => {
      name.textContent = input.files[0]?.name || 'Nenhum arquivo selecionado';
    };
    input.before(field);
    field.append(icon('M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6'), caption, name, input);
    input.setAttribute('aria-label', 'Escolher arquivo para anexar à atividade');
    input.addEventListener('change', refresh);
    field.addEventListener('dragover', event => event.preventDefault());
    field.addEventListener('drop', event => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file || event.dataTransfer.files.length !== 1) return;
      const selection = new DataTransfer();
      selection.items.add(file);
      input.files = selection.files;
      input.dispatchEvent(new Event('change', {bubbles: true}));
    });
    refresh();
  }

  new MutationObserver(updateActions).observe(actions, {childList: true});
  new MutationObserver(() => { updatePanels(); updateUpload(); }).observe(content, {childList: true, subtree: true});
  updateActions();
  updatePanels();
  updateUpload();
})();
