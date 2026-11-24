import { obterSessao } from '../../services/autenticacao.js';
import { matricularNoCadastro } from '../../services/cadastro-turma.js';
import { node,button } from '../../components/gestao-ui.js';
const code=String(new URLSearchParams(location.search).get('codigo')||'').trim().toUpperCase();
const content=document.getElementById('inviteContent'),status=document.getElementById('inviteStatus');
const clear=()=>{try{sessionStorage.removeItem('astrolearn-convite-v1');}catch{}};
if(!/^[A-Z0-9-]{1,100}$/.test(code))status.textContent='Este convite está incompleto. Peça um novo link ao professor.';
else{
 content.append(node('p','Código da turma: '+code));
 const session=obterSessao();
 if(!session){
  try{sessionStorage.setItem('astrolearn-convite-v1',code);}catch{status.textContent='O navegador não guardou o convite. Após entrar, abra este link novamente.';}
  content.append(node('p','Entre com sua conta de aluno ou crie uma conta. Depois, confirme sua entrada nesta turma.'));
  for(const [label,file]of [['Já tenho conta','login.html'],['Criar conta de aluno','cadastro.html']]){
   const a=node('a',label,'primary');a.href='../auth/'+file;content.append(a);
  }
 }else if(session.usuario.role!=='aluno'){
  status.textContent='Este convite é para alunos. Você está conectado como professor.';
  const home=node('a','Voltar às minhas turmas','secondary');home.href='../professor/home.html';content.append(home);
 }else{
  const enter=button('Confirmar entrada na turma',async()=>{
   if(enter.disabled)return;
   enter.disabled=true;status.textContent='Conferindo sua matrícula…';
   try{const room=await matricularNoCadastro(code);clear();status.textContent='Entrada confirmada na turma '+(room.nome||'do professor')+'.';enter.remove();
    const a=node('a','Abrir minha trilha','primary');a.href='home.html#journey';content.append(a);
   }catch(error){status.textContent=error.message;enter.disabled=false;}
  },'primary');
  content.append(enter,button('Cancelar convite',()=>{clear();location.assign('home.html');}));
 }
}
