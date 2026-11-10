// Login real. As interações do cenário continuam independentes do acesso.
import { entrar, destinoAposLogin } from '../../services/autenticacao.js';

const pegar = (id) => document.getElementById(id);

const mascote = pegar('mascote');
const senha = pegar('senha');
const foguete = pegar('foguete');
const mensagem = pegar('mascot-message');
const movimento = pegar('pausar-movimentos');

const preferencia = matchMedia('(prefers-reduced-motion: reduce)');

let pausaManual = false;
let timerPose;
let timerMensagem;
let timerFoguete;
let frame;
let ponteiro;
let processando = false;
let controleLogin;
let timerTransicao;
let concluirTransicao;
let paginaAtiva = true;

// ========================================
// 1. MENSAGENS DO MASCOTE
// ========================================

function falar(texto) {
  clearTimeout(timerMensagem);

  mensagem.textContent = texto;
  mensagem.classList.add('is-visible');

  timerMensagem = setTimeout(() => {
    mensagem.classList.remove('is-visible');
  }, 3500);
}

// ========================================
// 2. SENHA E POSES DO MASCOTE
// ========================================

// A privacidade vale também quando a senha é revelada.
function atualizarPrivacidade() {
  clearTimeout(timerPose);

  mascote.dataset.pose =
    document.activeElement === senha ? 'senha' : 'normal';
}

senha.addEventListener('focus', () => {
  atualizarPrivacidade();

});

senha.addEventListener('input', atualizarPrivacidade);
senha.addEventListener('blur', atualizarPrivacidade);

pegar('mostrar-senha').addEventListener('click', (event) => {
  const mostrar = senha.type === 'password';

  senha.type = mostrar ? 'text' : 'password';

  event.currentTarget.setAttribute(
    'aria-label',
    mostrar ? 'Ocultar senha' : 'Mostrar senha'
  );

  event.currentTarget.setAttribute('aria-pressed', String(mostrar));

  senha.focus();
  atualizarPrivacidade();
});

mascote.addEventListener('click', () => {
  clearTimeout(timerPose);

  mascote.dataset.pose = 'aceno';

  timerPose = setTimeout(atualizarPrivacidade, 1800);
});

// ========================================
// 3. OLHO ACOMPANHANDO O MOUSE
// ========================================

// Atualiza apenas uma vez por frame.
function seguirPonteiro() {
  frame = null;

  const caixa = mascote.getBoundingClientRect();

  const dx = ponteiro.x - (caixa.left + caixa.width * .486);
  const dy = ponteiro.y - (caixa.top + caixa.height * (document.documentElement.dataset.visualStyle === "pixel" ? .451 : .402));

  const distancia = Math.hypot(dx, dy) || 1;
  const deslocamento = Math.min(
    distancia * .035,
    caixa.width * .033
  );

  mascote.style.setProperty(
    '--eye-x',
    `${dx / distancia * deslocamento}px`
  );

  mascote.style.setProperty(
    '--eye-y',
    `${dy / distancia * deslocamento}px`
  );


}

function centralizarOlhar() {
  cancelAnimationFrame(frame);
  frame = null;

  mascote.style.setProperty('--eye-x', '0px');
  mascote.style.setProperty('--eye-y', '0px');

}

document.addEventListener('pointermove', (event) => {
  if (
    event.pointerType === 'touch' ||
    document.hidden ||
    preferencia.matches || pausaManual ||
    document.body.classList.contains('motion-paused')
  ) {
    return;
  }

  ponteiro = {
    x: event.clientX,
    y: event.clientY
  };

  if (frame == null) {
    frame = requestAnimationFrame(seguirPonteiro);
  }
});

document.documentElement.addEventListener(
  'pointerleave',
  centralizarOlhar
);

// ========================================
// 4. CONTROLE DE MOVIMENTO
// ========================================

function atualizarMovimentos() {
  const pausado = pausaManual || preferencia.matches;

  document.body.classList.toggle('motion-paused', pausado);

  movimento.setAttribute('aria-pressed', String(pausado));
  movimento.disabled = preferencia.matches;

  const descricao = preferencia.matches ? 'Movimentos reduzidos conforme sua preferência' : pausado ? 'Ativar movimentos' : 'Pausar movimentos';
  movimento.setAttribute('aria-label', descricao);
  movimento.title = descricao;

  if (pausado) {
    centralizarOlhar();
  }
}

movimento.addEventListener('click', () => {
  pausaManual = !pausaManual;
  atualizarMovimentos();
});

preferencia.addEventListener('change', atualizarMovimentos);

atualizarMovimentos();

// ========================================
// 5. DECOLAGEM DO FOGUETE
// ========================================

function decolar() {
  if (pausaManual || preferencia.matches || document.hidden) return;
  if (foguete.classList.contains('is-flying')) {
    return;
  }

  foguete.classList.add('is-flying');
  falar('3… 2… 1… decolagem!');

  clearTimeout(timerFoguete);

  timerFoguete = setTimeout(() => {
    foguete.classList.remove('is-flying');
  }, 2100);
}

foguete.addEventListener('click', decolar);

// ========================================
// 6. ESTRELAS COM CURIOSIDADES
// ========================================

