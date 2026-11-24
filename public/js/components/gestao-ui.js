export function node(tag,text='',className=''){const el=document.createElement(tag);el.textContent=text;el.className=className;return el;}
export function button(text,action,kind='secondary'){const b=node('button',text,kind);b.type='button';b.onclick=action;return b;}
export function field(label,type='text',value=''){const box=node('label','','integration-field');const input=node(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.value=value;box.append(node('span',label),input);return {box,input};}
export function dialog(title){
 let opener=document.activeElement;
 if(opener?.closest('.room-student-popup'))opener=document.querySelector('.room-student-more[aria-expanded="true"]')||opener;
 const box=node('dialog','','integration-dialog');
 const heading=node('h2',title);heading.id='integration-title-'+Math.random().toString(36).slice(2);box.setAttribute('aria-labelledby',heading.id);
 let busy=false;
 const close=button('×',()=>box.close(),'integration-close');close.setAttribute('aria-label','Fechar');
 const body=node('div','','integration-body'),status=node('p','','integration-status');status.setAttribute('role','status');
 box.append(close,heading,body,status);document.body.append(box);box.showModal();
 box.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 box.addEventListener('close',()=>{box.remove();if(opener?.isConnected)opener.focus();},{once:true});
 return {box,body,status,close,setBusy(value){busy=value;close.disabled=value;box.setAttribute('aria-busy',String(value));}};
}
export function confirmDelete({title,name,description,remove,success}){
 const view=dialog(title);view.body.append(node('p',description));
 const typed=field('Digite “'+name+'” para confirmar');typed.input.autocomplete='off';view.body.append(typed.box);
 const actions=node('div','','integration-actions');const cancel=button('Cancelar',()=>view.box.close());
 const confirm=button('Excluir definitivamente',async()=>{
  if(typed.input.value!==name)return;
  confirm.disabled=cancel.disabled=typed.input.disabled=true;view.setBusy(true);view.status.textContent='Excluindo…';
  try{await remove();view.box.close();success();}
  catch(error){view.status.textContent=error.message||'Não foi possível confirmar a exclusão. Atualize a lista antes de tentar novamente.';confirm.disabled=cancel.disabled=typed.input.disabled=false;view.setBusy(false);}
 },'primary integration-danger');confirm.disabled=true;
 typed.input.oninput=()=>confirm.disabled=typed.input.value!==name;actions.append(cancel,confirm);view.body.append(actions);typed.input.focus();
}
