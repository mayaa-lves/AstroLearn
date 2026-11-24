import { api } from './conexao.js';
const part=encodeURIComponent;
const base=id=>'/api/professor/salas/'+part(id);
export const consultarTurma=id=>api(base(id));
export const consultarConvite=id=>api(base(id)+'/convite');
export const excluirTurma=id=>api(base(id),'DELETE');
export const excluirSemestre=(sala,id)=>api(base(sala)+'/periodos/'+part(id),'DELETE');
export const removerAluno=(sala,id)=>api(base(sala)+'/alunos/'+part(id),'DELETE');
export const adicionarAluno=(sala,email)=>api(base(sala)+'/alunos','POST',{email});
export const proporMaterial=dados=>api('/api/aluno/biblioteca','POST',dados);
export function linkConvite(codigo) {
  if(typeof codigo!=='string'||!codigo.trim()||codigo.length>100)throw Error('O servidor não retornou um código de convite válido.');
  const url=new URL('../../../aluno/convite.html',import.meta.url);
  url.searchParams.set('codigo',codigo.trim());
  return url.href;
}
