// Cadastro em duas etapas sobre o cenário aprovado. Usa a autenticação existente.

import { destinoAposLogin } from "../../services/autenticacao.js";

import { cadastrarEVerificarAcesso, mensagemDeAcesso } from "../../services/cadastro-acesso.js";

import { matricularNoCadastro } from "../../services/cadastro-turma.js";



const $ = (id) => document.getElementById(id);

const body = document.body;

const form = $("cadastro-form");

const status = $("cadastro-status");

const senha = $("senha");

const confirmar = $("confirmar");

const chave = $("chave");

const media = matchMedia("(prefers-reduced-motion: reduce)");

const privados = [senha, confirmar, chave];

const botoesPerfil = [...document.querySelectorAll("[data-profile]")];

const olhos = [...document.querySelectorAll(".olho")];

const canvas = document.querySelector(".cenario-canvas");

let perfil = null;

let ocupado = false;

let criado = false;

let transicao = false;

let pausaManual = false;

let controle = null;

let ativo = true;

let animacao = null;

let quadro = 0;

let dicaTimer = 0;



const semMovimento = () => media.matches || pausaManual || document.hidden;

function limparOlhar() {

  cancelAnimationFrame(quadro);

  quadro = 0;

  olhos.forEach((olho) => (olho.style.translate = "0px 0px"));

}

function privacidade() {

  body.classList.toggle("senha-ativa", privados.includes(document.activeElement));

}

function atualizarMovimento() {

  body.classList.toggle("sem-movimento", media.matches || pausaManual);

  $("movimento").disabled = media.matches;

  $("movimento").textContent = media.matches

    ? "Movimentos reduzidos"

    : pausaManual

      ? "Ativar animações"

      : "Pausar animações";

  $("movimento").setAttribute("aria-pressed", String(media.matches || pausaManual));

  if (semMovimento()) {

    limparOlhar();

    animacao?.finish();

  }

}

$("movimento").onclick = () => {

  pausaManual = !pausaManual;

  atualizarMovimento();

};

media.addEventListener("change", atualizarMovimento);

atualizarMovimento();



function mensagem(texto, falha = false) {

  status.textContent = texto;

  status.setAttribute("role", falha ? "alert" : "status");

  status.style.color = falha ? "#962944" : "#2c5e45";

}

function erro(campo, texto = "") {

  const aviso = $(campo.id + "-erro");

  campo.setAttribute("aria-invalid", String(Boolean(texto)));

  if (aviso) {

    aviso.textContent = texto;

    aviso.hidden = !texto;

  }

  return !texto;

}

function iconeSenha(aberto) {

  return (

    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>' +

    (!aberto ? '<path d="m3 3 18 18"/>' : "") +

    "</svg>"

  );

}

function protegerCampos() {

  privados.forEach((campo) => {

    campo.value = "";

    campo.type = "password";

    erro(campo);

  });

  document.querySelectorAll("[data-senha]").forEach((botao) => {

    botao.setAttribute("aria-pressed", "false");

    botao.setAttribute(

      "aria-label",

      botao.dataset.senha === "chave"

        ? "Mostrar chave de autorização"

        : botao.dataset.senha === "confirmar"

          ? "Mostrar confirmação da senha"

          : "Mostrar senha",

    );

    botao.innerHTML = iconeSenha(false);

  });

  atualizarRequisitos();

  body.classList.remove("senha-ativa");

}



async function animar(elemento, frames, duracao) {

  if (semMovimento() || !elemento.animate) return;

  animacao = elemento.animate(frames, {

    duration: duracao,

    easing: "cubic-bezier(.22,.7,.2,1)",

  });

  try {

    await animacao.finished;

  } catch {}

  animacao = null;

}

