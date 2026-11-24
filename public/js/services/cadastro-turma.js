import {solicitar,ErroAPI} from './api.js';
import {obterSessao} from './autenticacao.js';

export async function matricularNoCadastro(raw,{sinal}={}) {
 const codigo=String(raw || '').trim().toUpperCase();
 const session=obterSessao();
 if(!codigo)throw new ErroAPI('Informe o código fornecido pelo professor.');
 if(!session || session.usuario.role!=='aluno')throw new ErroAPI('Entre na sua conta de aluno para usar o código da turma.',401);
 const current=await solicitar('/api/aluno/dashboard',{token:session.token,sinal});
 if(current?.tem_sala && current.sala?.id){
  if(String(current.sala.codigo_acesso||'').trim().toUpperCase()===codigo)return current.sala;
  throw new ErroAPI('Sua conta já está na turma '+(current.sala.nome||'atual')+'. Fale com o professor para trocar de turma.',409);
 }
 try {
  const data=await solicitar('/api/aluno/entrar-sala',{metodo:'POST',dados:{codigo_sala:codigo,codigo_acesso:codigo},token:session.token,sinal});
  if(!data?.sala?.id)throw new ErroAPI('O servidor não confirmou a turma.');
  return data.sala;
 }catch(error){
  // Não repete uma escrita cuja resposta pode ter sido perdida.
  // Confere o vínculo antes de permitir nova tentativa.
  if(error.status===409 || !error.status || error.status>=500){
   try {
    const data=await solicitar('/api/aluno/dashboard',{token:session.token,sinal});
    if(data?.tem_sala && data.sala?.id){
     if(String(data.sala.codigo_acesso || '').trim().toUpperCase()===codigo)return data.sala;
     throw new ErroAPI('Sua conta já está na turma '+(data.sala.nome || 'atual')+'. Abra a plataforma ou fale com o professor para trocar de turma.',409);
    }
   }catch(checkError){if(checkError.status===409)throw checkError;}
  }
  throw error;
 }
}
