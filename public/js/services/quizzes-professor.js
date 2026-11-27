/* Contrato app.py: criar rascunho e publicar são operações distintas. */
import {api} from './conexao.js';
import {normalizeQuestions,publicationPayload} from './quizzes-modelo.js';
const roomBase=room=>'/api/professor/salas/'+encodeURIComponent(room);
export const publicationEnabled=true;
export async function generateQuiz(request){
 try{return normalizeQuestions((await api('/api/professor/gemini/gerar-quiz','POST',request,{tempoLimiteMs:45000}))?.perguntas);}
 catch(e){if(e.status===503||/503|high demand|UNAVAILABLE/i.test(e.message))throw Error('A IA está muito ocupada agora. Seu tema foi mantido. Aguarde um pouco e tente novamente, ou continue criando manualmente.');throw e;}
}
export async function publishQuiz(room,draft){
 const payload=publicationPayload(draft);if(!room)throw Error('Abra uma turma antes de publicar.');
 if(draft.server_id)await api(roomBase(room)+'/quizzes/'+encodeURIComponent(draft.server_id),'PATCH',payload);
 else{if(draft.publish_uncertain)throw Error('Consulte Quizzes da turma antes de tentar criar novamente: a criação anterior não foi confirmada.');let created;try{created=await api(roomBase(room)+'/quizzes','POST',payload);}catch(e){if(!e.status||e.status>=500){draft.publish_uncertain=true;throw Error(e.message+' Atualize a lista Quizzes da turma antes de repetir a criação.');}throw e;}if(!created?.quiz?.id)throw Error('O servidor não confirmou o rascunho. Atualize a lista antes de tentar novamente.');draft.server_id=created.quiz.id;}
 return api(roomBase(room)+'/quizzes/'+encodeURIComponent(draft.server_id)+'/publicar','PATCH',{publicar:true});
}
export function loadQuizRoom(room){return api(roomBase(room));}
export function listTeacherQuizzes(room){return api(roomBase(room)+'/quizzes');}
export function getTeacherQuiz(room,id){return api(roomBase(room)+'/quizzes/'+encodeURIComponent(id));}
export function quizAttempts(id){return api('/api/professor/quiz/'+encodeURIComponent(id)+'/tentativas');}
export function quizAnalysis(id){return api('/api/professor/quiz/'+encodeURIComponent(id)+'/analise');}
export function attemptDetail(id){return api('/api/professor/quiz-tentativa/'+encodeURIComponent(id));}
export function manageAttempt(id,action,reason){return api('/api/professor/quiz-tentativa/'+encodeURIComponent(id)+'/'+action,'POST',{motivo:reason});}
export function manageAbsence(quiz,id,action,reason){return api('/api/professor/quiz/'+encodeURIComponent(quiz)+'/alunos/'+encodeURIComponent(id)+'/'+action,'POST',{motivo:reason});}
export function deleteTeacherQuiz(room,id){return api(roomBase(room)+'/quizzes/'+encodeURIComponent(id),'DELETE');}
export function unpublishTeacherQuiz(room,id){return api(roomBase(room)+'/quizzes/'+encodeURIComponent(id)+'/publicar','PATCH',{publicar:false});}