async function etapa(proxima, escolha = null) {

  if (ocupado || criado || transicao) return;

  transicao = true;

  body.dataset.transition = "true";

  botoesPerfil.forEach((botao) => (botao.disabled = true));

  $("alterarPerfil").disabled = true;

  const saindo = body.dataset.step === "dados" ? $("etapaDados") : $("etapaPerfil");

  const entrando = proxima === "dados" ? $("etapaDados") : $("etapaPerfil");

  try {

    await animar(

      saindo,

      [

        { opacity: 1, transform: "translateY(0)" },

        { opacity: 0, transform: "translateY(-9px)" },

      ],

      140,

    );

    if (!ativo) return;

    if (proxima === "dados") {

      perfil = escolha;

      $("perfilEscolhido").textContent =

        perfil === "professor" ? "Cadastro de professor" : "Cadastro de aluno";

      $("studentRoom").hidden = perfil !== "aluno";

      $("turma").disabled = perfil !== "aluno";

      $("autorizacao").hidden = perfil !== "professor";

      chave.disabled = perfil !== "professor";

      chave.required = perfil === "professor";

      $("autorizacao").open = false;

      $("progressPerfil").removeAttribute("aria-current");

      $("progressPerfil").classList.add("complete");

      $("progressPerfil").querySelector("span").textContent = "✓";

      $("progressDados").setAttribute("aria-current", "step");

      document.title = "Cadastro de " + perfil + " · AstroLearn";

    } else {

      perfil = null;

      protegerCampos();

      $("progressDados").removeAttribute("aria-current");

      $("progressPerfil").setAttribute("aria-current", "step");

      $("progressPerfil").classList.remove("complete");

      $("progressPerfil").querySelector("span").textContent = "1";

      document.title = "Crie sua conta · AstroLearn";

    }

    mensagem("");

    saindo.hidden = true;

    entrando.hidden = false;

    body.dataset.step = proxima;

    const foco = proxima === "dados" ? $("titulo") : $("perfilTitulo");

    foco.focus({ preventScroll: true });

    await animar(

      entrando,

      [

        { opacity: 0, transform: "translateY(12px)" },

        { opacity: 1, transform: "translateY(0)" },

      ],

      300,

    );

  } finally {

    transicao = false;

    body.dataset.transition = "false";

    botoesPerfil.forEach((botao) => (botao.disabled = false));

    $("alterarPerfil").disabled = false;

  }

}

botoesPerfil.forEach(

  (botao) => (botao.onclick = () => etapa("dados", botao.dataset.profile)),

);

$("alterarPerfil").onclick = () => etapa("perfil");



// A matrícula pelo código da turma só é enviada depois do login confirmado.

$("turma").disabled = true;

chave.disabled = true;

const regras = [

  ["8 caracteres", (v) => v.length >= 8],

  ["maiúscula", (v) => /[A-Z]/.test(v)],

  ["minúscula", (v) => /[a-z]/.test(v)],

  ["número", (v) => /[0-9]/.test(v)],

  ["símbolo", (v) => /[^A-Za-z0-9]/.test(v)],

];

const resumo = document.createElement("ul");
resumo.id = "passwordSummary";
resumo.className = "password-checks";
resumo.setAttribute("aria-label", "Requisitos da senha");
const itensRequisitos = regras.map(([nome]) => {
  const item = document.createElement("li");
  const estado = document.createElement("span");
  estado.setAttribute("aria-hidden", "true");
  const texto = document.createElement("span"); texto.textContent = nome;
  const acessivel = document.createElement("span"); acessivel.className = "password-check-status";
  item.append(estado, texto, acessivel); resumo.append(item);
  return {item, estado, acessivel};
});
senha.closest(".password-row").after(resumo);
senha.setAttribute("aria-describedby", "passwordSummary senha-erro");
function atualizarRequisitos() {
  regras.forEach(([, teste], index) => {
    const ok = teste(senha.value), {item, estado, acessivel} = itensRequisitos[index];
    item.dataset.met = String(ok);
    estado.textContent = ok ? "✓" : "○";
    acessivel.textContent = ok ? ": atendido" : ": pendente";
  });
}

senha.addEventListener("input", atualizarRequisitos);

atualizarRequisitos();



privados.forEach((campo) => {

  campo.addEventListener("focus", privacidade);

  campo.addEventListener("blur", () => queueMicrotask(privacidade));

});

document.querySelectorAll("[data-senha]").forEach((botao) => {

  botao.onclick = () => {

    const campo = $(botao.dataset.senha);

    const mostrar = campo.type === "password";

    campo.type = mostrar ? "text" : "password";

    botao.innerHTML = iconeSenha(mostrar);

    botao.setAttribute("aria-pressed", String(mostrar));

    const nome =

      campo === chave

        ? "chave de autorização"

        : campo === confirmar

          ? "confirmação da senha"

          : "senha";

    botao.setAttribute("aria-label", (mostrar ? "Ocultar " : "Mostrar ") + nome);

    campo.focus();

    privacidade();

  };

});

form.addEventListener("input", (event) => {

  if (ocupado || criado) return;

  erro(event.target);

  mensagem("");

});

let linkEntrada = null;

const turmaPanel = document.createElement('form');

