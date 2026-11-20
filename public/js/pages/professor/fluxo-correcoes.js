(() => {
  const page = document.body.dataset.page;
  const content = document.getElementById("content");
  const actions = document.getElementById("pageActions");
  const params = new URLSearchParams(location.search);
  const reviewId = params.get("entrega");
  const sala = params.get("sala");
  const icons = {
    filter: "M3 5h18l-7 8v5l-4 2v-7z",
    download: "M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4",
    eye: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0"
  };

  function create(tag, className, label) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (label) element.textContent = label;
    return element;
  }

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", icons[name]);
    svg.append(path);
    return svg;
  }

  function installFilter(select) {
    const filter = create("div", "correction-filter");
    const trigger = create("button", "correction-filter-trigger");
    trigger.type = "button";
    trigger.append(icon("filter"));
    trigger.setAttribute("aria-controls", "correction-status-options");
    const options = create("div", "correction-filter-options");
    options.id = "correction-status-options";
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", "Situação da entrega");
    const choices = Array.from(select.options, option => {
      const choice = create("button", "", option.textContent);
      choice.type = "button";
      choice.onclick = () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        setOpen(false);
        trigger.focus();
      };
      options.append(choice);
      return { choice, value: option.value };
    });

    function setOpen(open) {
      options.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      const label = select.selectedOptions[0]?.textContent ?? "";
      trigger.setAttribute("aria-label", "Filtrar por situação. Atual: " + label);
      trigger.title = label;
      for (const { choice, value } of choices) {
        choice.setAttribute("aria-pressed", String(select.value === value));
      }
    }

    filter.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") setOpen(true);
    });
    filter.addEventListener("pointerleave", () => {
      if (!options.contains(document.activeElement)) setOpen(false);
    });
    trigger.onclick = event => {
      const mouseClick = event.detail > 0 && event.pointerType === "mouse";
      setOpen(mouseClick || options.hidden);
    };
    filter.addEventListener("focusout", event => {
      if (!filter.contains(event.relatedTarget)) setOpen(false);
    });
    filter.addEventListener("keydown", event => {
      if (event.key !== "Escape" || options.hidden) return;
      setOpen(false);
      trigger.focus();
    });
    filter.append(trigger, options);
    select.hidden = true;
    select.after(filter);
    setOpen(false);
  }

  function decorateStatuses() {
    for (const row of content.querySelectorAll("tbody tr")) {
      const status = row.cells[page === "corrections" ? 2 : 1];
      if (!status || status.dataset.decorated) continue;
      const label = status.textContent.trim();
      if (label !== "Corrigida" && label !== "A corrigir") continue;
      row.dataset.correctionState = label === "Corrigida" ? "done" : "pending";
      status.dataset.decorated = "true";
      status.replaceChildren(create("span", "correction-state", label));
    }
  }

  function corrections() {
    const select = content.querySelector('.filters select[aria-label="Situação da entrega"]');
    if (select && !select.hidden) installFilter(select);
    decorateStatuses();
  }

  function review() {
    const heading = document.getElementById("pageTitle");
    if (content.querySelector(".review-grid") && heading.textContent !== "Corrigir entrega") {
      heading.textContent = "Corrigir entrega";
      document.title = "Corrigir entrega · AstroLearn";
    }
    const evaluation = content.querySelector(".review-evaluation > p");
    if (evaluation && evaluation.textContent !== "Oriente o próximo passo do aluno.") {
      evaluation.textContent = "Oriente o próximo passo do aluno.";
    }
    for (const control of content.querySelectorAll(".review-file a, .review-file button")) {
      if (control.classList.contains("correction-file-action")) continue;
      const label = control.textContent.trim();
      if (label !== "Baixar" && label !== "Visualizar") continue;
      control.classList.add("correction-file-action");
      control.setAttribute("aria-label", label);
      control.replaceChildren(icon(label === "Baixar" ? "download" : "eye"), create("span", "", label));
    }
    const history = [...actions.querySelectorAll("a")].find(link =>
      new URL(link.href, location.href).pathname.endsWith("/aluno.html"));
    if (history && reviewId) {
      const target = new URL(history.href, location.href);
      if (target.searchParams.get("entrega") !== reviewId) {
        target.searchParams.set("entrega", reviewId);
        history.href = target.href;
      }
    }
  }

  function history() {
    if (!reviewId || !sala || !params.get("aluno") || !content.querySelector(".stats")) return;
    if (!actions.querySelector(".correction-back")) {
      const back = create("a", "secondary correction-back", "← Voltar à entrega");
      const target = new URL("correcao.html", location.href);
      target.searchParams.set("sala", sala);
      target.searchParams.set("entrega", reviewId);
      const period = new URLSearchParams(location.search).get("periodo");
      if (period) target.searchParams.set("periodo", period);
      back.href = target.href;
      actions.prepend(back);
    }
    decorateStatuses();
  }

  if (page === "corrections") {
    document.addEventListener("pointerdown", event => {
      const filter = content.querySelector(".correction-filter");
      if (filter && !filter.contains(event.target)) {
        filter.querySelector(".correction-filter-options").hidden = true;
        filter.querySelector("button").setAttribute("aria-expanded", "false");
      }
    });
  }

  const update = { corrections, review, student: history }[page];
  if (page === "student" && !reviewId) return;
  const observer = new MutationObserver(update);
  observer.observe(content, { childList: true, subtree: true });
  observer.observe(actions, { childList: true, subtree: true });
  update();
})();
