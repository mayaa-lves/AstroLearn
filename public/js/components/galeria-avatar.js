import {ids,lerET,salvarET} from '../services/avatar-conta.js';
const names=['Lilás astronauta','Verde cientista','Azul artista','Turquesa leitor','Lilás engenheiro','Verde astronauta','Azul explorador','Turquesa astronauta'];
const sheet=new URL('../../assets/avatares/ets-perfil.png',import.meta.url).href;

export function iniciarGaleria(user) {
  const portrait=document.getElementById('avatarImage'),initials=document.getElementById('avatarInitials');
  const trigger=document.getElementById('changePhoto'),textTrigger=document.getElementById('chooseProfilePhoto');
  const status=document.getElementById('avatarStatus');
  if(!portrait||!trigger||!initials)return;
  if(!document.querySelector('link[data-avatar-gallery]')){
    const css=document.createElement('link');css.rel='stylesheet';css.dataset.avatarGallery='';
    css.href=new URL('../../css/components/galeria-avatar.css',import.meta.url).href;document.head.append(css);
  }
  let committed=null,selected=null,saving=false,version=0,interacted=false,opener=trigger;
  const node=(tag,text='',className='')=>{const e=document.createElement(tag);e.textContent=text;e.className=className;return e;};
  function paint(el,index){
    el.classList.add('et-avatar');el.style.backgroundImage=`url("${sheet}")`;
    el.style.backgroundPosition=`${index%4*100/3}% ${index<4?0:100}%`;
  }
  function applyPortrait(index){
    if(!Number.isInteger(index)||index<0||index>=names.length)return;
    paint(portrait,index);portrait.hidden=false;initials.hidden=true;
    portrait.setAttribute('role','img');portrait.setAttribute('aria-label','Foto de perfil: '+names[index]);
  }
  const dialog=node('dialog','','et-gallery');dialog.setAttribute('aria-labelledby','avatarGalleryTitle');
  const heading=node('h2','Escolha sua foto de perfil');heading.id='avatarGalleryTitle';
  const intro=node('p','Selecione uma das fotos e confira antes de aplicar.','et-gallery-intro');
  const previewBox=node('div','','et-gallery-preview');
  const preview=node('span','','et-avatar et-preview-image');preview.setAttribute('role','img');
  const selectedName=node('strong','Selecione uma foto');previewBox.append(preview,selectedName);
  const grid=node('div','','et-grid');grid.setAttribute('role','group');grid.setAttribute('aria-label','Fotos de perfil disponíveis');
  const feedback=node('p','','et-gallery-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  const actions=node('div','','et-gallery-actions');
  const cancel=node('button','Cancelar','secondary');cancel.type='button';
  const apply=node('button','Aplicar foto','primary');apply.type='button';apply.disabled=true;
  const buttons=names.map((name,index)=>{
    const button=node('button','','et-option');button.type='button';button.setAttribute('aria-label','Escolher '+name);
    const image=node('span');image.setAttribute('aria-hidden','true');paint(image,index);
    button.append(image,node('span',name,'et-option-name'));
    button.onclick=()=>{if(saving)return;interacted=true;selected=index;feedback.textContent='Prévia selecionada. Clique em Aplicar foto para confirmar.';renderSelection();};
    grid.append(button);return button;
  });
  function renderSelection(){
    buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===selected));b.disabled=saving;});
    cancel.disabled=saving;apply.disabled=saving||selected===null||selected===committed;
    apply.textContent=saving?'Aplicando…':'Aplicar foto';dialog.setAttribute('aria-busy',String(saving));
    if(selected!==null){paint(preview,selected);preview.setAttribute('aria-label','Prévia: '+names[selected]);selectedName.textContent=names[selected];}
    else{preview.classList.remove('et-avatar');preview.style.backgroundImage='none';preview.textContent=(user?.nome||'Aluno').trim()[0]||'A';preview.setAttribute('aria-label','Nenhuma foto selecionada');selectedName.textContent='Selecione uma foto';}
    if(selected!==null)preview.textContent='';
  }
  function open(event){
    opener=event?.currentTarget||trigger;selected=committed;interacted=false;feedback.textContent='';renderSelection();
    if(!dialog.open)dialog.showModal();buttons[selected??0].focus();
  }
  trigger.setAttribute('aria-label','Escolher foto de perfil');trigger.title='Escolher foto de perfil';trigger.onclick=open;
  if(textTrigger)textTrigger.onclick=open;
  cancel.onclick=()=>{if(!saving)dialog.close();};
  dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
  dialog.addEventListener('close',()=>{selected=committed;interacted=false;if(opener?.isConnected)opener.focus();});
  apply.onclick=async()=>{
    if(saving||selected===null||selected===committed)return;
    const choice=selected;saving=true;version++;feedback.textContent='Aplicando sua foto…';renderSelection();
    try{
      await salvarET(choice);committed=choice;selected=choice;applyPortrait(choice);
      status.textContent='Foto de perfil aplicada à sua conta.';
      window.dispatchEvent(new CustomEvent('astrolearn:avatar-changed',{detail:{userId:user?.id,avatar_id:ids[choice]}}));
      dialog.close();
    }catch{
      feedback.textContent='Não foi possível confirmar a foto na sua conta. Tente aplicar novamente.';
    }finally{saving=false;renderSelection();}
  };
  actions.append(cancel,apply);dialog.append(heading,intro,previewBox,grid,feedback,actions);document.body.append(dialog);
  renderSelection();
  const loadVersion=version;
  lerET().then(index=>{
    if(version!==loadVersion)return;
    if(Number.isInteger(index)&&index>=0&&index<names.length){committed=index;applyPortrait(index);if(!dialog.open||!interacted)selected=index;renderSelection();}
  }).catch(()=>{if(version===loadVersion)status.textContent='Não foi possível carregar sua foto. Você pode escolher e tentar aplicar uma das opções.';});
}