turmaPanel.className = 'cadastro-turma-pendente'; turmaPanel.hidden = true;

turmaPanel.setAttribute('aria-label','Corrigir código da turma');

const turmaLabel = document.createElement('label');turmaLabel.htmlFor='turmaRetry';turmaLabel.textContent='Código da turma';

const turmaRetry = document.createElement('input');turmaRetry.id='turmaRetry';turmaRetry.maxLength=40;turmaRetry.autocomplete='off';turmaRetry.setAttribute('autocapitalize','characters');turmaRetry.spellcheck=false;turmaRetry.setAttribute('aria-describedby','turmaRetryStatus');

const turmaStatus = document.createElement('p');turmaStatus.id='turmaRetryStatus';turmaStatus.className='auth-error';turmaStatus.setAttribute('role','status');

const turmaButton = document.createElement('button');turmaButton.type='submit';turmaButton.className='auth-primary';turmaButton.textContent='Entrar na turma';

turmaPanel.append(turmaLabel,turmaRetry,turmaStatus,turmaButton);form.after(turmaPanel);

let entrandoTurma=false;

async function tentarTurma(raw){

 if(entrandoTurma)return;

 entrandoTurma=true;turmaPanel.hidden=false;turmaRetry.value=String(raw).trim().toUpperCase();turmaRetry.disabled=true;turmaButton.disabled=true;turmaPanel.setAttribute('aria-busy','true');

 turmaStatus.textContent='Sua conta está pronta. Entrando na turma…';

 try {

  const sala=await matricularNoCadastro(turmaRetry.value);

  if(!ativo)return;

  turmaPanel.hidden=true;mensagem('Seu acesso está pronto! Você está na turma '+(sala.nome || 'do seu professor')+'.');

  if(linkEntrada){linkEntrada.href=destinoAposLogin();linkEntrada.textContent=' Abrir minha trilha →';status.append(linkEntrada);}

  status.focus();

 }catch(error){

  if(!ativo)return;

  turmaStatus.textContent='Sua conta já foi criada. '+(error.message || 'Não foi possível confirmar a entrada na turma.')+' Corrija o código aqui ou entre na plataforma; não cadastre novamente.';

  turmaRetry.setAttribute('aria-invalid','true');

  if(error.status===401 && linkEntrada){linkEntrada.href='login.html';linkEntrada.textContent=' Ir para o login →';}

 }finally{

  entrandoTurma=false;turmaRetry.disabled=false;turmaButton.disabled=false;turmaPanel.setAttribute('aria-busy','false');

 }

}

turmaPanel.onsubmit=event=>{event.preventDefault();if(!turmaRetry.value.trim()){turmaStatus.textContent='Informe o código fornecido pelo professor.';turmaRetry.focus();return;}tentarTurma(turmaRetry.value);};

turmaRetry.oninput=()=>turmaRetry.removeAttribute('aria-invalid');



