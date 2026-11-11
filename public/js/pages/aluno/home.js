/* Inicial aprovada: dados reais da turma, UI independente do cenário decorativo. */
import { sessaoObrigatoria, encerrar } from "../../services/conexao.js";
import { dashboard as consultarDashboard, entrarSala } from "../../services/aluno.js";
const sessao = sessaoObrigatoria("aluno");
const $ = (id) => document.getElementById(id);
const media = matchMedia("(prefers-reduced-motion: reduce)");
const semMovimento = () =>
  media.matches ||
  document.hidden ||
  document.body.classList.contains("motion-reduced") ||
  document.body.classList.contains("astro-motion-off");
const nome = (sessao.usuario.nome || "Explorador").trim().split(/\s+/)[0];
$("welcomeTitle").textContent = "Boas-vindas, " + nome + "!";
$("accountInitial").textContent = nome.trim().slice(0, 1).toUpperCase();
// Prévia da conta por hover; clique, Enter e toque mantêm o painel aberto.
const accountToggle = $("accountToggle"), accountPanel = $("accountPopover");
$("profileName").textContent = sessao.usuario.nome || "Explorador";
$("profileInitial").textContent = $("accountInitial").textContent;
$("profileEmail").textContent = sessao.usuario.email || "";
$("profileEmail").hidden = !sessao.usuario.email;
let accountTimer = 0, accountPinned = false;
function openAccount() { clearTimeout(accountTimer); accountPanel.hidden = false; accountToggle.setAttribute("aria-expanded", "true"); }
function closeAccount(restore = false) { clearTimeout(accountTimer); accountPanel.hidden = true; accountPinned = false; accountToggle.setAttribute("aria-expanded", "false"); if (restore) accountToggle.focus(); }
function leaveAccount() {
 clearTimeout(accountTimer);
 accountTimer = setTimeout(() => {
  if (!accountPinned && !accountToggle.matches(":hover") && !accountPanel.matches(":hover") && !accountPanel.contains(document.activeElement) && document.activeElement !== accountToggle) closeAccount();
 }, 220);
}
for (const target of [accountToggle, accountPanel]) {
 target.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") openAccount(); });
 target.addEventListener("pointerleave", leaveAccount);
 target.addEventListener("focusout", () => setTimeout(() => { if (!accountPanel.contains(document.activeElement) && document.activeElement !== accountToggle) closeAccount(); }, 0));
}
accountToggle.onclick = event => {
 if (!accountPanel.hidden && accountPinned) closeAccount();
 else { openAccount(); accountPinned = true; if (event.detail === 0) accountPanel.querySelector("a").focus(); }
};
$("closeAccount").onclick = () => closeAccount(true);
$("accountLogout").onclick = encerrar;
document.addEventListener("pointerdown", event => { if (!accountPanel.hidden && !accountPanel.contains(event.target) && !accountToggle.contains(event.target)) closeAccount(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !accountPanel.hidden) { event.preventDefault(); closeAccount(true); } });

$("logout").addEventListener("click", (event) => {
  event.preventDefault();
  encerrar();
});
const mobileNav = document.querySelector("#menu-mobile-dialog nav");
if (mobileNav) {
  const exit = document.createElement("a");
  exit.href = "../auth/login.html";
  exit.textContent = "Sair da conta";
  exit.onclick = (event) => {
    event.preventDefault();
    encerrar();
  };
  mobileNav.append(exit);
}
document.querySelectorAll('#mainNav a[aria-label]').forEach(link => { link.title = link.getAttribute('aria-label'); });
let dados = null,
  missoes = [],
  atual = -1,
  carregando = false,
  acao = null,
  origem = null,
  dialogoOcupado = false;

const icones = {
  check: '<path d="m5 12 4 4 10-10"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  play: '<path d="m9 5 10 7-10 7Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
function icone(tipo) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = icones[tipo];
  return svg;
}
function elemento(tag, texto = "", classe = "") {
  const e = document.createElement(tag);
  e.textContent = texto;
  e.className = classe;
  return e;
}
function abrir(titulo, conteudo, rotulo = "Entendi", callback = null) {
  origem = document.activeElement;
  acao = callback;
  $("dialogTitle").textContent = titulo;
  $("dialogContent").replaceChildren();
  if (typeof conteudo === "string") $("dialogContent").append(elemento("p", conteudo));
  else $("dialogContent").append(conteudo);
  $("dialogAction").textContent = rotulo;
  $("dialogAction").disabled = false;
  if (!$("dialog").open) $("dialog").showModal();
  $("closeDialog").focus();
}
function fechar() {
  if (dialogoOcupado) return;
  $("dialog").close();
}
$("closeDialog").onclick = fechar;
$("dialog").addEventListener("cancel", (e) => {
  if (dialogoOcupado) e.preventDefault();
});
$("dialog").addEventListener("close", () => origem?.isConnected && origem.focus());
$("dialogAction").onclick = () => (acao ? acao() : fechar());

