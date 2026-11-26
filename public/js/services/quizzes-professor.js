/* Único ponto de integração. A geração já existe no app.py fornecido.
 * Publicação deliberadamente não usa o POST legado: ele não distingue treino/prova
 * e já inclui quizzes na média. Ativar apenas após atualizar este adaptador ao contrato real.
 */
import {api} from './conexao.js';
import {normalizeQuestions} from './quizzes-modelo.js';
export const publicationEnabled=false;
export async function generateQuiz(request){
 const response=await api('/api/professor/gemini/gerar-quiz','POST',request);
 return normalizeQuestions(response?.perguntas);
}
export async function publishQuiz(){
 throw Error('A publicação aguarda a integração das regras de avaliação. Salve ou exporte o rascunho.');
}

export function loadQuizRoom(room){return api('/api/professor/salas/'+encodeURIComponent(room));}
