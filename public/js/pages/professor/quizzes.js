import {sessaoObrigatoria} from '../../services/conexao.js';
import {newDraft,newQuestion,restoreDraft,validateQuestions,validateSettings,LETTERS,normalizeQuestions} from '../../services/quizzes-modelo.js';
import {generateQuiz,publishQuiz,publicationEnabled,loadQuizRoom,getTeacherQuiz} from '../../services/quizzes-professor.js';
import {generationRequest} from '../../services/quizzes-modelo.js';
const account=sessaoObrigatoria('professor');
const room=new URLSearchParams(location.search).get('sala');
const editId=new URLSearchParams(location.search).get('quiz');
const storageKey=room&&account.usuario?.id?'astrolearn-quiz-draft-v2:'+account.usuario.id+':'+room+':'+(editId||'novo'):null;
const $=id=>document.getElementById(id);
let draft=newDraft(),active=0,step=0,preparing=false,dirty=false,busy=false,storedSnapshot=null;
const make=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n;};
function button(label,action,className='quiz-secondary'){const b=make('button',label,className);b.type='button';b.addEventListener('click',action);return b;}
function message(text='',error=false){$('quizMessage').textContent=text;$('quizMessage').dataset.error=String(error);}
function change(){ $('reviewConfirmed').checked=false;dirty=true;$('draftState').textContent='Alterações não salvas';}
function iconButton(label,path,action){const b=button('',action,'quiz-icon');b.title=label;b.setAttribute('aria-label',label);const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',path);s.append(p);b.append(s);return b;}
const titleInput=$('quizTitle');titleInput.maxLength=180;titleInput.placeholder='Título do quiz';titleInput.setAttribute('aria-label','Título do quiz');titleInput.addEventListener('input',()=>{draft.title=titleInput.value;change();});
const description=$('quizDescription');description.maxLength=3000;description.rows=1;description.placeholder='Adicione uma descrição ou orientação para o aluno';description.setAttribute('aria-label','Descrição do quiz');description.addEventListener('input',()=>{draft.description=description.value;change();});
function syncMeta(){titleInput.value=draft.title;description.value=draft.description;$('quizType').value=draft.type;$('quizDuration').value=draft.duration_minutes??'';$('quizExit').checked=draft.end_on_tab_exit;$('quizPeriod').value=draft.period_id;$('quizWeight').value=draft.weight;$('quizOpens').value=draft.opens_at;$('quizCloses').value=draft.closes_at;$('aiDifficulty').value=draft.difficulty;}
function isBlankQuestion(q){return !q.question.trim()&&!q.correct_answer&&!q.explanation.trim()&&q.options.every(v=>!v.trim());}
function renderList(){
 $('questionCount').textContent=String(draft.questions.length);$('questionList').replaceChildren();
 draft.questions.forEach((q,index)=>{
  const b=button('',()=>{if(busy)return;active=index;preparing=false;render();},'quiz-question-item');b.setAttribute('aria-pressed',String(active===index));b.append(make('b',String(index+1).padStart(2,'0')),make('span',q.question||'Nova questão'));$('questionList').append(b);
 });
}
function renderEditor(){
 renderList();const target=$('questionEditor');target.replaceChildren();const q=draft.questions[active];if(!q)return;
 const head=make('div','','quiz-question-header'),actions=make('div','','quiz-icon-actions');head.append(make('h2','Questão '+String(active+1).padStart(2,'0')));
 const move=(delta)=>{const next=active+delta;if(next<0||next>=draft.questions.length)return;[draft.questions[active],draft.questions[next]]=[draft.questions[next],draft.questions[active]];active=next;change();renderEditor();};
 const up=iconButton('Mover questão para cima','m6 14 6-6 6 6',()=>move(-1));up.disabled=active===0;
 const down=iconButton('Mover questão para baixo','m6 10 6 6 6-6',()=>move(1));down.disabled=active===draft.questions.length-1;
 actions.append(up,down,iconButton('Duplicar questão','M9 3h12v12H9ZM3 9h3m-3 0v12h12v-3',()=>{if(draft.questions.length>=100){message('O limite deste editor é de 100 questões.',true);return;}draft.questions.splice(active+1,0,{...q,key:crypto.randomUUID(),options:q.options.slice()});active++;change();renderEditor();}),iconButton('Excluir questão','M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',()=>{
  const snapshot=draft.questions.splice(active,1)[0],index=active;active=Math.max(0,Math.min(active,draft.questions.length-1));change();if(!draft.questions.length)preparing=true;render();
  message('Questão excluída. ');$('quizMessage').append(button('Desfazer',()=>{draft.questions.splice(index,0,snapshot);active=index;preparing=false;change();message();render();},'quiz-link'));
 }));head.append(actions);target.append(head,make('span','Múltipla escolha','quiz-format'));
 const question=make('textarea','','quiz-enunciado');question.rows=2;question.maxLength=5000;question.value=q.question;question.placeholder='Escreva o enunciado da questão';question.setAttribute('aria-label','Enunciado da questão '+(active+1));question.addEventListener('input',()=>{q.question=question.value;change();renderList();});
 target.append(question,make('strong','Alternativas · selecione a resposta correta'));
 const options=make('div','','quiz-options');
 q.options.forEach((option,i)=>{
  const row=make('div','','quiz-option');row.dataset.correct=String(q.correct_answer===LETTERS[i]);
  const radio=make('input');radio.type='radio';radio.name='quiz-correct-answer';radio.checked=q.correct_answer===LETTERS[i];radio.setAttribute('aria-label','Marcar alternativa '+LETTERS[i].toUpperCase()+' como correta');
  const letter=make('span',LETTERS[i].toUpperCase(),'quiz-letter');
  const field=make('input');field.type='text';field.maxLength=2000;field.value=option;field.placeholder='Alternativa '+LETTERS[i].toUpperCase();field.setAttribute('aria-label',field.placeholder);field.addEventListener('input',()=>{q.options[i]=field.value;change();});
  const badge=make('span','Gabarito','quiz-correct-badge');badge.hidden=!radio.checked;
  radio.addEventListener('change',()=>{q.correct_answer=LETTERS[i];change();[...options.children].forEach((n,j)=>{n.dataset.correct=String(j===i);n.querySelector('.quiz-correct-badge').hidden=j!==i;});});
  row.append(radio,letter,field,badge);options.append(row);
 });target.append(options);
 const details=make('details','','quiz-explanation');details.append(make('summary','Explicação da resposta'));const explanation=make('textarea');explanation.rows=3;explanation.maxLength=3000;explanation.value=q.explanation;explanation.placeholder='Explique por que essa alternativa está correta';explanation.setAttribute('aria-label','Explicação da resposta');explanation.addEventListener('input',()=>{q.explanation=explanation.value;change();});details.append(explanation);target.append(details,make('p','O aluno verá a correção depois de finalizar.','quiz-muted'));
}
function renderReview(){
 const box=$('reviewContent');box.replaceChildren(make('h3',draft.title||'Quiz sem título'),make('p',draft.description,'quiz-muted'),make('p',`${draft.type==='treino'?'Treino':'Avaliação'} · ${draft.questions.length} questões · ${draft.duration_minutes?draft.duration_minutes+' minutos':'Sem limite de tempo'}`,'quiz-note'));
 let valid=true;try{validateQuestions(draft);validateSettings(draft);}catch(e){valid=false;const notice=make('p',e.message,'quiz-note quiz-review-warning');notice.setAttribute('role','status');notice.append(button('Voltar às questões',()=>navigate(0),'quiz-link'));box.append(notice);}
 $('reviewConfirmed').disabled=!valid;
 draft.questions.forEach((q,i)=>{const row=make('article','','quiz-review-question');row.append(make('h3',`${i+1}. ${q.question||'Enunciado não preenchido'}`));const list=make('ol');list.type='A';q.options.forEach((text,j)=>{const li=make('li',(text||'Alternativa não preenchida')+(q.correct_answer===LETTERS[j]?' ✓':''));li.dataset.correct=String(q.correct_answer===LETTERS[j]);list.append(li);});row.append(list);if(q.explanation)row.append(make('p',q.explanation,'quiz-muted'));box.append(row);});
}
function render(){
 $('preparePanel').hidden=step!==0||!preparing;$('editorPanel').hidden=step!==0;$('questionEditor').hidden=preparing;$('settingsPanel').hidden=step!==1;$('reviewPanel').hidden=step!==2;
 $('resumeEditor').hidden=!draft.questions.length;$('previousStep').hidden=step===0;$('nextStep').hidden=step===2;$('publishQuiz').hidden=step!==2;
 $('publishQuiz').disabled=busy||!publicationEnabled||!$('reviewConfirmed').checked;
 $('stepLabel').textContent=`Etapa ${step+1} de 3`;document.querySelectorAll('[data-step]').forEach((b,i)=>{if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.disabled=busy;});
 if(step===0){renderList();if(!preparing)renderEditor();}if(step===2)renderReview();
}
function navigate(next){
 if(busy)return;
 step=next;message();render();
}
function addQuestion(){if(busy)return;if(draft.questions.length>=100){message('O limite deste editor é de 100 questões.',true);return;}draft.questions.push(newQuestion());active=draft.questions.length-1;preparing=false;step=0;change();render();$('questionEditor').querySelector('textarea')?.focus();}
$('manualTab').addEventListener('click',()=>{if(!draft.questions.length)addQuestion();else{preparing=false;render();}});$('addQuestion').addEventListener('click',addQuestion);
$('aiTab').addEventListener('click',()=>{$('aiTheme').focus();});
$('openGenerator').addEventListener('click',()=>{preparing=true;render();$('aiTheme').focus();});
$('resumeEditor').addEventListener('click',()=>{preparing=false;render();});
$('generateForm').addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;message();let generationHint=0;
 try{
  const themeSnapshot=$('aiTheme').value.trim();
  const request=generationRequest({theme:$('aiTheme').value,year:$('aiYear').value,instructions:$('aiInstructions').value,quantity:Number($('aiQuantity').value),difficulty:$('aiDifficulty').value});
  if(draft.questions.length+request.quantidade>100)throw Error('O limite deste editor é de 100 questões.');
  busy=true;$('generateButton').disabled=true;$('generateButton').textContent='Gerando questões…';$('manualTab').disabled=true;$('resumeEditor').disabled=true;$('saveDraft').disabled=true;$('exportDraft').disabled=true;$('nextStep').disabled=true;$('generateForm').setAttribute('aria-busy','true');render();
  
  generationHint=setTimeout(()=>message('A IA ainda está trabalhando. Se estiver sobrecarregada, fará até duas novas tentativas.'),9000);
  const generated=await generateQuiz(request);clearTimeout(generationHint);
  if(generated.length!==request.quantidade)throw Error('A IA retornou uma quantidade diferente da solicitada. Tente gerar novamente.');
  if(draft.questions.length===1&&isBlankQuestion(draft.questions[0]))draft.questions=[];
  active=draft.questions.length;draft.questions.push(...generated);draft.difficulty=request.dificuldade;if(!draft.title)draft.title=themeSnapshot.slice(0,180);preparing=false;change();syncMeta();message('Questões geradas. Revise o conteúdo e os gabaritos antes de publicar.');
 }catch(e){message(e.message,true);}
 finally{clearTimeout(generationHint);busy=false;$('generateButton').disabled=false;$('generateButton').textContent='✧ Gerar questões';for(const id of ['manualTab','resumeEditor','saveDraft','exportDraft','nextStep'])$(id).disabled=false;$('generateForm').setAttribute('aria-busy','false');render();}
});
for(const [id,key]of [['quizWeight','weight'],['quizOpens','opens_at'],['quizCloses','closes_at']])$(id).addEventListener('input',()=>{draft[key]=key==='weight'?Number($(id).value):$(id).value;change();});
$('quizPeriod').addEventListener('change',()=>{draft.period_id=$('quizPeriod').value;change();});
$('quizType').addEventListener('change',()=>{draft.type=$('quizType').value;change();});
$('quizDuration').addEventListener('input',()=>{draft.duration_minutes=$('quizDuration').value===''?null:Number($('quizDuration').value);change();});
$('quizExit').addEventListener('change',()=>{draft.end_on_tab_exit=$('quizExit').checked;change();});
$('reviewConfirmed').addEventListener('change',()=>{$('publishQuiz').disabled=busy||!publicationEnabled||!$('reviewConfirmed').checked;});
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>navigate(Number(b.dataset.step))));
$('nextStep').addEventListener('click',()=>navigate(Math.min(2,step+1)));$('previousStep').addEventListener('click',()=>navigate(Math.max(0,step-1)));
$('saveDraft').addEventListener('click',()=>{
 try{if(!storageKey)throw Error('Abra uma turma com sua conta para salvar o rascunho.');const snapshot=JSON.stringify(draft),previous=localStorage.getItem(storageKey);if(previous!==storedSnapshot)throw Error('Este rascunho mudou em outra guia. Exporte sua versão antes de recarregar.');localStorage.setItem(storageKey,snapshot);storedSnapshot=snapshot;dirty=false;$('draftState').textContent='Salvo neste navegador';message('Rascunho salvo neste navegador e nesta conta. Ele ainda não foi enviado aos alunos.');}catch(e){message(e.message||'Não foi possível salvar. Exporte seu rascunho.',true);}
});
$('exportDraft').addEventListener('click',()=>{const file=new Blob([JSON.stringify({sala_id:room,...draft},null,2)],{type:'application/json'}),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download='astrolearn-quiz-rascunho.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Rascunho exportado. Guarde o arquivo: ele contém o gabarito.');});
$('publishQuiz').addEventListener('click',async()=>{
 if(busy||!publicationEnabled||!$('reviewConfirmed').checked)return;
 try{validateQuestions(draft);validateSettings(draft);busy=true;render();const result=await publishQuiz(room,draft);if(!result?.quiz?.id)throw Error('A publicação não foi confirmada pelo servidor.');dirty=false;message('Quiz publicado e confirmado pelo servidor.');$('draftState').textContent='Publicado';if(storageKey)try{localStorage.removeItem(storageKey);}catch{}location.assign('quizzes.html?sala='+encodeURIComponent(room));}catch(e){message(e.message,true);}finally{busy=false;if(storageKey&&(draft.server_id||draft.publish_uncertain)&&$('draftState').textContent!=='Publicado'){const snapshot=JSON.stringify(draft);try{localStorage.setItem(storageKey,snapshot);storedSnapshot=snapshot;}catch{}}render();}
});
window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
async function init(){
 if(!room){message('Abra uma turma para criar quizzes e carregar os semestres.',true);$('generateButton').disabled=true;$('manualTab').disabled=true;$('saveDraft').disabled=true;}
 const back=room?'quizzes.html?sala='+encodeURIComponent(room):'quizzes.html';$('quizBack').href=back;$('quizBack').setAttribute('aria-label','Voltar aos quizzes');$('quizBack').textContent='← Voltar aos quizzes';$('quizCatalogCrumb').href=back;$('quizRoom').href=room?'turma.html?sala='+encodeURIComponent(room):'home.html';
 if(storageKey){try{const saved=localStorage.getItem(storageKey);storedSnapshot=saved;if(saved){draft=restoreDraft(JSON.parse(saved));preparing=false;$('draftState').textContent='Rascunho recuperado';}}catch{message('O rascunho anterior não pôde ser recuperado. Nada foi sobrescrito.',true);}}
 if(editId){const data=await getTeacherQuiz(room,editId);if(!(draft.server_id===editId&&draft.questions.length))loadServerDraft(data);$('draftState').textContent=data.quiz.publicado_em?'Publicado':'Rascunho';document.querySelector('.quiz-heading h1').textContent='Editar quiz';document.title='Editar quiz · AstroLearn';}
 if(!draft.questions.length)draft.questions.push(newQuestion());
 syncMeta();render();
 // A edição local está pronta; a consulta da sala não deve prender o carregador.
 $('content').setAttribute('aria-busy','false');
 window.dispatchEvent(new CustomEvent('astrolearn:quiz-ready'));
 if(room)try{
  const data=await loadQuizRoom(room);$('quizRoom').textContent=data.sala?.nome||'Minha turma';const periods=data.periodos||[];$('quizPeriod').replaceChildren(new Option('Sem semestre',''));periods.forEach(p=>$('quizPeriod').append(new Option(p.nome,p.id)));
  if(draft.period_id&&!periods.some(p=>p.id===draft.period_id)){$('quizPeriod').append(new Option('Semestre do rascunho — conferir',draft.period_id));}
  $('quizPeriod').value=draft.period_id;$('quizWeight').value=draft.weight;$('quizOpens').value=draft.opens_at;$('quizCloses').value=draft.closes_at;
 }catch(e){message('Não foi possível carregar a turma: '+e.message,true);}
}
init().catch(error=>{message('Não foi possível preparar o editor: '+error.message,true);$('content').setAttribute('aria-busy','false');});

