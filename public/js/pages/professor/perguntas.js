(() => {
  const data = window.TeacherData;
  const records = new Map();
  const content = document.getElementById("content");
  const params = new URLSearchParams(location.search);

  function normalize(question) {
    return {
      ...question,
      respondida_em: question.respondido_em ?? question.respondida_em
    };
  }

  const fetchQuestions = data.questions.bind(data);
  data.questions = async (...args) => {
    const questions = (await fetchQuestions(...args)).map(normalize);
    records.clear();
    questions.forEach(question => records.set(String(question.id), question));
    return questions;
  };

  const sendAnswer = data.answer.bind(data);
  data.answer = async (...args) => {
    const result = await sendAnswer(...args);
    if (!result.pergunta?.id) return result;
    const question = normalize(result.pergunta);
    records.set(String(question.id), { ...records.get(String(question.id)), ...question });
    return { ...result, pergunta: question };
  };

  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function dateLabel(value, answered) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return answered ? "Resposta registrada · data indisponível" : "Data da pergunta indisponível";
    }
    const text = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(date);
    return (answered ? "Respondida em " : "Perguntado em ") + text;
  }

  function installFilter(select) {
    const wrapper = make("div", "", "questions-filter");
    const trigger = make("button", "", "questions-filter-trigger");
    trigger.type = "button";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", "M4 5h16l-6 7v6l-4 2v-8z");
    svg.append(path);
    trigger.append(svg);
    const options = make("div", "", "questions-filter-options");
    options.id = "questions-filter-options";
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", "Situação das perguntas");
    trigger.setAttribute("aria-controls", options.id);
    const labels = { pending: "Aguardando resposta", all: "Todas as perguntas", answered: "Respondidas" };
    const buttons = [...select.options].map(option => {
      const button = make("button", labels[option.value] || option.textContent);
      button.type = "button";
      button.onclick = () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        setOpen(false);
        trigger.focus();
      };
      return { button, value: option.value };
    });
    options.append(...buttons.map(item => item.button));

    function setOpen(open) {
      options.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute("aria-label", "Filtrar perguntas. Atual: " + labels[select.value]);
      trigger.title = labels[select.value];
      buttons.forEach(({ button, value }) => button.setAttribute("aria-pressed", String(value === select.value)));
    }

    wrapper.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") setOpen(true);
    });
    wrapper.addEventListener("pointerleave", () => {
      if (!options.contains(document.activeElement)) setOpen(false);
    });
    trigger.onclick = event => setOpen(event.pointerType === "mouse" || options.hidden);
    wrapper.addEventListener("focusout", event => {
      if (!wrapper.contains(event.relatedTarget)) setOpen(false);
    });
    wrapper.addEventListener("keydown", event => {
      if (event.key !== "Escape" || options.hidden) return;
      event.preventDefault();
      setOpen(false);
      trigger.focus();
    });
    select.hidden = true;
    wrapper.append(trigger, options);
    select.after(wrapper);
    setOpen(false);
  }

  function decorateCard(card) {
    const id = card.id.slice("pergunta-".length);
    const question = records.get(id);
    const reply = card.querySelector(".teacher-reply");
    if (!reply) return;
    const answered = !reply.hidden && Boolean(reply.querySelector(".document-copy")?.textContent.trim());
    const value = answered ? question?.respondida_em : question?.criado_em;

    if (!card.dataset.questionDecorated) {
      card.dataset.questionDecorated = "true";
      const heading = card.querySelector("h2");
      const subtitle = heading.nextElementSibling;
      const header = make("div", "", "question-identity");
      const avatar = make("span", heading.textContent.trim().split(/\s+/).slice(0, 2)
        .map(part => part[0]).join(""), "question-avatar");
      avatar.setAttribute("aria-hidden", "true");
      const identity = make("div", "", "question-identity-copy");
      identity.append(heading, subtitle);
      const badge = make("span", "", "question-state");
      header.append(avatar, identity, badge);
      card.prepend(header);
      if (question?.missoes?.titulo || question?.titulo_missao) {
        subtitle.textContent = "Atividade · " + (question.missoes?.titulo || question.titulo_missao);
      }
      const footer = make("div", "", "question-footer");
      const time = make("time", "", "question-date");
      footer.append(time);
      card.append(footer);
      const form = card.querySelector("form");
      if (form) {
        const toggle = make("button", "Responder", "primary question-reply-toggle");
        toggle.type = "button";
        const formId = "question-reply-" + id;
        form.id = formId;
        toggle.setAttribute("aria-controls", formId);
        const expanded = params.get("pergunta") === id;
        toggle.setAttribute("aria-expanded", String(expanded));
        form.hidden = !expanded;
        toggle.onclick = () => {
          const open = toggle.getAttribute("aria-expanded") !== "true";
          form.hidden = !open;
          toggle.setAttribute("aria-expanded", String(open));
          toggle.textContent = open ? "Recolher" : "Responder";
          if (open) form.querySelector("textarea").focus();
        };
        footer.append(toggle);
      }
    }

    const state = answered ? "answered" : "pending";
    card.dataset.questionState = state;
    const badge = card.querySelector(".question-state");
    const label = answered ? "Respondida" : "Aguardando resposta";
    if (badge.textContent !== label) badge.textContent = label;
    const time = card.querySelector(".question-date");
    const text = dateLabel(value, answered);
    if (time.textContent !== text) time.textContent = text;
    if (value && !Number.isNaN(new Date(value).getTime())) time.dateTime = new Date(value).toISOString();
    const originalDate = reply.querySelector("small");
    if (originalDate) originalDate.hidden = true;
    const toggle = card.querySelector(".question-reply-toggle");
    if (toggle) toggle.hidden = answered;
  }

  function update() {
    const search = content.querySelector('.filters input[type="search"]');
    if (search && !search.closest(".questions-search")) {
      const wrapper = make("div", "", "questions-search");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const circle = document.createElementNS(svg.namespaceURI, "circle");
      circle.setAttribute("cx", "10");
      circle.setAttribute("cy", "10");
      circle.setAttribute("r", "6");
      const handle = document.createElementNS(svg.namespaceURI, "path");
      handle.setAttribute("d", "m15 15 5 5");
      svg.append(circle, handle);
      search.before(wrapper);
      wrapper.append(svg, search);
    }
    const select = content.querySelector('.filters select[aria-label="Situação da pergunta"]');
    if (select && !select.hidden) installFilter(select);
    const title = document.getElementById("pageTitle");
    if (content.querySelector(".question-list") && title.textContent !== "Perguntas da turma") {
      title.textContent = "Perguntas da turma";
      document.getElementById("pageSubtitle").textContent = "Converse com os alunos e acompanhe as respostas.";
      document.title = "Perguntas da turma · AstroLearn";
    }
    content.querySelectorAll(".question-card").forEach(decorateCard);
  }

  document.addEventListener("pointerdown", event => {
    const wrapper = content.querySelector(".questions-filter");
    if (wrapper && !wrapper.contains(event.target)) {
      wrapper.querySelector(".questions-filter-options").hidden = true;
      wrapper.querySelector("button").setAttribute("aria-expanded", "false");
    }
  });
  new MutationObserver(update).observe(content, { childList: true, subtree: true });
  update();
})();
