(() => {
  const content = document.getElementById("content");

  function prepareChart(panel) {
    const svg = panel.querySelector("svg");
    if (!svg || panel.dataset.historyChart) return;
    panel.dataset.historyChart = "true";
    svg.setAttribute("role", "group");
    const tooltip = document.createElement("div");
    tooltip.className = "history-chart-tooltip";
    tooltip.id = "history-grade-tooltip";
    tooltip.hidden = true;
    tooltip.setAttribute("role", "tooltip");
    panel.append(tooltip);

    for (const point of svg.querySelectorAll("circle")) {
      const title = point.querySelector("title");
      const label = title?.textContent;
      if (!label) continue;
      point.setAttribute("tabindex", "0");
      point.setAttribute("aria-label", label);
      point.setAttribute("aria-describedby", tooltip.id);
      title.remove();
      const show = () => {
        tooltip.textContent = label;
        tooltip.hidden = false;
        const bounds = panel.getBoundingClientRect();
        const position = point.getBoundingClientRect();
        const x = position.x + position.width / 2 - bounds.x;
        tooltip.style.left = Math.max(tooltip.offsetWidth / 2 + 8,
          Math.min(bounds.width - tooltip.offsetWidth / 2 - 8, x)) + "px";
        tooltip.style.top = Math.max(8, position.top - bounds.top - tooltip.offsetHeight - 10) + "px";
      };
      const hide = () => { tooltip.hidden = true; };
      point.addEventListener("pointerenter", show);
      point.addEventListener("pointerleave", () => {
        if (document.activeElement !== point) hide();
      });
      point.addEventListener("focus", show);
      point.addEventListener("blur", hide);
      point.addEventListener("keydown", event => {
        if (event.key === "Escape") hide();
      });
    }
  }

  function prepareSituation(panel) {
    if (panel.dataset.historySituation) return;
    const rows = [...panel.querySelectorAll(".bar-row")];
    if (!rows.length) return;
    panel.dataset.historySituation = "true";
    panel.classList.add("history-situation");
    const track = document.createElement("div");
    track.className = "history-situation-track";
    track.setAttribute("aria-hidden", "true");
    let total = 0;
    const values = rows.map(row => {
      const count = Number(row.querySelector("strong").textContent);
      total += count;
      return count;
    });
    rows.forEach((row, index) => {
      const segment = document.createElement("span");
      segment.className = "history-situation-segment history-status-" + index;
      segment.style.flexGrow = values[index];
      segment.hidden = !values[index];
      track.append(segment);
      row.querySelector(".bar-track").hidden = true;
      row.classList.add("history-status-" + index);
    });
    if (!total) track.classList.add("is-empty");
    rows[0].before(track);
  }

  function prepareFeedback(cell) {
    if (cell.dataset.historyFeedback) return;
    cell.dataset.historyFeedback = "true";
    const text = cell.textContent;
    if (text.length <= 100 && !text.includes("\n")) return;
    const preview = document.createElement("p");
    preview.className = "history-feedback-preview";
    preview.textContent = text;
    const toggle = document.createElement("button");
    toggle.className = "history-feedback-toggle";
    toggle.type = "button";
    toggle.textContent = "Ler devolutiva";
    toggle.setAttribute("aria-expanded", "false");
    toggle.onclick = () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      preview.classList.toggle("is-expanded", expanded);
      toggle.textContent = expanded ? "Recolher devolutiva" : "Ler devolutiva";
    };
    cell.replaceChildren(preview, toggle);
  }

  function update() {
    const stats = content.querySelector(".stats");
    if (!stats) return;
    const subtitle = document.getElementById("pageSubtitle");
    if (subtitle.textContent !== "Acompanhamento individual") subtitle.textContent = "Acompanhamento individual";
    const columns = content.querySelector(".two-columns");
    const chart = columns?.querySelector(".chart");
    if (chart) prepareChart(chart);
    const situation = columns?.lastElementChild;
    if (situation) prepareSituation(situation);
    const table = content.querySelector(":scope > .panel table");
    if (!table) return;
    table.classList.add("history-activities");
    const panel = table.closest(".panel");
    panel.classList.add("history-activities-panel");
    for (const row of table.querySelectorAll("tbody tr")) {
      const state = row.cells[1];
      const label = state.textContent.trim();
      if (["Corrigida", "A corrigir"].includes(label) && !state.querySelector(".correction-state")) {
        const badge = document.createElement("span");
        badge.className = "correction-state";
        badge.textContent = label;
        row.dataset.correctionState = label === "Corrigida" ? "done" : "pending";
        state.replaceChildren(badge);
      }
      prepareFeedback(row.cells[3]);
      const link = row.cells[4].querySelector("a");
      if (link && link.textContent !== "Abrir entrega →") link.textContent = "Abrir entrega →";
    }
  }

  new MutationObserver(update).observe(content, { childList: true, subtree: true });
  update();
})();
