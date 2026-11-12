// Reutiliza os próprios sprites da prévia da Loja. O Perfil define o ET.
export function iniciarAvatarLoja({render,slider,angleLabel,stage}) {
 const characters=['lilas','tres-olhos','explorador','turquesa','lilas','tres-olhos','explorador','turquesa'];
 const canvas=document.createElement('canvas');canvas.width=384;canvas.height=512;canvas.className='avatar-turntable';canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d');let frames=[],revision=0,key='';
 slider.min='0';slider.max='1';slider.step='1';slider.value='0';
 const label=document.querySelector('label[for="avatarRotation"]');if(label)label.textContent='Ver frente e costas';
 function rotate(){if(!ctx||!frames.length)return;const side=Number(slider.value)>=1?1:0;ctx.clearRect(0,0,384,512);ctx.imageSmoothingEnabled=false;const f=frames[side];const scale=Math.min(350/f.width,472/f.height);const w=Math.round(f.width*scale),h=Math.round(f.height*scale);ctx.drawImage(f,Math.round((384-w)/2),496-h,w,h);angleLabel.textContent=side?'De costas':'De frente';slider.setAttribute('aria-valuetext',angleLabel.textContent);stage.setAttribute('aria-label','Avatar do Perfil, '+angleLabel.textContent.toLowerCase());}
 async function select(index){const character=characters[index]||characters[0];let row=1,rows=3,suffix='';
  try{const state=JSON.parse(localStorage.getItem('astrolearn-skins-v2')||'null');const saved=state?.saved;const skin=saved?.skin;if(state?.version===2&&saved?.character===character&&(skin===character+'-orion'||state.owned?.includes(skin))){const kind=skin.slice(character.length+1);const collection=['orbita','nebulosa','aurora','eclipse'];if(kind==='galaxia')row=2;else if(collection.includes(kind)){row=collection.indexOf(kind);rows=4;suffix='-colecao';}}}catch{}
  const next=character+suffix+':'+row;if(next===key)return;const token=++revision;const image=new Image();image.src=new URL(`../../assets/imagens/aluno/loja/pixel-previa/${character}${suffix}.png`,import.meta.url).href;
  try{await image.decode();}catch{return;}if(token!==revision||!ctx)return;
  frames=[0,1].map(side=>{const w=image.naturalWidth/2,h=image.naturalHeight/rows;const buffer=document.createElement('canvas');buffer.width=w;buffer.height=h;const c=buffer.getContext('2d');c.drawImage(image,side*w,row*h,w,h,0,0,w,h);const pixels=c.getImageData(0,0,w,h).data;let left=w,top=h,right=0,bottom=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>64){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}const cut=document.createElement('canvas');cut.width=Math.max(1,right-left+1);cut.height=Math.max(1,bottom-top+1);cut.getContext('2d').drawImage(buffer,left,top,cut.width,cut.height,0,0,cut.width,cut.height);return cut;});
  key=next;slider.value='0';render.classList.add('has-turntable');render.replaceChildren(canvas);rotate();
 }
 window.addEventListener('storage',event=>{if(event.key==='astrolearn-skins-v2'){key='';}});
 return {select,rotate};
}
