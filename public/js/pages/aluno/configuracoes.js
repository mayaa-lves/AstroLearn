/* Preferências com prévia; exclusão somente após confirmação explícita. */
const $ = (id) => document.getElementById(id),
  prefs = window.AstroPrefs;
const chaveSom='astrolearn-som-notificacoes';
try{$("somNotificacoes").checked=localStorage.getItem(chaveSom)!=='off'}catch{}
function values() {
  return {
    animations: prefs.systemReduced()
      ? prefs.get().animations
      : $("animations").checked,
    textSize: Number($("textSize").value),
    contrast: $("contrast").checked,
  };
}
function range() {
  const n = Number($("textSize").value);
  $("textSizeValue").textContent = n + "%";
  $("textSize").setAttribute("aria-valuetext", n + " por cento");
  $("textSize").style.setProperty("--range-fill", (n - 100) * 2 + "%");
}
function controls(v) {
  $("animations").checked = v.animations && !prefs.systemReduced();
  $("animations").disabled = prefs.systemReduced();
  $("animationHint").textContent = prefs.systemReduced()
    ? "Seu aparelho está configurado para reduzir movimentos."
    : "Movimentos suaves na plataforma.";
  $("textSize").value = v.textSize;
  $("contrast").checked = v.contrast;
  range();
}
controls(prefs.get());
if (prefs.readError())
  $("pageError").textContent = "Não foi possível ler as preferências salvas.";
function preview() {
  range();
  prefs.preview(values());
  $("preferenceStatus").textContent =
    "Prévia aplicada. Salve para manter os ajustes.";
}
$("textSize").addEventListener("input", preview);
["animations", "contrast"].forEach((id) =>
  $(id).addEventListener("change", preview),
);
$("preferencesForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (prefs.save(values())) {
    try{localStorage.setItem(chaveSom,$("somNotificacoes").checked?'on':'off')}catch{$("pageError").textContent='Não foi possível salvar o som.';return}
    $("pageError").textContent = "";
    $("preferenceStatus").textContent = "Preferências salvas neste navegador.";
  } else
    $("pageError").textContent =
      "Não foi possível salvar. Permita o armazenamento e tente novamente.";
});
$("restore").onclick = () => {
  controls(prefs.defaults);$("somNotificacoes").checked=true;
  prefs.preview(prefs.defaults);
  $("preferenceStatus").textContent =
    "Padrão restaurado em prévia. Salve para confirmar.";
};
document.addEventListener("astrolearn:preferences", () => {
  $("animations").disabled = prefs.systemReduced();
  $("animations").checked = prefs.systemReduced()
    ? false
    : prefs.get().animations;
});
$("clearLocal").onclick = () => {
  $("clearError").textContent = "";
  $("clearDialog").showModal();
  $("cancelClear").focus();
};
$("cancelClear").onclick = () => $("clearDialog").close();
$("clearDialog").addEventListener("close", () => $("clearLocal").focus());
$("confirmClear").onclick = () => {
  try {
    const ownedKeys = new Set([
      "astrolearn-preferences-v1",
      "astrolearn-display-name-v1",
      "astrolearn-games-v1",
      "astrolearn-menu",
      "astrolearn-avatar-v1",
      "astrolearn-library-v1",
      "astrolearn-team-v1",
      "astrolearn-helper-intro-v5",
      "astro-stars-paused",
    ]);
    for (const store of [localStorage, sessionStorage]) {
      const keys = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (ownedKeys.has(key)) keys.push(key);
      }
      keys.forEach((k) => store.removeItem(k));
    }
    prefs.save(prefs.defaults);
    controls(prefs.defaults);
    document
      .querySelectorAll("[data-student-name]")
      .forEach(
        (e) =>
          (e.textContent =
            document.getElementById("studentName")?.textContent ||
            "Explorador"),
      );
    $("storageStatus").textContent =
      "Dados de demonstração apagados. Outras abas refletem as mudanças ao recarregar.";
    $("clearDialog").close();
  } catch {
    $("clearError").textContent =
      "Não foi possível concluir a limpeza. Alguns dados podem ter sido removidos. Verifique as permissões do navegador.";
  }
};
