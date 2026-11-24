import { api } from '../services/conexao.js';
import './professor-sala-controles.js?v=1';
import { consultarTurma,consultarConvite,excluirTurma,excluirSemestre,removerAluno,adicionarAluno,linkConvite } from '../services/gestao-turma.js';
import { node,button,field,dialog,confirmDelete } from './gestao-ui.js';
if(location.pathname.includes('/professor/')){
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../../css/gestao-integracoes.css?v=2',import.meta.url).href;document.head.append(style);
 const params=new URLSearchParams(location.search),sala=params.get('sala'),page=document.body.dataset.page;
 const refresh=()=>location.reload();
 async function invite(){
  const view=dialog('Convidar aluno');view.status.textContent='Consultando convite…';
  try{
   const data=await consultarConvite(sala);view.status.textContent='';
   view.body.append(node('p','Compartilhe o link ou o código da turma. O aluno confirma a entrada após fazer login.'));
   const code=field('Código da turma','text',data.codigo_acesso);code.input.readOnly=true;
   const link=field('Link de convite','text',linkConvite(data.codigo_acesso));link.input.readOnly=true;
   const copy=button('Copiar link',async()=>{try{await navigator.clipboard.writeText(link.input.value);view.status.textContent='Link copiado.';}catch{link.input.focus();link.input.select();view.status.textContent='Selecione e copie o link acima.';}},'primary');
   const extra=node('details'),summary=node('summary','Adicionar aluno pelo e-mail');extra.append(summary);
   const form=node('form','','integration-form'),email=field('E-mail do aluno','email');email.input.required=true;email.input.autocomplete='email';
   const add=node('button','Adicionar aluno','primary');add.type='submit';form.append(email.box,add);extra.append(form);
   form.onsubmit=async event=>{event.preventDefault();if(add.disabled||!form.reportValidity())return;add.disabled=true;view.setBusy(true);view.status.textContent='Adicionando aluno…';try{await adicionarAluno(sala,email.input.value.trim());view.box.close();refresh();}catch(error){view.status.textContent=error.message;add.disabled=false;view.setBusy(false);}};
   view.body.append(code.box,link.box,copy,extra);link.input.focus();
  }catch(error){view.status.textContent=error.message;view.body.append(button('Tentar novamente',()=>{view.box.close();invite();}));}
 }
 async function students(){
  const view=dialog('Gerenciar alunos');view.status.textContent='Carregando alunos…';
  try{
   const room=await consultarTurma(sala);view.status.textContent='';
   const form=node('form','','integration-form'),email=field('Adicionar aluno pelo e-mail','email');email.input.required=true;
   const add=node('button','Adicionar aluno','primary');add.type='submit';form.append(email.box,add);view.body.append(form);
   form.onsubmit=async event=>{event.preventDefault();if(add.disabled||!form.reportValidity())return;add.disabled=true;view.setBusy(true);view.status.textContent='Adicionando…';
    try{await adicionarAluno(sala,email.input.value.trim());view.box.close();refresh();}catch(error){view.status.textContent=error.message;add.disabled=false;view.setBusy(false);}};
   if(!room.alunos?.length)view.body.append(node('p','Esta turma ainda não tem alunos.'));
   for(const aluno of room.alunos||[]){const row=node('div','','integration-list-row');row.append(node('span',aluno.nome),button('Remover da turma',()=>confirmDelete({title:'Remover aluno da turma',name:aluno.nome,description:'Remover '+aluno.nome+' da turma? A conta do aluno não será excluída. A composição das equipes também deve ser conferida após a remoção.',remove:()=>removerAluno(sala,aluno.id),success:refresh}),'secondary integration-danger'));view.body.append(row);}
  }catch(error){view.status.textContent=error.message;}
 }
 async function semesters(){
  const view=dialog('Gerenciar semestres');view.status.textContent='Carregando semestres…';
  try{const room=await consultarTurma(sala);view.status.textContent='';
   if(!room.periodos?.length)view.body.append(node('p','Nenhum semestre cadastrado.'));
   for(const period of room.periodos||[]){const row=node('div','','integration-list-row');row.append(node('span',period.nome),button('Excluir semestre',()=>confirmDelete({title:'Excluir semestre',name:period.nome,description:'A exclusão é permanente e pode afetar atividades e equipes deste semestre. Confira os dados antes de continuar.',remove:()=>excluirSemestre(sala,period.id),success:()=>{const url=new URL(location.href);if(url.searchParams.get('periodo')===String(period.id))url.searchParams.delete('periodo');location.assign(url.href);}}),'secondary integration-danger'));view.body.append(row);}
  }catch(error){view.status.textContent=error.message;}
 }
 async function deleteRoom(id){
  const view=dialog('Consultar turma');view.status.textContent='Carregando dados…';
  try{const room=await consultarTurma(id);view.box.close();confirmDelete({title:'Excluir turma',name:room.sala.nome,description:'Esta exclusão é permanente. Os vínculos e os dados associados à turma podem ser removidos. Não é possível desfazer pela plataforma.',remove:()=>excluirTurma(id),success:()=>location.assign('home.html')});}
  catch(error){view.status.textContent=error.message;}
 }
 async function createSemester(){
  const view=dialog('Criar semestre'),form=node('form','','integration-form'),name=field('Nome do semestre');name.input.required=true;name.input.maxLength=80;name.input.placeholder='Ex.: 1º semestre';
  const actions=node('div','','integration-actions'),cancel=button('Cancelar',()=>view.box.close()),save=node('button','Criar semestre','primary');save.type='submit';actions.append(cancel,save);form.append(name.box,actions);view.body.append(form);name.input.focus();
  form.onsubmit=async event=>{event.preventDefault();if(save.disabled||!form.reportValidity())return;if(!name.input.value.trim()){name.input.focus();return;}save.disabled=cancel.disabled=true;view.setBusy(true);view.status.textContent='Criando semestre…';
   try{await api('/api/professor/salas/'+encodeURIComponent(sala)+'/periodos','POST',{nome:name.input.value.trim()});view.box.close();refresh();}catch(error){view.status.textContent=error.message;save.disabled=cancel.disabled=false;view.setBusy(false);}
  };
 }
 if(sala&&page==='room'){
  document.addEventListener('click',event=>{
   const target=event.target.closest('[data-room-operation]');if(!target)return;event.preventDefault();
   const op=target.dataset.roomOperation;
   if(op==='invite')invite();
   if(op==='manage-students')students();
   if(op==='manage-semesters')semesters();
   if(op==='create-semester')createSemester();
   if(op==='delete-room')deleteRoom(sala);
   if(op==='remove-student')confirmDelete({title:'Remover aluno da turma',name:target.dataset.studentName,description:'O aluno deixará de participar desta turma. A conta dele será mantida. Confira a composição das equipes após a remoção.',remove:()=>removerAluno(sala,target.dataset.studentId),success:refresh});
  });
 }
 if(page==='rooms'){
  function decorate(){for(const card of document.querySelectorAll('.room-card[data-room-id]')){
   if(card.querySelector('.integration-room-delete'))continue;
   const remove=button('',()=>deleteRoom(card.dataset.roomId),'integration-room-delete');remove.title='Excluir turma';remove.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg>';remove.setAttribute('aria-label','Excluir turma '+(card.querySelector('h2')?.textContent||''));
   const footer=card.querySelector('.room-card-footer');if(footer)footer.append(remove);
  }}
  new MutationObserver(decorate).observe(document.getElementById('content'),{childList:true,subtree:true});decorate();
 }
}
