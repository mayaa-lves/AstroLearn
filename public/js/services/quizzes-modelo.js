/* Modelo puro: sem DOM, rede, notas ou regras de avaliação presumidas. */
export const LETTERS = ['a','b','c','d'];
export const CONTRACT_VERSION = 1;
export function newQuestion(){return {key:crypto.randomUUID(),question:'',options:['','','',''],correct_answer:'',explanation:''};}
export function newDraft(){return {version:1,title:'',description:'',period_id:'',type:'treino',duration_minutes:null,end_on_tab_exit:false,difficulty:'medio',questions:[]};}
export function normalizeQuestions(items){
 if(!Array.isArray(items)||!items.length||items.length>100)throw Error('A IA não retornou uma lista válida de questões. Tente novamente.');
 return items.map((item,index)=>{
  if(!item||typeof item!=='object')throw Error(`A questão ${index+1} veio incompleta.`);
  const text=item.question??item.pergunta;
  const options=item.options??item.opcoes??[item.option_a,item.option_b,item.option_c,item.option_d];
  if(typeof text!=='string'||!text.trim()||!Array.isArray(options)||options.length!==4||options.some(v=>typeof v!=='string'||!v.trim()))throw Error(`A questão ${index+1} precisa de enunciado e quatro alternativas preenchidas.`);
  const raw=String(item.correct_answer??item.resposta_correta??'').trim();let correct=raw.toLowerCase();
  if(!LETTERS.includes(correct)){
   const matches=options.map((s,i)=>s.trim().toLocaleLowerCase('pt-BR')===correct?i:-1).filter(i=>i>=0);
   correct=matches.length===1?LETTERS[matches[0]]:'';
  }
  if(!correct)throw Error(`O gabarito da questão ${index+1} veio inválido. Gere novamente.`);
  return {...newQuestion(),question:text.trim(),options:options.map(s=>s.trim()),correct_answer:correct,explanation:typeof item.explanation==='string'?item.explanation:''};
 });
}
export function validateQuestions(draft){
 if(!draft.title.trim())throw Error('Dê um título ao quiz antes de continuar.');
 if(!draft.questions.length)throw Error('Crie ou gere pelo menos uma questão.');
 draft.questions.forEach((q,i)=>{
  if(!q.question.trim())throw Error(`Preencha o enunciado da questão ${i+1}.`);
  if(q.options.length!==4||q.options.some(v=>!v.trim()))throw Error(`Preencha as quatro alternativas da questão ${i+1}.`);
  if(new Set(q.options.map(v=>v.trim().toLocaleLowerCase('pt-BR'))).size!==4)throw Error(`Evite alternativas repetidas na questão ${i+1}.`);
  if(!LETTERS.includes(q.correct_answer))throw Error(`Selecione o gabarito da questão ${i+1}.`);
 });
}
export function validateSettings(draft){
 if(!['treino','avaliacao'].includes(draft.type))throw Error('Escolha treino ou avaliação.');
 if(draft.duration_minutes!==null&&(!Number.isInteger(draft.duration_minutes)||draft.duration_minutes<1||draft.duration_minutes>1440))throw Error('O tempo precisa ser um número inteiro de 1 a 1440 minutos, ou ficar vazio.');
}
export function restoreDraft(data){
 if(!data||data.version!==1||typeof data.title!=='string'||typeof data.description!=='string'||!Array.isArray(data.questions)||data.questions.length>100)throw Error('O rascunho salvo tem formato incompatível.');
 const result={...newDraft(),title:data.title,description:data.description,period_id:typeof data.period_id==='string'?data.period_id:'',type:['treino','avaliacao'].includes(data.type)?data.type:'treino',duration_minutes:data.duration_minutes??null,end_on_tab_exit:data.end_on_tab_exit===true,difficulty:['facil','medio','dificil'].includes(data.difficulty)?data.difficulty:'medio'};
 result.questions=data.questions.map(q=>{
  if(!q||typeof q.question!=='string'||!Array.isArray(q.options)||q.options.length!==4||q.options.some(v=>typeof v!=='string'))throw Error('Uma questão do rascunho está inválida.');
  return {...newQuestion(),question:q.question,options:q.options.slice(),correct_answer:LETTERS.includes(q.correct_answer)?q.correct_answer:'',explanation:typeof q.explanation==='string'?q.explanation:''};
 });
 validateSettings(result);return result;
}
export function generationRequest({theme,year,instructions,quantity,difficulty}){
 if(!theme.trim())throw Error('Informe o tema ou conteúdo.');
 if(!Number.isInteger(quantity)||quantity<1||quantity>20)throw Error('Escolha de 1 a 20 questões.');
 if(!['facil','medio','dificil'].includes(difficulty))throw Error('Escolha uma dificuldade válida.');
 return {tema:[theme.trim(),year.trim()?`Público: ${year.trim()}.`:'',instructions.trim()?`Orientações: ${instructions.trim()}`:''].filter(Boolean).join('\n'),quantidade:quantity,dificuldade:difficulty};
}
export function publicationPayload(draft){
 validateQuestions(draft);validateSettings(draft);
 return {titulo:draft.title.trim(),descricao:draft.description.trim(),periodo_id:draft.period_id||null,dificuldade:draft.difficulty,tipo:draft.type,duracao_minutos:draft.duration_minutes,encerrar_ao_sair_da_guia:draft.end_on_tab_exit,perguntas:draft.questions.map((q,i)=>({question:q.question.trim(),option_a:q.options[0].trim(),option_b:q.options[1].trim(),option_c:q.options[2].trim(),option_d:q.options[3].trim(),correct_answer:q.correct_answer,explicacao:q.explanation.trim(),ordem:i+1}))};
}
