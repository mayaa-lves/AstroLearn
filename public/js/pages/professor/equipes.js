(() => {
  const actions = document.getElementById("pageActions");
  const content = document.getElementById("content");
  const dialogContent = document.getElementById("dialogContent");
  const data = window.TeacherData;
  const colors = new Map();
  const palette = [270, 193, 16, 153, 330, 222, 42, 290];
  const capacity = 4;
  let teams = [];
  let roomVersion = 0;
  let roomId;
  let memberMutation = 0;

  const loadRoom = data.room.bind(data);
  data.room = async sala => {
    const version = ++roomVersion;
    const room = await loadRoom(sala);
    if (version === roomVersion) {
      roomId = sala;
      teams = room.equipes ?? [];
      for (const team of teams) {
        if (!colors.has(team.id)) colors.set(team.id, colors.size);
      }
    }
    return room;
  };

  function applyPatch(patch, colorIndex) {
    const baseIndex = colorIndex % 3;
    const hue = palette[colorIndex] ?? (colorIndex * 137.508 + 270) % 360;
    patch.dataset.patch = String(baseIndex);
    patch.style.setProperty("--patch-rotation", (hue - palette[baseIndex]) + "deg");
    return hue;
  }

  const createTeam = data.createTeam.bind(data);
  data.createTeam = async (...args) => {
    const previewIndex = colors.size;
    const team = await createTeam(...args);
    if (team?.id != null && !colors.has(team.id)) colors.set(team.id, previewIndex);
    return team;
  };

  function decorateCreateButton() {
    const button = [...actions.querySelectorAll("button")].find(
      item => item.textContent.trim() === "+ Criar equipe"
    );
    if (!actions.querySelector('.teams-room-back')) {
      const params=new URLSearchParams(location.search);
      if(params.get('sala')){const back=document.createElement('a'),url=new URL('turma.html',location.href);url.searchParams.set('sala',params.get('sala'));if(params.get('periodo'))url.searchParams.set('periodo',params.get('periodo'));back.href=url.href;back.className='secondary teams-room-back';back.textContent='Voltar à sala';actions.append(back);}
    }
    if (!button) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", "M12 5v14M5 12h14");
    svg.append(path);
    const label = document.createElement("span");
    label.textContent = "Criar equipe";
    button.classList.add("team-create-trigger");
    button.replaceChildren(svg, label);
    actions.prepend(button);
  }

  function renderCount(card, total) {
    const count = card.querySelector(".team-count");
    const meter = card.querySelector(".team-meter");
    meter.hidden = total == null;
    count.textContent = total == null
      ? "Integrantes indisponíveis"
      : total + " de " + capacity + " integrantes";
    [...meter.children].forEach((segment, index) => {
      segment.classList.toggle("is-filled", total != null && index < total);
    });
  }

  async function loadCount(card, team, mutation) {
    try {
      const { api } = await import("../../services/conexao.js");
      const detail = await api(
        "/api/professor/salas/" + encodeURIComponent(roomId) +
        "/equipes/" + encodeURIComponent(team.id)
      );
      if (!Array.isArray(detail.membros)) throw new Error();
      if (card.isConnected && mutation === memberMutation) renderCount(card, detail.membros.length);
    } catch {
      if (card.isConnected && mutation === memberMutation) renderCount(card, null);
    }
  }

  function decorateCards() {
    const semester = new URLSearchParams(location.search).get("periodo");
    const visibleTeams = semester ? teams.filter(team => String(team.periodo_id) === semester) : teams;
    for (const [index, card] of [...content.querySelectorAll(".team-grid > .team-card")].entries()) {
      if (card.dataset.decorated) continue;
      const team = visibleTeams[index];
      const colorIndex = team ? colors.get(team.id) : index;
      card.dataset.decorated = "true";
      if (team) card.dataset.teamId = team.id;
      const [name, period, button] = card.children;
      const patch = document.createElement("div");
      patch.className = "team-patch";
      card.style.setProperty("--team-hue", applyPatch(patch, colorIndex));
      patch.setAttribute("aria-hidden", "true");
      const details = document.createElement("div");
      details.className = "team-details";
      const count = document.createElement("p");
      count.className = "team-count";
      const meter = document.createElement("div");
      meter.className = "team-meter";
      meter.setAttribute("aria-hidden", "true");
      for (let slot = 0; slot < capacity; slot++) meter.append(document.createElement("span"));
      meter.hidden = true;
      count.textContent = "Consultando integrantes…";
      button.setAttribute("aria-label", "Ver integrantes e organizar " + name.textContent);
      button.textContent = "Ver integrantes →";
      details.append(period, name, meter, count, button);
      card.append(patch, details);
      if (Array.isArray(team?.membros)) renderCount(card, team.membros.length);
      else if (team) loadCount(card, team, memberMutation);
      else renderCount(card, null);
    }
  }

  let currentTeam;
  let lastManagement;
  const loadTeam = data.team.bind(data);
  data.team = async (sala, id) => {
    const detail = await loadTeam(sala, id);
    currentTeam = { id, count: detail.membros?.length ?? 0 };
    const card = [...content.querySelectorAll("[data-team-id]")].find(item => item.dataset.teamId === String(id));
    if (card && Array.isArray(detail.membros)) renderCount(card, detail.membros.length);
    return detail;
  };

  for (const method of ["addMember", "removeMember"]) {
    const mutate = data[method].bind(data);
    data[method] = async (...args) => {
      const result = await mutate(...args);
      ++memberMutation;
      // Refresh pending counts too if initial requests overlapped this change.
      for (const card of content.querySelectorAll("[data-team-id]")) {
        if (!card.querySelector(".team-meter").hidden && card.dataset.teamId !== String(args[1])) continue;
        loadCount(card, { id: card.dataset.teamId }, memberMutation);
      }
      return result;
    };
  }

  const dialogPatch = document.getElementById("teamDialogPatch");
  const dialogCount = document.getElementById("teamDialogCount");
  const decoratedDialogs = new WeakSet();

  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function addDeleteAction(body, teamId) {
    const dialog = document.getElementById("actionDialog");
    const close = document.getElementById("closeDialog");
    const title = document.getElementById("dialogTitle").textContent;
    const targetRoom = roomId;
    const trigger = make("button", "", "secondary team-delete-button");
    trigger.setAttribute("aria-label", "Excluir equipe");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(icon.namespaceURI, "path");
    path.setAttribute("d", "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5");
    icon.append(path);
    trigger.append(icon, make("span", "Excluir equipe", "team-delete-label"));
    const confirm = make("button", "Sim, excluir equipe", "primary team-delete-confirm-button");
    const cancel = make("button", "Cancelar", "secondary");
    trigger.type = confirm.type = cancel.type = "button";

    const warning = make("section", "", "team-delete-confirm");
    warning.hidden = true;
    const controls = make("div", "", "team-dialog-actions");
    const error = make("p", "", "team-delete-error");
    error.setAttribute("role", "alert");
    controls.append(cancel, confirm);
    warning.append(
      make("h3", "Excluir equipe?"),
      make("p", "A equipe “" + title + "” será excluída permanentemente. Os integrantes continuam na turma."),
      error,
      controls
    );

    const footer = make("div", "", "team-delete-footer");
    footer.append(trigger);
    body.append(footer, warning);

    trigger.onclick = () => {
      warning.hidden = false;
      cancel.focus();
    };
    cancel.onclick = () => {
      warning.hidden = true;
      error.textContent = "";
      trigger.focus();
    };
    confirm.onclick = async () => {
      if (confirm.disabled) return;
      confirm.disabled = cancel.disabled = close.disabled = true;
      confirm.textContent = "Excluindo…";
      error.textContent = "";
      const preventDismiss = event => event.preventDefault();
      dialog.addEventListener("cancel", preventDismiss);
      try {
        const { api } = await import("../../services/conexao.js");
        await api(
          "/api/professor/salas/" + encodeURIComponent(targetRoom) +
          "/equipes/" + encodeURIComponent(teamId),
          "DELETE"
        );
        for (const card of content.querySelectorAll("[data-team-id]")) {
          if (card.dataset.teamId === String(teamId)) card.remove();
        }
        dialog.addEventListener("close", () => document.getElementById("pageTitle").focus(), { once: true });
        dialog.close();
        document.getElementById("status").textContent = "Equipe excluída.";
        document.getElementById("refresh").click();
      } catch (failure) {
        error.textContent = failure.status === 404
          ? "Não foi possível localizar essa equipe. Feche a janela e atualize a lista."
          : "Não foi possível confirmar a exclusão. Tente novamente.";
      } finally {
        dialog.removeEventListener("cancel", preventDismiss);
        confirm.disabled = cancel.disabled = close.disabled = false;
        confirm.textContent = "Sim, excluir equipe";
        if (error.textContent && dialog.open) confirm.focus();
      }
    };
  }

  function decorateDialog() {
    const body = dialogContent.firstElementChild;
    if (!body || decoratedDialogs.has(body)) return;
    decoratedDialogs.add(body);
    for(const label of body.querySelectorAll('label[for]')){
      const input=document.getElementById(label.htmlFor);
      if(!input||label.closest('.team-dialog-field')||label.nextElementSibling!==input)continue;
      const field=make('div','','team-dialog-field');label.before(field);field.append(label,input);
    }
    const name = body.querySelector("#field-team-name");
    const student = body.querySelector("#field-team-student");
    dialogPatch.hidden = !(name || student);
    dialogCount.hidden = !student;
    if (name) {
      document.getElementById("actionDialog").style.setProperty("--team-hue",applyPatch(dialogPatch, colors.size));
      document.getElementById("dialogTitle").textContent = "Criar equipe";
      name.placeholder = "Ex.: Órbita Lunar";
      const submit = body.querySelector('button[type="submit"]');
      const footer = make("div", "", "team-dialog-actions");
      const cancel = make("button", "Cancelar", "secondary");
      cancel.type = "button";
      cancel.onclick = () => document.getElementById("closeDialog").click();
      footer.append(cancel, submit);
      body.append(footer);
    }
    if (!student) {
      const confirm=[...body.querySelectorAll('button')].find(button=>button.textContent.trim()==='Confirmar remoção');
      if(confirm&&lastManagement){
        const previous=lastManagement;dialogPatch.hidden=false;dialogCount.hidden=false;dialogCount.textContent=previous.count;
        document.getElementById('actionDialog').style.setProperty('--team-hue',applyPatch(dialogPatch,colors.get(previous.id)??0));
        const row=make('div','','team-dialog-actions');const cancel=make('button','Voltar à equipe','secondary');cancel.type='button';
        cancel.onclick=()=>{if(document.getElementById('closeDialog').disabled)return;document.getElementById('dialogTitle').textContent=previous.title;dialogContent.replaceChildren(previous.body);dialogPatch.hidden=false;dialogCount.hidden=false;dialogCount.textContent=previous.count;const target=previous.body.querySelector('.member button,select,.team-delete-button');target?.focus();};
        row.append(cancel,confirm);body.append(row);confirm.classList.add('team-remove-confirm');
      }
      return;
    }

    const { id, count } = currentTeam;
    document.getElementById("actionDialog").style.setProperty("--team-hue",applyPatch(dialogPatch, colors.get(id) ?? 0));
    dialogCount.textContent = count + " de " + capacity + " integrantes";
    const summary = body.firstElementChild;
    const planning = body.querySelector(".panel");
    const form = student.form;
    const members = [...body.querySelectorAll(":scope > .member")];
    summary.replaceWith(make("h3", "Integrantes", "team-section-title"));
    if (!members.length) {
      body.querySelector(".team-section-title").after(
        make("p", "Nenhum integrante nesta equipe.", "hint")
      );
    }

    if (student.options.length && count < capacity) {
      planning.before(form);
    } else {
      const notice = make("div", "", "team-dialog-notice");
      const full = count >= capacity;
      notice.append(
        make("strong", full ? "Equipe completa" : "Nenhum aluno disponível"),
        make("p", full ? "Remova um integrante para liberar uma vaga."
          : body.lastElementChild.textContent)
      );
      if (!student.options.length) body.lastElementChild.remove();
      form.remove();
      planning.before(notice);
    }

    const groups = make("div", "", "team-planning-grid");
    let tile;
    for (const node of [...planning.children].slice(2)) {
      if (node.tagName === "H3") {
        tile = make("section", "", "team-planning-tile");
        groups.append(tile);
      }
      tile.append(node);
    }
    planning.children[1].remove();
    planning.append(groups);
    addDeleteAction(body, id);
    lastManagement={body,id,title:document.getElementById('dialogTitle').textContent,count:dialogCount.textContent};
  }

  for (const [element, update] of [
    [actions, decorateCreateButton],
    [content, decorateCards],
    [dialogContent, decorateDialog]
  ]) {
    new MutationObserver(update).observe(element, { childList: true, subtree: true });
    update();
  }
})();
