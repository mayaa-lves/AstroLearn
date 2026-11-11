/* Preferências locais; nenhum nome fictício ou edição de cadastro escolar. */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const prefs = window.AstroPrefs;
  const tabs = [
    $("preferencesTab"),
    $("securityTab")
  ];

  function selectTab(tab, focus = true) {
    tabs.forEach(item => {
      const active = item === tab;

      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;

      $(item.getAttribute("aria-controls")).hidden = !active;
    });

    if (focus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));

    tab.addEventListener("keydown", event => {
      let next;

      if (event.key === "ArrowRight") {
        next = tabs[(index + 1) % tabs.length];
      }

      if (event.key === "ArrowLeft") {
        next = tabs[(index + tabs.length - 1) % tabs.length];
      }

      if (event.key === "Home") {
        next = tabs[0];
      }

      if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }

      if (next) {
        event.preventDefault();
        selectTab(next);
      }
    });
  });

  if (!prefs) {
    $("preferencesForm")
      .querySelectorAll("input,button")
      .forEach(el => {
        el.disabled = true;
      });

    $("pageError").textContent =
      "Não foi possível carregar as preferências. " +
      "Confira o arquivo compartilhado preferencias.js.";

    return;
  }

  function range() {
    const value = Number($("textSize").value);

    $("textSizeValue").textContent = value + "%";

    $("textSize").setAttribute(
      "aria-valuetext",
      value + " por cento"
    );

    $("textSize").style.setProperty(
      "--range-fill",
      ((value - 100) / 50 * 100) + "%"
    );
  }

  function controls(values) {
    const reduced = prefs.systemReduced();

    $("animations").checked =
      values.animations && !reduced;

    $("animations").disabled = reduced;

    $("animationHint").textContent = reduced
      ? "Seu sistema está configurado para reduzir movimentos."
      : "Movimentos suaves durante a navegação.";

    $("textSize").value = String(values.textSize);
    $("contrast").checked = values.contrast;

    range();
  }

  function values() {
    return {
      animations: prefs.systemReduced()
        ? prefs.get().animations
        : $("animations").checked,

      textSize: Number($("textSize").value),

      contrast: $("contrast").checked
    };
  }

  function preview() {
    range();
    prefs.preview(values());

    $("preferenceStatus").textContent =
      "Prévia aplicada. Salve para manter as mudanças.";

    $("pageError").textContent = "";
  }

  $("textSize").addEventListener("input", preview);
  $("animations").addEventListener("change", preview);
  $("contrast").addEventListener("change", preview);

  $("preferencesForm").addEventListener("submit", event => {
    event.preventDefault();

    if (prefs.save(values())) {
      $("preferenceStatus").textContent =
        "Preferências salvas neste navegador.";

      $("pageError").textContent = "";
    } else {
      $("preferenceStatus").textContent = "";

      $("pageError").textContent =
        "Não foi possível salvar. A prévia continua ativa, " +
        "mas os ajustes anteriores foram mantidos. " +
        "Permita o armazenamento do site e tente novamente.";
    }
  });

  $("restore").addEventListener("click", () => {
    controls(prefs.defaults);
    prefs.preview(prefs.defaults);

    $("preferenceStatus").textContent =
      "Padrão restaurado em prévia. Salve para confirmar.";

    $("pageError").textContent = "";
  });

  controls(prefs.get());

  if (prefs.readError()) {
    $("pageError").textContent =
      "Não foi possível ler as preferências anteriores. " +
      "Nenhum ajuste salvo foi substituído.";
  }

  document.addEventListener("astrolearn:preferences", () => {
    controls(prefs.get());
  });
})();
