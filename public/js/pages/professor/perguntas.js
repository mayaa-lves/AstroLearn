import { ids as avatarIds } from "../../services/avatar-conta.js";

const answerLimit = 3000;
const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function make(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function icon(pathData) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", pathData);
  svg.append(path);
  return svg;
}

function dateLabel(value, prefix) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return null;
  const time = make("time", `${prefix} ${dateFormat.format(date)}, às ${timeFormat.format(date)}`);
  time.dateTime = date.toISOString();
  return time;
}

function portrait(name, avatarId) {
  const avatar = make("span", "", "question-avatar");
  avatar.setAttribute("aria-hidden", "true");
  const index = avatarIds.indexOf(avatarId);
  if (index < 0) {
    avatar.textContent = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  } else {
    avatar.classList.add("has-chosen-avatar");
    avatar.style.backgroundPosition = `${index % 4 * 100 / 3}% ${index < 4 ? 0 : 100}%`;
  }
  return avatar;
}

let activeFilter;
function createFilter(onChange) {
  activeFilter?.abort();
  activeFilter = new AbortController();
  const lifecycle = activeFilter;
  const wrapper = make("div", "", "questions-filter");
  const trigger = make("button", "", "questions-filter-trigger");
  trigger.type = "button";
  trigger.setAttribute("aria-controls", "questions-filter-options");
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.append(icon("M3 5h18l-7 8v4l-4 3v-7z"));

  const options = make("div", "", "questions-filter-options");
  options.id = "questions-filter-options";
  options.setAttribute("role", "menu");
  options.setAttribute("aria-label", "Situação das perguntas");
  const labels = { pending: "Aguardando resposta", all: "Todas as perguntas", answered: "Respondidas" };
  let selection = "all";
  let pinned = false;
  const buttons = Object.entries(labels).map(([value, label]) => {
    const button = make("button", label);
    button.type = "button";
    button.setAttribute("role", "menuitemradio");
    button.append(icon("m4 12 5 5L20 6"));
    button.addEventListener("click", () => {
      selection = value;
      setOpen(false);
      onChange(value);
      trigger.focus();
    });
    options.append(button);
    return [value, button];
  });

  function setOpen(open) {
    options.hidden = !open;
    if (!open) pinned = false;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", "Filtrar perguntas. Atual: " + labels[selection]);
    buttons.forEach(([value, button]) => {button.setAttribute("aria-pressed", String(value === selection));button.setAttribute("aria-checked", String(value === selection));});
  }

  wrapper.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") setOpen(true);
  });
  wrapper.addEventListener("pointerleave", () => {
    if (!pinned && !options.contains(document.activeElement)) setOpen(false);
  });
  trigger.addEventListener("click", () => {
    const open = !pinned;
    setOpen(open);
    pinned = open;
    trigger.focus();
  });
  wrapper.addEventListener("focusout", event => {
    if (!wrapper.contains(event.relatedTarget)) setOpen(false);
  });
  wrapper.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();setOpen(true);
      const items=buttons.map(([,button])=>button),index=items.indexOf(document.activeElement);
      const next=event.key==="Home"?0:event.key==="End"?items.length-1:index<0?(event.key==="ArrowUp"?items.length-1:0):(index+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;
      items[next]?.focus();return;
    }
    if (event.key !== "Escape" || options.hidden) return;
    event.preventDefault();
    setOpen(false);
    trigger.focus();
  });
  document.addEventListener("pointerdown",event=>{if(!wrapper.contains(event.target))setOpen(false);},{signal:lifecycle.signal});
  wrapper.append(trigger, options);
  setOpen(false);
  return wrapper;
}

