import { solicitarRecuperacao } from "../services/recuperacao.js";
import { encerrar } from "../services/conexao.js";

export function iniciarSeguranca(user) {
  const $ = id => document.getElementById(id);
  const email = (user.email || "").trim();
  const recovery = $("sendPasswordLink");
  const status = $("securityStatus");
  let sending = false;
  let nextRequest = 0;
  let leaving = false;

  $("securityEmail").textContent = email || "E-mail não informado na sessão";
  recovery.disabled = !email;
  if (!email) status.textContent = "Entre novamente para carregar o e-mail da sua conta.";

  recovery.addEventListener("click", async () => {
    if (sending || !email) return;
    if (Date.now() < nextRequest) {
      status.textContent = "Aguarde um minuto após o envio antes de solicitar outro link.";
      return;
    }
    sending = true;
    recovery.disabled = true;
    recovery.setAttribute("aria-busy", "true");
    recovery.textContent = "Enviando…";
    status.textContent = "";
    $("securityError").textContent = "";
    try {
      await solicitarRecuperacao(email);
      nextRequest = Date.now() + 60000;
      status.textContent = "Solicitação recebida. Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Confira também a pasta de spam.";
    } catch {
      $("securityError").textContent = "Não foi possível solicitar o link. Verifique sua conexão e tente novamente.";
    } finally {
      sending = false;
      recovery.disabled = false;
      recovery.setAttribute("aria-busy", "false");
      recovery.textContent = "Enviar link para trocar senha";
    }
  });

  $("logoutProfile").addEventListener("click", async () => {
    if (leaving) return;
    leaving = true;
    $("logoutProfile").disabled = true;
    $("logoutProfile").textContent = "Saindo…";
    try {
      await encerrar();
    } catch {
      leaving = false;
      $("logoutProfile").disabled = false;
      $("logoutProfile").textContent = "Sair da conta";
      $("securityError").textContent = "Não foi possível sair. Tente novamente.";
    }
  });
}