const help=document.getElementById('help');
if(help)help.addEventListener('click',()=>{
 const dialog=make('dialog','','quiz-help');const heading=make('h2','Criando seu quiz');heading.id='quizHelpTitle';dialog.setAttribute('aria-labelledby',heading.id);
 const close=button('×',()=>dialog.close(),'quiz-help-close');close.setAttribute('aria-label','Fechar ajuda');
 dialog.append(close,heading,make('p','Gere questões com IA ou crie manualmente. Depois, revise enunciados, alternativas e gabaritos.'),make('p','Os rascunhos são salvos apenas neste navegador, para sua conta e turma. Use Exportar rascunho para guardar uma cópia. Treinos não entram na média; avaliações usam as regras e os pesos definidos no semestre.'));
 document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();help.focus();},{once:true});dialog.showModal();
});


function loadServerDraft(data){
 const q=data.quiz;draft={...newDraft(),server_id:q.id,title:q.titulo||'',description:q.descricao||'',period_id:q.periodo_id||'',type:q.tipo==='avaliativo'?'avaliacao':'treino',weight:Number(q.peso)||1,duration_minutes:q.duracao_minutos??null,end_on_tab_exit:q.encerrar_ao_sair_guia===true,difficulty:q.dificuldade||'medio',questions:normalizeQuestions(data.perguntas)};
 const dateInput=v=>{if(!v)return '';const d=new Date(v);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};draft.opens_at=dateInput(q.janela_abre_em);draft.closes_at=dateInput(q.janela_fecha_em);

}
