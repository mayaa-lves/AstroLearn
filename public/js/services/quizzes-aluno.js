import {api} from './conexao.js';
import {normalizeStudentQuiz,normalizeStudentResult,safeAnswers,requiresAttemptServer} from './quiz-aluno-modelo.js';
export const studentQuizCapabilities=Object.freeze({legacyQuiz:true,assessmentAttempts:false,serverAutosave:false});
export async function listStudentQuizzes(){
 const data=await api('/api/aluno/dashboard');
 return {hasRoom:data.tem_sala===true,roomId:data.sala?.id??null,quizzes:(Array.isArray(data.quizzes_disponiveis)?data.quizzes_disponiveis:[]).filter(q=>typeof q?.id==='string'&&typeof q?.titulo==='string')};
}
export async function getStudentQuiz(id){return normalizeStudentQuiz(await api('/api/aluno/quiz/'+encodeURIComponent(id)));}
export async function sendStudentQuiz(quiz,answers){
 if(requiresAttemptServer(quiz))throw Error('Esta avaliação ainda não está disponível para realização. Avise seu professor.');
 const result=await api('/api/aluno/quiz/'+encodeURIComponent(quiz.id)+'/responder','POST',{respostas:safeAnswers(quiz.questions,answers)});
 return normalizeStudentResult(result,result.revisao);
}
export function readCompletedResult(quiz){
 if(!quiz.completed)throw Error('Este quiz ainda não foi finalizado.');
 return normalizeStudentResult(quiz.result,quiz.review);
}
/* Tentativas cronometradas, salvamento no servidor e eventos de troca de guia
 * devem ser ligados ao novo app.py antes de habilitar assessmentAttempts.
 * Nunca buscar gabarito por rotas docentes ou calcular a nota no cliente. */