function abrirMissao(index) {
  const m = missoes[index];
  if (!m) return;
  if (m.status_aluno === "bloqueada") {
    abrir(
      "Um novo mundo espera por você",
      "Conclua as etapas anteriores e acompanhe a validação do professor para descobrir a próxima missão.",
    );
    return;
  }
  location.assign("atividade.html?atividade=" + encodeURIComponent(m.id));
}
function montarTrilha() {
  const lista = $("missionList");
  lista.replaceChildren();
  const labels = {
    concluida: "Concluída",
    entregue: "Aguardando correção",
    disponivel: "Sua próxima missão",
    corrigida_sem_validacao: "Confira o retorno",
    bloqueada: "Mundo desconhecido",
  };
  missoes.forEach((m, i) => {
    const bloqueada = m.status_aluno === "bloqueada",
      concluida = m.status_aluno === "concluida";
    const item = elemento(
      "li",
      "",
      "step" +
        (bloqueada ? " locked" : "") +
        (concluida ? " done" : "") +
        (i === atual ? " current" : ""),
    );
    const planeta = elemento("button", "", "planet");
    planeta.type = "button";
    item.id = "missao-" + m.id;
    planeta.dataset.indice = String(i);
    planeta.dataset.familia=String(i%6);
    const row=[0,1,2,0,1,2][i%6];
    planeta.style.setProperty('--faixa',row*50+'%');
    planeta.style.setProperty("--matiz", (i < 3 ? 0 : i*137.508%360)+"deg");
    planeta.style.setProperty("--tempo", (30+i%13)+"s");
    planeta.setAttribute(
      "aria-label",
      bloqueada
        ? "Missão bloqueada: mundo desconhecido"
        : m.titulo + " — " + (labels[m.status_aluno] || "Atividade"),
    );
    planeta.style.setProperty("--world-x", (i % 5) * 25 + "%");
    planeta.dataset.world = String(i % 5);
    const arte = elemento("span", "", "planet-art");
    arte.setAttribute("aria-hidden", "true");
    planeta.append(arte);
    if (bloqueada) {
      const misterio = elemento("span", "", "mystery-world");
      misterio.setAttribute("aria-hidden", "true");
      misterio.append(icone("lock"));
      planeta.append(misterio);
    } else {
      if (i !== 0) {
        const construcao = elemento("span", "", "world-building");
        construcao.setAttribute("aria-hidden", "true");
        construcao.style.setProperty("--building-x", ((i % 6) % 3) * 50 + "%");
        construcao.style.setProperty("--building-y", i % 6 < 3 ? "0%" : "100%");
        planeta.append(construcao);
      }
      const nevoa = elemento("span", "", "world-mist");
      nevoa.setAttribute("aria-hidden", "true");
      planeta.append(nevoa);
      for (let j = 0; j < 5; j++) {
        const fragmento = elemento("span", "", "world-debris");
        fragmento.setAttribute("aria-hidden", "true");
        fragmento.style.setProperty("--phase", (-j * 5 - i * 1.7) + "s");
        planeta.append(fragmento);
      }
      const estado = elemento("span", "", "planet-status");
      estado.setAttribute("aria-hidden", "true");
      estado.append(
        icone(concluida ? "check" : m.status_aluno === "entregue" ? "clock" : "play"),
      );
      planeta.append(estado);
    }
    planeta.onclick = () => abrirMissao(i);
    const texto = elemento("div", "", "step-copy");
    texto.append(elemento("h2", bloqueada ? "Um novo mundo" : m.titulo));
    if (bloqueada) texto.append(elemento("p", "Uma nova descoberta espera por você."));
    else if (concluida) texto.append(elemento("p", "✓ Concluída", "status-label"));
    else if (i === atual && m.status_aluno === "disponivel") {
      texto.append(elemento("span", "Sua próxima missão", "mission-badge"));
      const iniciar = elemento("a", "Iniciar missão →", "primary");
      iniciar.href = "atividade.html?atividade=" + encodeURIComponent(m.id);
      texto.append(iniciar);
    } else
      texto.append(
        elemento(
          "p",
          labels[m.status_aluno] || "Confira sua atividade",
          "status-label pending",
        ),
      );
    if (!bloqueada && !texto.querySelector("a")) {
      const consultar = elemento("a", concluida ? "Rever missão →" : "Ver atividade →", "mission-link");
      consultar.href = "atividade.html?atividade=" + encodeURIComponent(m.id);
      texto.append(consultar);
    }
    item.append(planeta, texto);
    if (i < missoes.length - 1) {
      const caminho = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      caminho.setAttribute("viewBox", "0 0 140 120");
      caminho.setAttribute("preserveAspectRatio", "none");
      caminho.setAttribute("class", "trail-connector");
      caminho.setAttribute("aria-hidden", "true");
      caminho.innerHTML = '<path d="M12 8 C12 60 128 60 128 112"/><circle cx="12" cy="8" r="5"/><circle cx="128" cy="112" r="5"/>';
      item.append(caminho);
    }
    lista.append(item);
  });
  document.dispatchEvent(new CustomEvent("astrolearn:planets"));
  const destino = new URLSearchParams(location.search).get("missao");
  if(destino){const step=document.getElementById("missao-"+destino);if(step)requestAnimationFrame(()=>{step.querySelector("button")?.focus({preventScroll:true});step.scrollIntoView({block:"center"})});}
}
async function carregar() {
  if (carregando) return;
  carregando = true;
  $("continue").disabled = true;
  $("missionList").setAttribute("aria-busy", "true");
  $("journeyMessage").textContent = "Preparando sua próxima descoberta…";
  try {
    dados = await consultarDashboard();
    missoes = (dados.periodos_trilha || []).flatMap((periodo) =>
      (periodo.missoes || []).map((m) => ({
        ...m,
        periodo_nome: periodo.nome,
        status_aluno: periodo.acessivel === false ? "bloqueada" : m.status_aluno,
      })),
    );
    atual = missoes.findIndex((m) => m.status_aluno === "disponivel");
    if (atual < 0)
      atual = missoes.findIndex(
        (m) => !["concluida", "bloqueada"].includes(m.status_aluno),
      );
    const total = Math.max(0, Number(dados.total) || missoes.length),
      feitas = Math.max(0, Math.min(total, Number(dados.concluidas) || 0));
    $("progressLabel").textContent = feitas + " de " + total + " missões concluídas";
    const percent = total ? Math.round((feitas / total) * 100) : 0;
    $("progressFill").style.width = percent + "%";
    document
      .querySelector(".progress-track")
      .setAttribute("aria-valuenow", String(percent));
    $("roomLabel").textContent =
      dados.sala?.nome || "Peça o código da turma ao professor.";
    montarTrilha();
    $("journeyMessage").textContent = !dados.tem_sala
      ? "Entre na sua turma para começar sua expedição."
      : !missoes.length
        ? "Seu professor ainda está preparando as missões. Volte em breve."
        : "";
    $("continue").textContent = !dados.tem_sala
      ? "Entrar na turma"
      : atual >= 0
        ? "Continuar missão →"
        : "Explorar minha trilha ↓";
    $("continue").onclick = () =>
      !dados.tem_sala
        ? entrarNaTurma()
        : atual >= 0
          ? abrirMissao(atual)
          : $("journey").scrollIntoView({
              behavior: semMovimento() ? "instant" : "smooth",
            });
  } catch (error) {
    $("journeyMessage").textContent =
      "Não foi possível carregar sua trilha. " + error.message;
    $("continue").textContent = "Tentar novamente";
    $("continue").onclick = carregar;
  } finally {
    carregando = false;
    $("continue").disabled = false;
    $("missionList").setAttribute("aria-busy", "false");
  }
}
function entrarNaTurma() {
  const caixa = elemento("form");
  const label = elemento("label", "Código fornecido pelo professor");
  label.htmlFor = "classCode";
  const input = elemento("input");
  input.id = "classCode";
  input.maxLength = 30;
  input.autocomplete = "off";
  input.required = true;
  const aviso = elemento("p");
  aviso.id = "classStatus";
  aviso.setAttribute("role", "status");
  caixa.append(label, input, aviso);
  const enviar = async () => {
    if (dialogoOcupado) return;
    const codigo = input.value.trim();
    if (!codigo) {
      aviso.textContent = "Informe o código.";
      input.focus();
      return;
    }
    dialogoOcupado = true;
    input.disabled = true;
    $("dialogAction").disabled = true;
    aviso.textContent = "Conferindo a turma…";
    try {
      await entrarSala(codigo);
      dialogoOcupado = false;
      fechar();
      await carregar();
    } catch (error) {
      aviso.textContent = error.message;
    } finally {
      dialogoOcupado = false;
      input.disabled = false;
      $("dialogAction").disabled = false;
    }
  };
  caixa.onsubmit = (e) => {
    e.preventDefault();
    enviar();
  };
  abrir("Entre na sua turma", caixa, "Entrar", enviar);
  input.focus();
}
$("progress").onclick = () =>
  abrir(
    "Seu progresso",
    dados
      ? `${dados.concluidas || 0} de ${dados.total || 0} missões concluídas. As informações acompanham o registro e a correção das atividades da sua turma.`
      : "Sua trilha ainda está sendo carregada.",
  );
