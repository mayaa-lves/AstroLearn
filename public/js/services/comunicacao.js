import {observarNotificacoes} from './notificacoes-som.js';
import {api} from './conexao.js';
const part = encodeURIComponent;
export async function notificacoes() {
  try { const data = await api('/api/notificacoes'); const rows = (data.notificacoes || []).map(n => ({...n, lida_em: n.lida === true ? (n.lida_em || true) : null})); observarNotificacoes(rows); return {...data, notificacoes: rows, nao_lidas: rows.filter(n => !n.lida_em).length}; }
  catch(error) {if(error.status===404) error.message='Os avisos dependem da publicação do complemento de comunicação no servidor.'; throw error;}
}
export async function lerNotificacoes(ids) {
  // A API atual marca cada aviso individualmente. Todas as requisições terminam
  // antes de reportar falha; o próximo carregamento reflete sucessos parciais.
  const results = await Promise.allSettled([...new Set(ids)].map(id => api('/api/notificacoes/'+part(id)+'/ler','PATCH')));
  const failed = results.find(r => r.status === 'rejected');
  if (failed) throw failed.reason;
  return results.map(r => r.value);
}
export function destinoNotificacao(n, role) {
  const link = typeof n.link === 'string' ? n.link : '';
  const mission = /^\/missoes\/([^/?#]+)$/.exec(link);
  if (mission && role === 'aluno') return 'atividade.html?atividade='+part(decodeURIComponent(mission[1]));
  if (/^\/equipes\/[^/?#]+\/tarefas$/.test(link) && role === 'aluno') return 'equipe.html';
  if (link.startsWith('/professor/biblioteca?') && role === 'professor' && n.sala_id) {
    const query = new URLSearchParams(link.split('?')[1]); query.set('sala',n.sala_id);
    return 'biblioteca.html?'+query;
  }
  if (role === 'aluno' && n.missao_id) return 'atividade.html?atividade='+part(n.missao_id);
  return null;
}
export const perguntasAluno = missao => api('/api/aluno/missoes/'+part(missao)+'/perguntas');
export const perguntarProfessor = (missao,texto) => api('/api/aluno/missoes/'+part(missao)+'/perguntas','POST',{texto});
