import {api} from './conexao.js';
import {normalizeStudentQuiz,normalizeStudentResult} from './quiz-aluno-modelo.js';
const quizPath=id=>'/api/aluno/quiz/'+encodeURIComponent(id);
const attemptPath=id=>'/api/aluno/quiz-tentativa/'+encodeURIComponent(id);
export const studentQuizCapabilities=Object.freeze({assessmentAttempts:true,serverAutosave:true});
export async function listStudentQuizzes(){const data=await api('/api/aluno/dashboard');return {hasRoom:data.tem_sala===true,roomId:data.sala?.id??null,quizzes:(data.quizzes_disponiveis||[]).filter(q=>typeof q?.id==='string'&&typeof q?.titulo==='string')};}
export async function getStudentQuiz(id){
 const [data,state]=await Promise.all([api(quizPath(id)),api(quizPath(id)+'/tentativa')]);
 const quiz=normalizeStudentQuiz({...data,ja_respondido:false});quiz.attempt=state.tentativa_em_andamento;quiz.previous=state.tentativas_finalizadas||[];quiz.canStart=state.pode_iniciar_nova===true;quiz.completed=!quiz.attempt&&quiz.previous.length>0;quiz.exitPolicy=state.quiz?.encerrar_ao_sair_guia===true;quiz.type=state.quiz?.tipo==='avaliativo'?'avaliacao':state.quiz?.tipo||quiz.type;return quiz;
}
export function startStudentQuiz(id){return api(quizPath(id)+'/iniciar','POST',{});}
export function getAttempt(id){return api(attemptPath(id));}
export function saveAttemptAnswer(id,question,answer){return api(attemptPath(id)+'/item','PATCH',{question_id:question,alternativa_marcada:answer});}
export function sendStudentQuiz(quiz){return api(attemptPath(quiz.attempt.id)+'/finalizar','POST',{});}
export function recordAttemptEvent(id,type){return api(attemptPath(id)+'/ocorrencia','POST',{tipo_evento:type,horario_dispositivo:new Date().toISOString(),detalhes:{origem:'interface_aluno'}});}
export async function readAttemptResult(id){
 const data=await api(attemptPath(id)+'/revisao'),t=data.tentativa;const total=t.acertos+t.erros+t.em_branco;
 const rows=(data.revisao||[]).map(q=>({question_id:q.question_id,question:q.enunciado,option_a:q.opcoes?.a,option_b:q.opcoes?.b,option_c:q.opcoes?.c,option_d:q.opcoes?.d,correct_answer:q.correta_gabarito,sua_resposta:q.alternativa_marcada}));
 return {...normalizeStudentResult({score:t.nota,correct_answers:t.acertos,total_questions:total},rows),reason:t.motivo_encerramento};
}
export function readCompletedResult(quiz){const last=quiz.previous[0]||quiz.attempt;if(!last)throw Error('Não há uma tentativa concluída.');return readAttemptResult(last.id);}
