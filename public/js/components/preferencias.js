/* Preferências comuns às áreas do aluno, independentes do login e do saldo. */
(() => {
  "use strict";
  const KEY = "astrolearn-preferences-v1",
    defaults = { animations: true, textSize: 100, contrast: false };
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  function clean(v) {
    return {
      animations: typeof v?.animations === "boolean" ? v.animations : true,
      textSize: Number.isFinite(v?.textSize)
        ? Math.round(Math.max(100, Math.min(150, v.textSize)) / 5) * 5
        : 100,
      contrast: v?.contrast === true,
    };
  }
  let saved = { ...defaults },
    current = { ...defaults },
    readError = false;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw?.version === 1) saved = clean(raw);
  } catch {
    readError = true;
  }
  /* Medir antes de ampliar evita multiplicar fontes herdadas. A regra não altera imagens. */
  const original = new Map();
  let resizing = false;
  function resizeText() {
    if (resizing) return;
    resizing = true;
    for (const [el, size] of original) {
      if (!el.isConnected) {
        original.delete(el);
        continue;
      }
      el.style.fontSize = size;
    }
    const nodes = [...document.querySelectorAll("body *")].filter(
      (el) =>
        ![
          "SCRIPT",
          "STYLE",
          "SVG",
          "PATH",
          "CIRCLE",
          "ELLIPSE",
          "CANVAS",
          "OPTION",
        ].includes(el.tagName) &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
          [...el.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim(),
          )),
    );
    const values = nodes.map((el) => ({
      el,
      size: parseFloat(getComputedStyle(el).fontSize),
    }));
    for (const { el, size } of values) {
      if (!original.has(el)) original.set(el, el.style.fontSize || "");
      if (current.textSize !== 100 && Number.isFinite(size))
        el.style.fontSize = (size * current.textSize) / 100 + "px";
    }
    resizing = false;
  }
  function apply(v) {
    current = clean(v);
    const off = !current.animations || media.matches;
    document.body.classList.toggle("astro-motion-off", off);
    document.body.classList.toggle("astro-high-contrast", current.contrast);
    document.body.classList.toggle("astro-text-large", current.textSize > 100);
    document.documentElement.style.setProperty(
      "--astro-text-size",
      String(current.textSize),
    );
    resizeText();
    if (off) document.getAnimations?.().forEach((a) => a.cancel());
    const b = document.getElementById("motion");
    if (b) {
      b.disabled = off;
      b.title = off
        ? "As animações estão desativadas nas preferências ou pelo sistema. Abra o Perfil para ajustar."
        : "";
    }
    document.dispatchEvent(
      new CustomEvent("astrolearn:preferences", {
        detail: { ...current, systemReduced: media.matches },
      }),
    );
    document.dispatchEvent(new CustomEvent("astrolearn:motion"));
    if (off) document.getAnimations?.().forEach((a) => a.cancel());
    if (b && off) {
      b.disabled = true;
      b.setAttribute("aria-pressed", "true");
    }
    const stars = document.getElementById("starMotion");
    if (stars) {
      stars.disabled = off;
      if (off)
        stars.title = "Movimento desativado nas preferências ou pelo sistema.";
    }
  }
  window.AstroPrefs = {
    defaults: { ...defaults },
    get: () => ({ ...current }),
    saved: () => ({ ...saved }),
    systemReduced: () => media.matches,
    readError: () => readError,
    preview: apply,
    save(v) {
      const next = clean(v);
      try {
        localStorage.setItem(KEY, JSON.stringify({ version: 1, ...next }));
        saved = next;
        apply(next);
        return true;
      } catch {
        return false;
      }
    },
  };
  apply(saved);
  media.addEventListener?.("change", () => apply(current));
  window.addEventListener("resize", resizeText);
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      const raw = JSON.parse(e.newValue || "null");
      saved = raw?.version === 1 ? clean(raw) : { ...defaults };
      apply(saved);
    } catch {}
  });
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some((m) => m.addedNodes.length || m.type === "characterData")
      )
        resizeText();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
})();

/* Um único assistente compacto em todas as páginas internas. */
(() => {const source=document.currentScript?.src;if(!source||! /\/(aluno|professor)\//.test(location.pathname))return;const script=document.createElement('script');script.src=new URL('./assistente-flutuante.js?v=chat-walk-3',source).href;script.defer=true;document.head.append(script);})();

/* Topo consistente nas áreas internas, sem substituir o cabeçalho da trilha. */
(()=>{const source=document.currentScript?.src;if(!source||document.querySelector('script[data-astro-account]'))return;const script=document.createElement('script');script.type='module';script.dataset.astroAccount='';script.src=new URL('./cabecalho-conta.js',source).href;document.head.append(script);})();