function searchKey(text) {
  return text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function createCard(question, room, expanded, onAnswered, onHiddenFocus) {
  const student = room.alunos?.find(item => String(item.id) === String(question.aluno_id ?? question.perfis?.id));
  const mission = room.missoes?.find(item => String(item.id) === String(question.missao_id ?? question.missoes?.id));
  const name = question.perfis?.nome || student?.nome || "Aluno";
  const activity = question.missoes?.titulo || mission?.titulo || "";
  const card = make("article", "", "question-card");
  card.id = "pergunta-" + question.id;

  const header = make("header", "", "question-identity");
  const identity = make("div", "", "question-identity-copy");
  identity.append(make("h2", name), make("p", activity ? "Atividade · " + activity : "Atividade"));
  const badge = make("span", "", "question-state");
  header.append(portrait(name, question.perfis?.avatar_id || student?.avatar_id), identity, badge);
  const body = make("p", question.texto, "question-copy");
  const reply = make("div", "", "teacher-reply");
  const footer = make("footer", "", "question-footer");
  const dates = make("div", "", "question-dates");
  footer.append(dates);
  card.append(header, body, reply, footer);

  function renderState() {
    const answered = Boolean(question.resposta);
    card.dataset.questionState = answered ? "answered" : "pending";
    badge.textContent = answered ? "Respondida" : "Aguardando resposta";
    reply.hidden = !answered;
    if (answered) {
      reply.replaceChildren(make("strong", "Sua resposta"), make("p", question.resposta));
    }
    const asked = dateLabel(question.criado_em, "Perguntado em");
    const answeredAt = answered && dateLabel(question.respondido_em ?? question.respondida_em, "Respondido em");
    dates.replaceChildren(...[asked, answeredAt].filter(Boolean));
    dates.hidden = !dates.childElementCount;
    footer.hidden = answered && dates.hidden;
  }

  renderState();
  if (!question.resposta) {
    const form = make("form", "", "question-form");
    form.id = "question-reply-" + question.id;
    const label = make("label", "Resposta ao aluno");
    label.htmlFor = "reply-" + question.id;
    const field = make("textarea");
    field.id = label.htmlFor;
    field.required = true;
    field.maxLength = answerLimit;
    field.rows = 3;
    field.placeholder = "Escreva uma orientação clara para o aluno…";
    const count = make("span", "", "question-character-count");
    count.id = "reply-count-" + question.id;
    field.setAttribute("aria-describedby", count.id);
    function updateCount() {
      count.textContent = field.value.length.toLocaleString("pt-BR") + " / 3.000";
    }
    field.addEventListener("input", updateCount);
    updateCount();

    const error = make("p", "", "error-panel");
    error.setAttribute("role", "alert");
    const actions = make("div", "", "question-form-actions");
    const cancel = make("button", "Cancelar", "question-cancel");
    cancel.type = "button";
    const submit = make("button", "Enviar resposta", "question-primary");
    submit.type = "submit";
    actions.append(cancel, submit);
    form.append(label, field, count, actions, error);
    card.insertBefore(form, footer);

    const toggle = make("button", "", "question-primary question-reply-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-controls", form.id);
    toggle.append(icon("m4 16 12-12a2.8 2.8 0 0 1 4 4L8 20l-5 1zM14 6l4 4"), "Responder");
    footer.append(toggle);

    function setExpanded(open) {
      form.hidden = !open;
      footer.hidden = open;
      toggle.setAttribute("aria-expanded", String(open));
      card.classList.toggle("question-writing", open);
    }

    setExpanded(expanded);
    toggle.addEventListener("click", () => {
      setExpanded(true);
      field.focus();
    });
    cancel.addEventListener("click", () => {
      form.reset();
      updateCount();
      error.textContent = "";
      setExpanded(false);
      toggle.focus();
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const answer = field.value.trim();
      if (!answer) {
        error.textContent = "Escreva uma orientação para o aluno.";
        field.focus();
        return;
      }

      submit.disabled = cancel.disabled = field.readOnly = true;
      error.textContent = "";
      try {
        const result = await window.TeacherData.answer(question.id, answer);
        if (!result.pergunta?.id) throw new Error("A resposta não foi confirmada.");
        Object.assign(question, result.pergunta, { resposta: result.pergunta.resposta ?? answer });
        form.remove();
        toggle.remove();
        card.classList.remove("question-writing");
        renderState();
        if (card.isConnected) {
          onAnswered();
          if (card.hidden) onHiddenFocus();
          else {
            reply.tabIndex = -1;
            reply.focus();
          }
        }
      } catch (failure) {
        error.textContent = failure.message;
        submit.disabled = cancel.disabled = field.readOnly = false;
      }
    });
  }

  return { card, question, key: searchKey(`${name} ${activity} ${question.texto}`) };
}

export function renderQuestions(content, room, questions, backLink, selectedQuestion) {
  const filters = make("div", "", "questions-toolbar");
  const searchLabel = make("label", "", "questions-search");
  const search = make("input");
  search.type = "search";
  search.placeholder = "Buscar aluno, atividade ou pergunta";
  search.setAttribute("aria-label", search.placeholder);
  searchLabel.append(icon("M16.5 16.5 21 21M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"), search);

  let filter = "all";
  const filterControl = createFilter(value => {filter=value;updateList();});
  const back = make("div", "", "questions-back page-actions");
  back.append(backLink);
  filters.append(searchLabel, filterControl, back);
  const count = make("p", "", "questions-count");
  count.setAttribute("role", "status");
  const list = make("div", "", "question-list");
  const empty = make("p", "", "empty");
  const rows = questions.map(question => createCard(
    question, room, selectedQuestion === String(question.id), () => {
      updateList();
      document.getElementById("status").textContent = "Resposta salva no servidor.";
      window.dispatchEvent(new Event("astro-notifications-refresh"));
    }, () => search.focus()
  ));
  list.append(...rows.map(row => row.card));
  content.append(filters, count, list, empty);

  function updateList() {
    const query = searchKey(search.value.trim());
    let visible = 0;
    for (const { card, question, key } of rows) {
      const state = question.resposta ? "answered" : "pending";
      card.hidden = !((filter === "all" || filter === state) && key.includes(query));
      if (!card.hidden) visible++;
    }
    count.textContent = visible + (visible === 1 ? " pergunta" : " perguntas");
    empty.hidden = visible > 0;
    empty.textContent = rows.length ? "Nenhuma pergunta corresponde à busca." : "A turma ainda não enviou perguntas.";
  }

  search.addEventListener("input", updateList);
  search.addEventListener("keydown",event=>{if(event.key==="Escape"){search.value="";updateList();}});
  updateList();
  if (selectedQuestion) {
    document.getElementById("pergunta-" + selectedQuestion)?.scrollIntoView({ block: "center", behavior: "instant" });
  }
}
