export const QUIZ_LETTERS=['a','b','c','d'];
const text=value=>typeof value==='string'?value:'';
export function normalizeStudentQuiz(data){
 if(!data?.quiz||typeof data.quiz.id!=='string'||!Array.isArray(data.perguntas))throw Error('Não foi possível reconhecer os dados deste quiz.');
 const ids=new Set();
 const questions=data.perguntas.map((row,i)=>{
  if(!row||typeof row.id!=='string'||ids.has(row.id)||!text(row.question).trim())throw Error('Uma questão está incompleta. Peça ao professor para conferir o quiz.');
  ids.add(row.id);
  if(data.ja_respondido!==true&&('correct_answer' in row||'resposta_correta' in row||'explicacao' in row||'explanation' in row))throw Error('Não foi possível iniciar este quiz com segurança. Avise seu professor.');
  const options=QUIZ_LETTERS.map(letter=>text(row['option_'+letter]));
  if(options.some(option=>!option.trim()))throw Error(`A questão ${i+1} está sem alternativas.`);
  return {id:row.id,text:row.question,options};
 });
 return {id:data.quiz.id,roomId:text(data.quiz.sala_id),title:text(data.quiz.titulo)||'Quiz da turma',description:text(data.quiz.descricao),type:data.quiz.tipo==='avaliativo'?'avaliacao':text(data.quiz.tipo),duration:data.quiz.duracao_minutos??null,exitPolicy:data.quiz.encerrar_ao_sair_guia===true,version:String(data.quiz.versao??data.quiz.updated_at??''),questions,completed:data.ja_respondido===true,result:data.progresso??null,review:data.revisao};
}
export function requiresAttemptServer(quiz){return quiz.type==='avaliacao'||quiz.duration!==null||quiz.exitPolicy;}
export function safeAnswers(questions,raw){
 const result={};for(const q of questions){if(QUIZ_LETTERS.includes(raw?.[q.id]))result[q.id]=raw[q.id];}return result;
}
export function answerCounts(questions,answers){const answered=questions.filter(q=>QUIZ_LETTERS.includes(answers[q.id])).length;return {answered,blank:questions.length-answered,total:questions.length};}
export function normalizeStudentResult(raw,review){
 if(!raw||typeof raw.score!=='number'||!Number.isFinite(raw.score)||raw.score<0||raw.score>100||!Number.isInteger(raw.correct_answers)||!Number.isInteger(raw.total_questions)||raw.total_questions<1||raw.correct_answers<0||raw.correct_answers>raw.total_questions)throw Error('O servidor ainda não confirmou uma pontuação válida. Atualize para consultar o resultado.');
 return {score:raw.score/10,correct:raw.correct_answers,total:raw.total_questions,review:normalizeReview(review,raw.total_questions,raw.correct_answers)};
}
function normalizeReview(rows,total,correct){
 if(!Array.isArray(rows)||rows.length!==total)return null;
 const ids=new Set(),result=[];
 for(const row of rows){
  if(!row||typeof row.question_id!=='string'||ids.has(row.question_id)||!text(row.question).trim()||!QUIZ_LETTERS.includes(row.correct_answer))return null;
  ids.add(row.question_id);const marked=row.sua_resposta??null;
  if(marked!==null&&!QUIZ_LETTERS.includes(marked))return null;
  const options=QUIZ_LETTERS.map(letter=>text(row['option_'+letter]));if(options.some(option=>!option.trim()))return null;
  result.push({id:row.question_id,text:row.question,marked:marked===null?null:options[QUIZ_LETTERS.indexOf(marked)],answer:options[QUIZ_LETTERS.indexOf(row.correct_answer)],state:marked===null?'blank':marked===row.correct_answer?'correct':'wrong',explanation:text(row.explicacao)});
 }
 if(result.filter(row=>row.state==='correct').length!==correct)return null;
 return result;
}
export function formatTimeRemaining(expiresAt,serverNow,localNow){
 const end=Date.parse(expiresAt),start=Date.parse(serverNow);if(!Number.isFinite(end)||!Number.isFinite(start))return null;
 const seconds=Math.max(0,Math.ceil((end-(start+localNow))/1000));return {seconds,label:`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`};
}