// Diálogo nativo: teclado, Escape e retorno ao botão.
document.querySelectorAll('[data-curiosidade]').forEach((estrela) => {
  estrela.addEventListener('click', () => {
    pegar('curiosidade-text').textContent =
      estrela.dataset.curiosidade;

    pegar('curiosidade').showModal();
  });
});

pegar('fechar-curiosidade').addEventListener('click', () => {
  pegar('curiosidade').close();
});

// ========================================
// 7. VALIDAÇÃO VISUAL DO FORMULÁRIO
// ========================================

function mostrarErro(id, texto) {
  pegar(`${id}-error`).textContent = texto;
  pegar(id).setAttribute('aria-invalid', String(Boolean(texto)));
}

['email', 'senha'].forEach((id) => {
  pegar(id).addEventListener('input', () => {
    mostrarErro(id, '');
    if (!processando) mostrarStatus('', '');
  });
});

function mostrarStatus(texto, estado) {
  const status = pegar('login-status');
  status.dataset.estado = estado;
  status.setAttribute('role', estado === 'erro' ? 'alert' : 'status');
  status.setAttribute('aria-live', estado === 'erro' ? 'assertive' : 'polite');
  status.textContent = texto;
}

function bloquearFormulario(bloqueado) {
  pegar('login-form').setAttribute('aria-busy', String(bloqueado));
  ['email', 'senha', 'mostrar-senha', 'entrar', 'foguete'].forEach((id) => {
    pegar(id).disabled = bloqueado;
  });
}

function esperarDecolagem() {
  atualizarMovimentos();
  if (pausaManual || preferencia.matches || document.hidden) {
    return Promise.resolve();
  }
  decolar();
  return new Promise((resolve) => {
    concluirTransicao = () => {
      clearTimeout(timerTransicao);
      concluirTransicao = null;
      resolve();
    };
    timerTransicao = setTimeout(concluirTransicao, 2100);
  });
}

pegar('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (processando) return;

  const email = pegar('email');
  const emailValido = email.value.trim() !== '' && email.validity.valid;
  const senhaValida = senha.value.length > 0;
  mostrarErro('email', emailValido ? '' : 'Digite um e-mail válido.');
  mostrarErro('senha', senhaValida ? '' : 'Digite sua senha.');
  mostrarStatus('', '');
  if (!emailValido || !senhaValida) {
    (emailValido ? senha : email).focus();
    return;
  }

  processando = true;
  controleLogin = new AbortController();
  clearTimeout(timerFoguete);
  foguete.classList.remove('is-flying');
  bloquearFormulario(true);
  pegar('entrar').textContent = 'Conectando…';
  mostrarStatus('Confirmando seu acesso…', 'carregando');
  let confirmado = false;

  try {
    await entrar({ email: email.value.trim(), senha: senha.value }, {
      sinal: controleLogin.signal,
    });
    if (!paginaAtiva) return;
    const destino = destinoAposLogin();
    senha.value = '';
    senha.type = 'password';
    pegar('mostrar-senha').setAttribute('aria-pressed', 'false');
    pegar('mostrar-senha').setAttribute('aria-label', 'Mostrar senha');
    pegar('entrar').textContent = 'Acesso confirmado!';
    mostrarStatus('Login confirmado. Abrindo sua plataforma…', 'sucesso');
    if (pegar('curiosidade').open) pegar('curiosidade').close();
    await esperarDecolagem();
    if (!paginaAtiva) return;
    window.location.assign(destino);
    confirmado = true;
  } catch (erro) {
    if (!paginaAtiva) return;
    mostrarStatus(erro.status === 401
      ? 'Não foi possível entrar. Confira o e-mail, a senha e a confirmação do seu e-mail.'
      : erro.message || 'Não foi possível entrar. Tente novamente.', 'erro');
    falar('Vamos tentar novamente? Confira os dados de acesso.');
  } finally {
    controleLogin = null;
    if (!confirmado && paginaAtiva) {
      processando = false;
      bloquearFormulario(false);
      pegar('entrar').textContent = 'Entrar na plataforma →';
    }
  }
});

// Concluir a transição imediatamente se o usuário solicitar menos movimento.
preferencia.addEventListener('change', () => {
  if (preferencia.matches) concluirTransicao?.();
});
movimento.addEventListener('click', () => {
  if (pausaManual) concluirTransicao?.();
});

window.addEventListener('pagehide', () => {
  paginaAtiva = false;
  controleLogin?.abort();
  concluirTransicao?.();
  clearTimeout(timerPose);
  clearTimeout(timerMensagem);
  centralizarOlhar();
});

window.addEventListener('pageshow', (event) => {
  paginaAtiva = true;
  if (event.persisted) {
    processando = false;
    bloquearFormulario(false);
    pegar('entrar').textContent = 'Entrar na plataforma →';
    senha.value = '';
    mostrarStatus('', '');
    atualizarMovimentos();
  }
});

// Evita deixar o foguete preso ao trocar de aba.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    centralizarOlhar();
    concluirTransicao?.();

    clearTimeout(timerFoguete);
    foguete.classList.remove('is-flying');
  }
});