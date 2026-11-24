import { api } from '../../services/conexao.js';
import { prepararMaterial } from '../../services/biblioteca-anexos.js';
import { validarArquivos, AVISO_UPLOAD } from '../../services/atividades.js';
import { proporMaterial } from '../../services/gestao-turma.js';
import { node,button,field,dialog } from '../../components/gestao-ui.js';
const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../../css/gestao-integracoes.css?v=1',import.meta.url).href;document.head.append(css);
const create=button('+ Sugerir material',()=>{
 const view=dialog('Sugerir material');view.body.append(node('p','Sua sugestão será enviada ao professor. A turma verá o material depois da aprovação.'));
 const form=node('form','','integration-form'),title=field('Título *'),desc=field('Descrição','textarea'),links=field('Links (um por linha)','textarea'),upload=field('PDF ou imagem','file');
 title.input.required=true;title.input.maxLength=160;desc.input.maxLength=10000;links.input.maxLength=10000;upload.input.accept='.pdf,.png,.jpg,.jpeg';
 const submit=node('button','Enviar para aprovação','primary');submit.type='submit';
 form.append(title.box,desc.box,links.box,upload.box,node('p','Formatos: PDF, PNG e JPG. '+AVISO_UPLOAD),submit);view.body.append(form);
 form.onsubmit=async event=>{
  event.preventDefault();if(submit.disabled||!form.reportValidity())return;
  let payload;
  try{
   const urls=links.input.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
   for(const url of urls){const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Use links completos começando com https:// ou http://.');}
   const files=validarArquivos(upload.input.files,1);
   payload=prepararMaterial({titulo:title.input.value.trim(),descricao:desc.input.value.trim(),links:urls},files[0]);
   if(!title.input.value.trim())throw Error('Preencha o título.');
  }catch(error){view.status.textContent=error.message;return;}
  submit.disabled=true;view.setBusy(true);view.status.textContent='Enviando sugestão…';
  try{
   const room=await api('/api/aluno/dashboard');if(!room.tem_sala)throw Error('Entre em uma turma antes de sugerir materiais.');
   const result=await proporMaterial(payload);if(!result.material?.id)throw Error('O servidor não confirmou o material. Atualize a biblioteca antes de enviar novamente.');
   view.box.close();document.getElementById('refresh').click();
   const notice=document.getElementById('storageNotice');notice.textContent='Material enviado. Aguardando aprovação do professor.';
  }catch(error){view.status.textContent=error.message+(!error.status?' Confira a biblioteca antes de repetir o envio.':'');submit.disabled=false;view.setBusy(false);}
 };
 title.input.focus();
},'primary integration-suggest');
document.querySelector('.library-heading').append(create);