// Avisos reais: o módulo mantém a gaveta e consulta o servidor.
const notificationPanel = $('notificationPanel');
$('notifications').onclick = () => {
 closeAccount(); if (!$('chatPanel').hidden) chat(false);
 if (!notificationPanel.open) notificationPanel.showModal();
 document.body.classList.add('notifications-open');
 $('notifications').setAttribute('aria-expanded','true');
 window.dispatchEvent(new Event('astro-notifications-open'));
};
$('closeNotifications').onclick = () => notificationPanel.close();
notificationPanel.addEventListener('close',()=>{
 document.body.classList.remove('notifications-open');$('notifications').setAttribute('aria-expanded','false');$('notifications').focus();
});
notificationPanel.addEventListener('click',event=>{
 if(event.target!==notificationPanel) return;
 const r=notificationPanel.getBoundingClientRect();
 if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) notificationPanel.close();
});

// O mesmo ET da conta aparece em oito vistas no visualizador lateral.
import { iniciarVistas } from "../../components/avatar-vistas.js";
let fade = null, reacao = null, reacaoTimer = 0;
const visualizador = iniciarVistas({render:$("avatarRender"), slider:$("avatarRotation"), angleLabel:$("avatarAngle"), stage:$("avatarStage"), stopped:semMovimento});
function girar() { visualizador.rotate(); }
visualizador.select(0);
$("avatarRotation").oninput = girar;
// A barra ocupa também o espaço que antes era reservado às setas.
const controlesAvatar = $("avatarLeft")?.parentElement;
if (controlesAvatar?.contains($("avatarRotation")) && controlesAvatar.contains($("avatarRight"))) controlesAvatar.classList.add("avatar-rotation-bar");
// Os nós saem também da navegação por teclado.
$("avatarLeft")?.remove();
$("avatarRight")?.remove();

