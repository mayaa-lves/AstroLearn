import { solicitar, ErroAPI } from "./api.js";
import { obterSessao, sair, destinoAposLogin } from "./autenticacao.js";
export function sessaoObrigatoria(role) {
  const s = obterSessao();
  if (!s) {
    location.replace(new URL("../../../auth/login.html", import.meta.url));
    throw new ErroAPI("Faça login novamente.", 401);
  }
  if (role && s.usuario.role !== role) {
    location.replace(destinoAposLogin());
    throw new ErroAPI("Perfil sem acesso.", 403);
  }
  return s;
}
export async function api(path, metodo = "GET", dados, opcoes = {}) {
  const s = sessaoObrigatoria();
  try {
    return await solicitar(path, { ...opcoes, metodo, dados, token: s.token });
  } catch (e) {
    if (e.status === 401)
      location.replace(new URL("../../../auth/login.html", import.meta.url));
    throw e;
  }
}
export function indisponivel(funcao) {
  throw new ErroAPI(
    funcao +
      " ainda precisa ser implementado no backend. Nenhuma alteração foi enviada.",
  );
}
export async function encerrar() {
  try {
    await sair();
  } catch {
    /* A sessão local é limpa mesmo se a API estiver indisponível. */
  } finally {
    location.replace(new URL("../../../auth/login.html", import.meta.url));
  }
}
export const id = (valor) => encodeURIComponent(String(valor));
