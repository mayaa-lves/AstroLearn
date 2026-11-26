import {sessaoObrigatoria} from '../../services/conexao.js';
import {listStudentQuizzes,getStudentQuiz,sendStudentQuiz,readCompletedResult} from '../../services/quizzes-aluno.js';
import {QUIZ_LETTERS,safeAnswers,answerCounts,requiresAttemptServer} from '../../services/quiz-aluno-modelo.js';
const account=sessaoObrigatoria('aluno'),$=id=>document.getElementById(id);
const views=['sqLoading','sqCatalog','sqIntro','sqAttempt','sqCheck','sqResult'];
let quiz=null,answers={},cursor=0,view='sqLoading',busy=false,uncertain=false,active=false,localSave=true;
const historyKey='astrolearn:quiz-results-session:v1:'+account.usuario.id;
const make=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n;};
const btn=(text,action,className='sq-secondary')=>{const b=make('button',text,className);b.type='button';b.addEventListener('click',action);return b;};
function notice(text='',error=false){$('sqNotice').textContent=text;$('sqNotice').dataset.error=String(error);}
function show(id){view=id;for(const key of views)$(key).hidden=key!==id;}
function answerKey(){return 'astrolearn:quiz-answers:v1:'+account.usuario.id+':'+quiz.id;}
function signature(){return JSON.stringify({version:quiz.version,questions:quiz.questions});}
function saveAnswers(){try{sessionStorage.setItem(answerKey(),JSON.stringify({signature:signature(),answers}));localSave=true;}catch{localSave=false;}}
function recoverAnswers(){answers={};try{const saved=JSON.parse(sessionStorage.getItem(answerKey())||'null');if(saved?.signature===signature())answers=safeAnswers(quiz.questions,saved.answers);}catch{notice('Não foi possível recuperar escolhas anteriores. Você pode responder novamente.',true);}}
function recentResults(){try{const raw=JSON.parse(sessionStorage.getItem(historyKey)||'[]');return Array.isArray(raw)?raw.filter(row=>typeof row?.id==='string'&&typeof row.title==='string'&&typeof row.roomId==='string').slice(0,20):[];}catch{return [];}}
function rememberResult(){try{const rows=recentResults().filter(row=>row.id!==quiz.id);rows.unshift({id:quiz.id,title:quiz.title,roomId:quiz.roomId});sessionStorage.setItem(historyKey,JSON.stringify(rows.slice(0,20)));sessionStorage.removeItem(answerKey());}catch{/* O resultado continua vindo do servidor, mesmo sem armazenamento local. */}}
async function catalog(){
 if(busy)return;busy=true;show('sqLoading');notice();
 try{
  const data=await listStudentQuizzes();const list=$('sqQuizList');list.replaceChildren();$('sqCount').textContent=data.quizzes.length+(data.quizzes.length===1?' quiz disponível':' quizzes disponíveis');
  for(const item of data.quizzes){
   const card=make('article','','sq-card sq-catalog-card'),copy=make('div'),art=make('div','','sq-planet-thumb');art.setAttribute('aria-hidden','true');copy.append(make('span','Disponível','sq-available'),make('h2',item.titulo));
   const details=[];if(Number.isInteger(item.total_questions)&&item.total_questions>0)details.push(item.total_questions+' questões');if(Number.isInteger(item.duracao_minutos)&&item.duracao_minutos>0)details.push('Até '+item.duracao_minutos+' minutos');if(details.length)copy.append(make('p',details.join(' · ')));
   card.append(art,copy,btn('Começar →',()=>openQuiz(item.id),'sq-primary'));list.append(card);
  }
  if(!data.quizzes.length)list.append(make('p',data.hasRoom?'Nenhum quiz disponível por enquanto. Assim que o professor publicar, ele aparecerá aqui.':'Entre em uma turma para receber os quizzes do seu professor.','sq-empty'));
  const recent=recentResults().filter(row=>row.roomId===data.roomId&&!data.quizzes.some(q=>q.id===row.id));
  if(recent.length){const heading=make('h2','Resultados desta sessão');heading.style.gridColumn='1 / -1';list.append(heading);for(const row of recent){const card=make('article','','sq-card sq-catalog-card');card.append(make('div','','sq-planet-thumb'),make('h2',row.title),btn('Ver resultado',()=>openQuiz(row.id),'sq-secondary'));list.append(card);}}
  show('sqCatalog');
 }catch(e){show('sqCatalog');$('sqCount').textContent='';$('sqQuizList').replaceChildren(make('p','Não foi possível carregar os quizzes. Use Atualizar para tentar novamente.','sq-empty'));notice(e.message,true);}
 finally{busy=false;}
}
async function openQuiz(id){
 if(busy)return;busy=true;show('sqLoading');notice();
 try{
  quiz=await getStudentQuiz(id);answers={};cursor=0;uncertain=false;active=false;
  const url=new URL(location.href);url.searchParams.set('quiz',id);history.replaceState(null,'',url);
  if(quiz.completed){result(readCompletedResult(quiz));return;}
  $('sqIntroTitle').textContent=quiz.title;$('sqIntroDescription').textContent=quiz.description;$('sqType').textContent=quiz.type==='avaliacao'?'AVALIAÇÃO':quiz.type==='treino'?'TREINO':'QUIZ';
  $('sqIntroMeta').textContent=quiz.questions.length+(quiz.questions.length===1?' questão':' questões');
  const blocked=requiresAttemptServer(quiz);$('sqStart').disabled=blocked||!quiz.questions.length;
  $('sqPolicy').textContent=blocked?'Esta avaliação ainda não foi liberada para realização. Aguarde a orientação do professor.':'As escolhas ficam guardadas neste navegador até o envio. O resultado aparece após a confirmação do servidor.';
  recoverAnswers();if(Object.keys(answers).length)$('sqStart').textContent='Continuar quiz →';else $('sqStart').textContent='Começar →';show('sqIntro');
 }catch(e){show('sqCatalog');$('sqQuizList').replaceChildren(btn('Atualizar quizzes',catalog));notice(e.message,true);}
 finally{busy=false;}
}
function question(){
 const q=quiz.questions[cursor];if(!q)return;
 $('sqAttemptTitle').textContent=quiz.title;$('sqAttemptType').textContent=quiz.type==='treino'?'TREINO':quiz.type==='avaliacao'?'AVALIAÇÃO':'QUIZ';
 $('sqTimer').hidden=true; // Nenhum cronômetro local inventado: depende do prazo autoritativo da tentativa.
 const counts=answerCounts(quiz.questions,answers);$('sqQuestionCount').textContent=`Questão ${cursor+1} de ${quiz.questions.length}`;$('sqProgress').max=quiz.questions.length;$('sqProgress').value=counts.answered;
 $('sqQuestionNumber').textContent=String(cursor+1).padStart(2,'0');$('sqQuestionText').textContent=q.text;
 const options=$('sqAnswers');options.replaceChildren();
 q.options.forEach((text,index)=>{
  const label=make('label','','sq-answer'),input=make('input');input.type='radio';input.name='student-quiz-choice';input.value=QUIZ_LETTERS[index];input.checked=answers[q.id]===input.value;label.dataset.selected=String(input.checked);
  input.addEventListener('change',()=>{answers[q.id]=input.value;saveAnswers();[...options.children].forEach((row,j)=>row.dataset.selected=String(j===index));const updated=answerCounts(quiz.questions,answers);$('sqProgress').value=updated.answered;saveState();renderQuestionNav();});
  label.append(input,make('b',QUIZ_LETTERS[index].toUpperCase()),make('span',text));options.append(label);
 });
 $('sqPrevious').disabled=cursor===0;$('sqNext').textContent=cursor===quiz.questions.length-1?'Revisar respostas →':'Próxima →';saveState();renderQuestionNav();show('sqAttempt');
}
function saveState(){$('sqSaveState').textContent=localSave?'Escolhas guardadas neste navegador.':'Não foi possível guardar as escolhas neste navegador. Evite recarregar antes do envio.';}
function renderQuestionNav(){
 const nav=$('sqQuestionNav');nav.replaceChildren();quiz.questions.forEach((q,i)=>{const b=btn(String(i+1),()=>{if(!busy){cursor=i;question();}},'sq-nav-number');b.dataset.answered=String(Boolean(answers[q.id]));b.setAttribute('aria-label',`Questão ${i+1}${answers[q.id]?', respondida':', não respondida'}`);if(i===cursor)b.setAttribute('aria-current','step');nav.append(b);});
}
function check(){
 if(busy||!quiz)return;const counts=answerCounts(quiz.questions,answers);$('sqCheckSummary').textContent=`${counts.answered} de ${counts.total} questões respondidas${counts.blank?` · ${counts.blank} em branco`:''}.`;
 const list=$('sqCheckList');list.replaceChildren();quiz.questions.forEach((q,i)=>{const row=make('div','','sq-check-row'),text=make('span',`${i+1}. ${q.text}`),b=btn(answers[q.id]?'Conferir':'Responder',()=>{cursor=i;question();});row.append(text,b);list.append(row);});show('sqCheck');
}
function result(data){
 active=false;uncertain=false;rememberResult();$('sqResultTitle').textContent=quiz.title;$('sqScore').textContent=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:2}).format(data.score);$('sqScoreCaption').textContent=`Você acertou ${data.correct} de ${data.total} questões.`;
 const list=$('sqResultQuestions');list.replaceChildren();
 if(!data.review){$('sqReviewHint').textContent='Seu resultado foi confirmado. Os detalhes por questão ainda não foram liberados.';list.append(make('p','Quando a revisão for disponibilizada pelo professor, você poderá consultar suas respostas e explicações aqui.','sq-empty'));}
 else{
  $('sqReviewHint').textContent='Abra uma questão para ver os detalhes.';
  data.review.forEach((item,i)=>{
   const details=make('details','','sq-review-row'),summary=make('summary'),state=make('span',item.state==='correct'?'✓ Correta':item.state==='wrong'?'× Incorreta':'○ Em branco','sq-review-status');state.dataset.state=item.state;
   summary.append(make('b',String(i+1)),make('strong',item.text),state);const body=make('div','','sq-review-detail');body.append(make('p','Você marcou: '+(item.marked??'Não respondida')),make('p','✓ Resposta correta: '+item.answer,'sq-good'));if(item.explanation)body.append(make('p',item.explanation));details.append(summary,body);list.append(details);
  });
 }
 show('sqResult');
}
function sending(value){busy=value;$('sqSubmit').disabled=value;$('sqReturnAttempt').disabled=value;$('sqConfirmSubmit').disabled=value;$('sqCancelSubmit').disabled=value;$('sqSubmit').textContent=value?'Enviando…':uncertain?'Consultar envio':'Finalizar e enviar';}
async function reconcile(){
 const current=await getStudentQuiz(quiz.id);if(current.completed){quiz=current;result(readCompletedResult(current));return true;}return false;
}
async function submit(){
 if(busy||!active)return;$('sqConfirmDialog').close();sending(true);notice();
 try{
  if(uncertain){if(await reconcile())return;uncertain=false;notice('O servidor ainda não registrou o envio. Confira suas escolhas e envie novamente quando quiser.');return;}
  const confirmed=await sendStudentQuiz(quiz,answers);result(confirmed);
 }catch(e){
  try{if(await reconcile())return;uncertain=false;notice(e.message+' Suas escolhas foram mantidas. Você pode tentar novamente.',true);}
  catch{uncertain=true;notice('Não foi possível confirmar se o envio foi registrado. Suas escolhas foram mantidas. Use Consultar envio antes de tentar enviar novamente.',true);}
 }finally{sending(false);}
}
$('sqStart').addEventListener('click',()=>{if(busy||!quiz||requiresAttemptServer(quiz)||!quiz.questions.length)return;active=true;question();});
$('sqPrevious').addEventListener('click',()=>{if(!busy&&cursor>0){cursor--;question();}});
$('sqNext').addEventListener('click',()=>{if(busy)return;if(cursor===quiz.questions.length-1)check();else{cursor++;question();}});
$('sqReviewButton').addEventListener('click',check);$('sqReturnAttempt').addEventListener('click',()=>{if(!busy)question();});
$('sqQuestionForm').addEventListener('submit',event=>event.preventDefault());
$('sqSubmit').addEventListener('click',()=>{
 if(busy)return;if(uncertain){submit();return;}
 const counts=answerCounts(quiz.questions,answers);$('sqConfirmText').textContent=counts.blank?`${counts.blank} questão(ões) ainda está(ão) em branco. Deseja enviar assim mesmo?`:'Todas as questões foram respondidas. Deseja finalizar?';$('sqConfirmDialog').showModal();
});
$('sqConfirmSubmit').addEventListener('click',submit);$('sqCancelSubmit').addEventListener('click',()=>$('sqConfirmDialog').close());
$('sqConfirmDialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
$('sqConfirmDialog').addEventListener('close',()=>{if(view==='sqCheck')$('sqSubmit').focus();});
$('sqRefresh').addEventListener('click',catalog);
$('help').addEventListener('click',()=>$('sqHelpDialog').showModal());$('sqCloseHelp').addEventListener('click',()=>$('sqHelpDialog').close());$('sqHelpDialog').addEventListener('close',()=>$('help').focus());
window.addEventListener('beforeunload',event=>{if(active||busy){event.preventDefault();event.returnValue='';}});
window.addEventListener('popstate',()=>{if(!active&&!busy){const id=new URLSearchParams(location.search).get('quiz');if(id)openQuiz(id);else catalog();}});
const id=new URLSearchParams(location.search).get('quiz');if(id)openQuiz(id);else catalog();