girar();
$("avatarStage").addEventListener("pointermove", (event) => {
  if (semMovimento() || event.pointerType === "touch") return;
  const rect = $("avatarStage").getBoundingClientRect();
  $("avatarStage").style.setProperty(
    "--avatar-lean",
    ((event.clientX - rect.left) / rect.width - 0.5) * 1.2 + "deg",
  );
});
$("avatarStage").addEventListener("pointerleave", () =>
  $("avatarStage").style.setProperty("--avatar-lean", "0deg"),
);
$("avatarStage").onclick = () => {
  reacao?.cancel();
  clearTimeout(reacaoTimer);
  $("avatarReaction").textContent = "Opa! Pronto para mais uma descoberta?";
  $("avatarReaction").classList.add("visible");
  if (!semMovimento()) {
    reacao = $("avatarStage").animate(
      [
        { transform: "translateX(0) rotate(0)" },
        { transform: "translateY(-3px) rotate(1.5deg)", offset: 0.2 },
        { transform: "translateY(0px) rotate(-1deg)", offset: 0.5 },
        { transform: "translateY(-1px) rotate(.5deg)", offset: 0.75 },
        { transform: "translateX(0) rotate(0)" },
      ],
      { duration: 850, easing: "cubic-bezier(.2,.7,.3,1)" },
    );
    reacao.finished.catch(() => {});
  }
  reacaoTimer = setTimeout(() => $("avatarReaction").classList.remove("visible"), 3200);
};
const lugar = document.createComment("Visualizador no desktop");
$("avatarViewer").before(lugar);
const telaPequena = matchMedia("(max-width:1000px)");
function posicionarAvatar() {
  if (telaPequena.matches) $("avatarDialog").append($("avatarViewer"));
  else {
    if ($("avatarDialog").open) $("avatarDialog").close();
    lugar.after($("avatarViewer"));
  }
}
$("openAvatar").onclick = () => $("avatarDialog").showModal();
$("closeAvatar").onclick = () => $("avatarDialog").close();
$("avatarDialog").addEventListener("close", () => $("openAvatar").focus());
telaPequena.addEventListener("change", posicionarAvatar);
posicionarAvatar();