form.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (ocupado || criado || transicao || !perfil || body.dataset.step !== "dados") return;

  const checks = [

    [$("nome"), $("nome").value.trim() ? "" : "Informe seu nome."],

    [

      $("email"),

      $("email").value.trim() && $("email").validity.valid

        ? ""

        : "Informe um e-mail válido.",

    ],

    [

      senha,

      regras.every(([, ok]) => ok(senha.value)) ? "" : "Confira os requisitos da senha.",

    ],

    [

      confirmar,

      confirmar.value && confirmar.value === senha.value

        ? ""

        : "As senhas precisam ser iguais.",

    ],

  ];

  if (perfil === "professor")

    checks.push([

      chave,

      chave.value.trim() ? "" : "Informe a chave fornecida pela coordenação.",

    ]);

  let primeiro = null;

  checks.forEach(([campo, texto]) => {

    if (!erro(campo, texto) && !primeiro) primeiro = campo;

  });

  if (primeiro) {

    if (primeiro === chave) $("autorizacao").open = true;

    primeiro.focus();

    return;

  }

  const codigoTurma = perfil === "aluno" ? $("turma").value.trim().toUpperCase() : "";

  const dados = {

    nome: $("nome").value.trim(),

    email: $("email").value.trim(),

    senha: senha.value,

    role: perfil,

  };

  if (perfil === "professor") dados.chave_mestra = chave.value;

  ocupado = true;

  controle = new AbortController();

  $("dados-cadastro").disabled = true;

  $("alterarPerfil").disabled = true;

  form.setAttribute("aria-busy", "true");

  $("criarConta").textContent = "Criando sua conta…";

  mensagem("Aguarde a confirmação do servidor.");

  try {


    const resultado = await cadastrarEVerificarAcesso(dados, { sinal: controle.signal });


    if (!ativo) return;

    criado = true;

    protegerCampos();

    $("dados-cadastro").hidden = true;

    mensagem(


      resultado.mensagem,

      !resultado.acessoConfirmado,


    );

    const link = document.createElement("a");

    link.href = resultado.acessoConfirmado ? destinoAposLogin() : 'login.html';

    link.textContent = resultado.acessoConfirmado ? ' Entrar na plataforma →' : ' Ir para o login →';

    linkEntrada = link;

    status.append(link);

    $("criarConta").textContent = resultado.acessoConfirmado ? "Acesso confirmado" : "Cadastro recebido";

    status.tabIndex = -1;

    status.focus();

    if (resultado.acessoConfirmado && resultado.usuario.role === "aluno" && codigoTurma) {

      await tentarTurma(codigoTurma);

    }

  } catch (error) {

    if (!ativo) return;

    mensagem(

      error.status === 429

        ? 'O servidor limitou as tentativas de cadastro. Não tente novamente agora; confira com o responsável pela plataforma.'

        : error.status === 409

          ? 'Este e-mail já tem um cadastro. Use a tela de login; não é necessário cadastrar novamente.'

          : mensagemDeAcesso(error),

      true,

    );

    if (error.status === 403 && perfil === "professor") {

      $("autorizacao").open = true;

      erro(chave, "Confira sua chave com a coordenação.");

    }

    status.tabIndex = -1;

    status.focus();

  } finally {

    dados.senha = '';

    delete dados.chave_mestra;

    ocupado = false;

    controle = null;

    form.setAttribute("aria-busy", "false");

    if (ativo && !criado) {

      $("dados-cadastro").disabled = false;

      chave.disabled = perfil !== "professor";

      $("alterarPerfil").disabled = false;

      $("criarConta").textContent = "Criar minha conta →";

    }

  }

});



// Olhos e piscadas continuam sendo os do cenário original, sem deslocar o fundo.

document.addEventListener(

  "pointermove",

  (event) => {

    if (semMovimento() || event.pointerType === "touch" || innerWidth <= 800) return;

    if (quadro) cancelAnimationFrame(quadro);

    const x = event.clientX,

      y = event.clientY;

    quadro = requestAnimationFrame(() => {

      const rect = canvas.getBoundingClientRect();

      const dx = x - (rect.left + rect.width * 0.278),

        dy = y - (rect.top + rect.height * 0.499);

      const distancia = Math.max(Math.hypot(dx, dy), 1),

        limite = rect.width * 0.0055,

        intensidade = Math.min(distancia / 180, 1);

      olhos.forEach(

        (olho) =>

          (olho.style.translate = `${(dx / distancia) * limite * intensidade}px ${(dy / distancia) * limite * intensidade}px`),

      );

      quadro = 0;

    });

  },

  { passive: true },

);

document.documentElement.addEventListener("pointerleave", limparOlhar);

const dicas = [

  "Oi! Como você quer participar dessa descoberta?",

  "Aprender também é fazer boas perguntas.",

  "A luz do Sol leva cerca de oito minutos para chegar à Terra.",

];

let dicaAtual = 0;

document.querySelector(".mascote").onclick = () => {

  $("dica-mascote").textContent = dicas[dicaAtual++ % dicas.length];

  $("dica-mascote").hidden = false;

  clearTimeout(dicaTimer);

  dicaTimer = setTimeout(() => ($("dica-mascote").hidden = true), 5000);

};

document.addEventListener("visibilitychange", () => {

  if (document.hidden) limparOlhar();

});

window.addEventListener("pagehide", () => {

  ativo = false;

  controle?.abort();

  limparOlhar();

  clearTimeout(dicaTimer);

  animacao?.cancel();

});

window.addEventListener("pageshow", (event) => {

  ativo = true;

  if (event.persisted && !criado) {

    ocupado = false;

    transicao = false;

    body.dataset.transition = "false";

    botoesPerfil.forEach((botao) => (botao.disabled = false));

    $("dados-cadastro").disabled = false;

    chave.disabled = perfil !== "professor";

    $("alterarPerfil").disabled = false;

    form.setAttribute("aria-busy", "false");

    $("criarConta").textContent = "Criar minha conta →";

  }

});
