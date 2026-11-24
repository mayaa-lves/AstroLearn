import { api, id } from "./conexao.js";
export const dashboard = () => api("/api/aluno/dashboard");
export const biblioteca = () => api("/api/aluno/biblioteca");
export const missao = (valor) => api("/api/aluno/missoes/" + id(valor));
import { matricularNoCadastro } from './cadastro-turma.js';
export const entrarSala = async codigo => ({sala: await matricularNoCadastro(codigo)});
// Compatibilidade: novos envios devem incluir texto e/ou arquivos.
export { enviarEntrega } from './atividades.js';