// Ajuda rápida local: deixa explícito que não representa respostas do professor.
function chat(aberto) {
  $("chatPanel").hidden = !aberto;
  $("chatPanel").inert = !aberto;
  $("chatToggle").setAttribute("aria-expanded", String(aberto));
  if (aberto) $("chatInput").focus();
  else $("chatToggle").focus();
}
$("chatToggle").onclick = () => chat($("chatPanel").hidden);
$("chatClose").onclick = () => chat(false);
$("chatPanel").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    chat(false);
  }
});
function responder(pergunta) {
  const p = pergunta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/avatar|girar|explorador/.test(p))
    return "A barra mostra seu explorador em oito vistas renderizadas. Arraste ou use as setas para mudar o ângulo. Não é um modelo 3D articulado.";
  if (/envi|entrega|arquivo/.test(p))
    return "Abra a missão e leia as orientações da sua turma. Em “Sua entrega”, use as opções disponíveis e aguarde a confirmação do envio. Se o campo estiver indisponível, combine a entrega com seu professor.";
  if (/biblioteca|material/.test(p))
    return "Na Biblioteca você encontra os materiais compartilhados com sua turma. A própria atividade também mostra os materiais vinculados a ela.";
  if (/bloque|missao|trilha|comec/.test(p))
    return "Clique no planeta disponível ou em “Continuar missão”. Leia as instruções, faça sua investigação e acompanhe a correção. Os mundos bloqueados serão revelados conforme sua turma avança.";
  if (/equipe|grupo/.test(p))
    return "Veja os integrantes em Minha equipe. Combine as responsabilidades com seu grupo e siga a orientação do professor para cada atividade.";
  if (/sol|curios|universo|estrela/.test(p))
    return "A luz do Sol leva cerca de oito minutos para chegar à Terra. No fundo da página, você também pode criar estrelas clicando nos espaços livres e afastá-las com o cursor.";
  return "Posso ajudar com a trilha, materiais, equipe, avatar e uso da plataforma. Para uma dúvida sobre o conteúdo de uma atividade, converse com seu professor. Não tenho acesso às respostas da sua pesquisa.";
}
function adicionarMensagem(texto, classe) {
  $("chatLog").append(elemento("p", texto, "chat-message " + classe));
  while ($("chatLog").children.length > 40) $("chatLog").firstElementChild.remove();
  $("chatLog").scrollTop = $("chatLog").scrollHeight;
}
function perguntar(texto) {
  if (!texto.trim()) return;
  adicionarMensagem(texto, "user");
  adicionarMensagem(responder(texto), "bot");
  $("chatInput").value = "";
}
$("chatForm").onsubmit = (e) => {
  e.preventDefault();
  perguntar($("chatInput").value.slice(0, 500));
};
document
  .querySelectorAll("[data-topic]")
  .forEach((botao) => (botao.onclick = () => perguntar(botao.dataset.topic)));

function movimento() {
  const pausado =
    media.matches ||
    document.body.classList.contains("motion-reduced") ||
    document.body.classList.contains("astro-motion-off");
  if (pausado) {
    fade?.cancel();
    reacao?.cancel();
  }
  document.dispatchEvent(new CustomEvent("astrolearn:motion"));
}
media.addEventListener("change", movimento);
document.addEventListener("astrolearn:preferences", movimento);
movimento();
window.addEventListener("pagehide", () => {
  clearTimeout(reacaoTimer);
  fade?.cancel();
  reacao?.cancel();
});
carregar();

const expStyle=document.createElement('link');expStyle.rel='stylesheet';expStyle.href=new URL('../../../css/pages/aluno/expedicao.css',import.meta.url);document.head.append(expStyle);
import {lerET} from "../../services/avatar-conta.js";
let consultaET=0;
async function mostrarEt(){
 const atual=++consultaET;let n;try{n=await lerET()}catch{return}
 if(atual!==consultaET)return;
 const ok=n>=0;
 const elements=[$("profileInitial"),$("accountInitial")];
 elements.forEach(el=>{el.classList.toggle('et-escolhido',ok);if(ok)el.style.setProperty('--quadro-et', (n%4*100/3)+'% '+(n<4?0:100)+'%')});
 await visualizador.select(ok ? n : 0);
}
mostrarEt();window.addEventListener('pageshow',e=>{if(e.persisted)mostrarEt()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)mostrarEt()});

function pausarDecoracaoOculta(){document.body.classList.toggle('expedicao-hidden',document.hidden)}
document.addEventListener('visibilitychange',pausarDecoracaoOculta);pausarDecoracaoOculta();
