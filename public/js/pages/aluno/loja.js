/* Loja de skins completas. Saldo, inventário e visual continuam demonstrativos e locais. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY='astrolearn-skins-v2', LEGACY='astrolearn-avatar-v1';
  const characters=[{id:'explorador',name:'Azul'},{id:'turquesa',name:'Turquesa'},{id:'lilas',name:'Lilás'},{id:'tres-olhos',name:'Três Olhos'}];
  const collection=[
    {key:'orbita',name:'Skin Órbita',row:0,price:120,description:'Exploração e aventura'},
    {key:'nebulosa',name:'Skin Nebulosa',row:1,price:180,description:'Detalhes de constelações'},
    {key:'aurora',name:'Skin Aurora',row:2,price:300,description:'Branco, prata e luzes ciano'},
    {key:'eclipse',name:'Skin Eclipse',row:3,price:420,description:'Preto e dourado'},
  ];
  const skins=characters.flatMap(c=>[
    {id:c.id+'-orion',character:c.id,name:'Skin Órion',row:1,price:0,sheet:'base',description:'Visual original completo'},
    {id:c.id+'-galaxia',character:c.id,name:'Skin Galáxia',row:2,price:260,sheet:'base',description:'Visual completo com boné'},
    ...collection.map(s=>({...s,id:c.id+'-'+s.key,character:c.id,sheet:'collection'})),
  ].sort((a,b)=>a.price-b.price));
  const free=skins.filter(s=>s.price===0).map(s=>s.id);
  const blank=()=>({character:null,skin:null}), copy=x=>({...x});
  const same=(a,b)=>a.character===b.character&&a.skin===b.skin;
  const skin=id=>skins.find(s=>s.id===id);
  function validLook(v){
    if(!characters.some(c=>c.id===v?.character))return blank();
    const choice=skin(v.skin);
    return {character:v.character,skin:choice?.character===v.character?choice.id:v.character+'-orion'};
  }
  function coins(n){return Number.isInteger(n)&&n>=0&&n<=320?n:320;}
  let account={coins:320,owned:[...free],saved:blank()},storageIssue=false;
  try{
    const current=JSON.parse(localStorage.getItem(KEY)||'null');
    if(current?.version===2){
      account.coins=coins(current.coins);
      account.owned=[...new Set([...free,...(Array.isArray(current.owned)?current.owned:[]).filter(id=>skin(id))])];
      account.saved=validLook(current.saved);
      if(account.saved.skin&&!account.owned.includes(account.saved.skin))account.saved.skin=account.saved.character+'-orion';
    }else{
      const old=JSON.parse(localStorage.getItem(LEGACY)||'null');
      if(old?.version===1){
        account.coins=coins(old.coins);
        const owned=Array.isArray(old.owned)?old.owned:[];
        const fullBundle=['top-galaxia','legs-galaxia','hat-cometa'].every(id=>owned.includes(id));
        if(fullBundle)account.owned.push(...skins.filter(s=>s.id.endsWith('-galaxia')).map(s=>s.id));
        else {
          // Créditos gastos em peças avulsas voltam ao saldo da nova loja.
          const refund=[['top-galaxia',100],['legs-galaxia',80],['hat-cometa',80]].reduce((sum,[id,price])=>sum+(owned.includes(id)?price:0),0);
          account.coins=Math.min(320,account.coins+refund);
        }
        if(characters.some(c=>c.id===old.saved?.character)){
          const original=old.saved.character+'-orion',premium=old.saved.character+'-galaxia';
          const complete=old.saved.top==='top-galaxia'&&old.saved.legs==='legs-galaxia'&&old.saved.hat==='hat-cometa';
          account.saved={character:old.saved.character,skin:complete&&account.owned.includes(premium)?premium:original};
        }
      }
    }
  }catch{storageIssue=true;}
  let draft=copy(account.saved),view='front',past=[],future=[],pending=null,origin=null;
  function say(text){$('status').textContent=text;}
  function persist(next){
    try{localStorage.setItem(KEY,JSON.stringify({version:2,...next}));return true;}
    catch{$('error').textContent='Não foi possível salvar neste navegador. Seu saldo e visual anterior foram mantidos.';return false;}
  }
  let pixelArt = false;
  try { pixelArt = localStorage.getItem('astrolearn:tema-aluno') === 'pixel'; }
  catch {}
  const artFolder = pixelArt ? 'pixel' : 'realistas';
  if (pixelArt) {
    $('avatar').style.setProperty('animation', 'none', 'important');
    $('avatar').style.setProperty('transition', 'none', 'important');
  }

  // Espaço próprio para o personagem: os controles ficam fora do recorte.
  const previewStyle = document.createElement('style');
  previewStyle.textContent = `
    .preview #stage {
      box-sizing:border-box;flex:0 0 auto;width:100%;max-width:560px;
      height:auto;min-height:0;max-height:none;aspect-ratio:1;
      margin:18px auto 24px;padding:18px;overflow:hidden;
    }
    .preview #stage #avatar {width:100%;height:auto;max-height:100%;aspect-ratio:1}
    .preview .view-switch {position:relative;flex-shrink:0;margin-top:0;margin-bottom:12px}
    html[data-astro-tema="pixel"] .preview #stage {
      background:radial-gradient(ellipse at 40% 28%,#fbf9ff,#ece1f7 75%,#f8f4fa)!important;
      border-radius:18px;
    }
    html[data-astro-tema="pixel"] .preview #stage::before,
    html[data-astro-tema="pixel"] .preview #stage::after {background:none!important}
    @media(max-width:600px){.preview #stage{padding:12px;margin-block:16px 22px}}
  `;
  document.head.append(previewStyle);

  // Cada opção recorta a mesma célula do atlas nos dois temas.
  function picture(character,row=1,side='front',sheet='base',largePreview=false){
    const box=document.createElement('span');box.className='skin-picture';
    const img=document.createElement('img');img.alt='';img.draggable=false;
    const folder = pixelArt && largePreview ? 'pixel-previa' : artFolder;
    img.src='../public/assets/imagens/aluno/loja/'+folder+'/'+character+(sheet==='collection'?'-colecao':'')+'.png';
    if(pixelArt) img.style.imageRendering='pixelated';
    img.style.setProperty('height',(sheet==='collection'?400:300)+'%','important');
    img.style.left=side==='back'?'-100%':'0%';img.style.top=(-row*100)+'%';
    img.onerror=()=>{$('error').textContent='Uma imagem da loja não carregou. Confira se a pasta public foi copiada e atualize com Ctrl+F5.';};
    box.append(img);return box;
  }
  function change(next){
    if(same(next,draft))return;
    past.push(copy(draft));if(past.length>40)past.shift();future=[];draft=next;pending=null;
    $('error').textContent='';render();
  }
  function render(){
    const focusCharacter=document.activeElement?.dataset?.character;
    const focusSkin=document.activeElement?.dataset?.skin;
    $('characters').replaceChildren();
    for(const c of characters){
      const b=document.createElement('button');b.type='button';b.className='character';b.dataset.character=c.id;
      b.setAttribute('aria-label','Escolher personagem '+c.name);b.setAttribute('aria-pressed',String(draft.character===c.id));
      const art=picture(c.id,1);art.classList.add('character-art');
      const name=document.createElement('strong');name.textContent=c.name;b.append(art,name);
      b.onclick=()=>{view='front';change({character:c.id,skin:c.id+'-orion'});say(c.name+' escolhido. Selecione uma skin completa.');};
      $('characters').append(b);
    }
    const character=draft.character||characters[0].id;
    const catalogueScroll=$('catalogue').dataset.character===character?$('catalogue').scrollTop:0;
    $('catalogue').dataset.character=character;
    $('catalogue').replaceChildren();
    for(const item of skins.filter(s=>s.character===character)){
      const owned=account.owned.includes(item.id),shortfall=Math.max(0,item.price-account.coins),unaffordable=!owned&&shortfall>0,b=document.createElement('button');
      b.type='button';b.className='item skin-card'+(unaffordable?' unaffordable':'');b.dataset.skin=item.id;b.disabled=!draft.character;
      b.setAttribute('aria-pressed',String(draft.skin===item.id));
      b.setAttribute('aria-label',item.name+'. Visual completo. '+(owned?'Disponível no inventário.':item.price+' astromoedas. '+(unaffordable?'Saldo insuficiente. Faltam '+shortfall+' astromoedas. ':'')+'Experimentar.'));
      const image=picture(character,item.row,'front',item.sheet);image.classList.add('skin-art');
      const name=document.createElement('strong');name.textContent=item.name;
      const detail=document.createElement('span');detail.className='skin-description';detail.textContent=item.description;
      const meta=document.createElement('small');meta.textContent=owned?(item.price===0?'Gratuita · Você já tem':'✓ No seu inventário'):'✦ '+item.price+' astromoedas';
      b.append(image,name,detail,meta);
      if(unaffordable){const hint=document.createElement('span');hint.className='skin-shortfall';hint.textContent='Faltam '+shortfall+' astromoedas';b.append(hint);}
      b.onclick=()=>{change({character,skin:item.id});say(item.name+' em prévia. O conjunto inteiro acompanha a skin.');};
      $('catalogue').append(b);
    }
    $('catalogue').scrollTop=catalogueScroll;
    const chosen=skin(draft.skin),person=characters.find(c=>c.id===draft.character);
    const unpaid=chosen&&!account.owned.includes(chosen.id);
    $('balance').textContent=account.coins;
    $('avatar').hidden=!person;$('stageEmpty').hidden=!!person;
    $('front').disabled=$('back').disabled=!person;
    $('front').setAttribute('aria-pressed',String(view==='front'));$('back').setAttribute('aria-pressed',String(view==='back'));
    $('undo').disabled=!past.length;$('redo').disabled=!future.length;
    $('save').disabled=!chosen;$('save').textContent=unpaid?'Resgatar skin':'Salvar skin';
    $('completion').textContent=chosen?'Skin completa':'Escolha uma skin';
    $('stepCharacter').className=person?'done':'current';$('stepSkin').className=person?'current':'';
    $('characterName').textContent=person?person.name:'Escolha um mascote';
    $('wardrobeTitle').textContent=person?'Skins de '+person.name:'Escolha uma skin completa';
    $('partHint').textContent=person?'Cada skin inclui o visual inteiro. As apagadas custam mais que seu saldo, mas você pode experimentar todas.':'Escolha um personagem para ver e experimentar suas skins.';
    $('previewHint').textContent=!chosen?'Selecione um personagem para começar.':unpaid?chosen.name+' · '+chosen.price+' astromoedas pelo conjunto completo.'+(chosen.price>account.coins?' Faltam '+(chosen.price-account.coins)+' astromoedas.':''):chosen.name+' · Disponível para usar.';
    if(chosen){
      $('avatar').replaceChildren(picture(character,chosen.row,view,chosen.sheet,true));
      $('avatar').setAttribute('aria-label',person.name+' com '+chosen.name+', vista '+(view==='front'?'de frente':'de costas')+'.');
    }
    if(focusCharacter)$('characters').querySelector('[data-character="'+focusCharacter+'"]')?.focus();
    if(focusSkin)$('catalogue').querySelector('[data-skin="'+focusSkin+'"]')?.focus();
  }
  function open(id){origin=document.activeElement;$(id).showModal();}
  function close(dialog){dialog.close();if(origin?.isConnected)origin.focus();}
  for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>close(b.closest('dialog'));
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('cancel',()=>{if(origin?.isConnected)origin.focus();});
  function save(){
    const chosen=skin(draft.skin);if(!chosen||chosen.character!==draft.character)return;
    if(!account.owned.includes(chosen.id)){
      pending=copy(draft);$('redeemText').textContent=chosen.name+': '+chosen.price+' astromoedas pelo visual completo. Saldo após o resgate: '+Math.max(0,account.coins-chosen.price)+'.';
      $('redeemError').textContent=chosen.price>account.coins?'Saldo demonstrativo insuficiente. Você pode continuar usando a skin gratuita.':'';
      $('confirmRedeem').disabled=chosen.price>account.coins;open('redeemDialog');return;
    }
    const next={...account,saved:copy(draft)};if(persist(next)){account=next;say('Skin completa salva neste navegador!');render();}
  }
  $('save').onclick=save;
  $('confirmRedeem').onclick=()=>{
    const chosen=skin(pending?.skin);if(!chosen||!same(pending,draft)||chosen.character!==draft.character)return;
    const cost=account.owned.includes(chosen.id)?0:chosen.price;if(cost>account.coins)return;
    const next={coins:account.coins-cost,owned:[...new Set([...account.owned,chosen.id])],saved:copy(draft)};
    if(!persist(next)){$('redeemError').textContent='Não foi possível salvar. Nenhuma astromoeda foi descontada.';return;}
    account=next;pending=null;close($('redeemDialog'));say('Skin completa resgatada e salva neste navegador.');render();
  };
  $('cancel').onclick=()=>{if(same(draft,account.saved))say('Sua skin salva foi mantida.');else open('cancelDialog');};
  $('confirmCancel').onclick=()=>{draft=copy(account.saved);past=[];future=[];pending=null;close($('cancelDialog'));render();say('Mudanças descartadas. Sua skin anterior foi restaurada.');};
  $('undo').onclick=()=>{if(!past.length)return;future.push(copy(draft));draft=past.pop();pending=null;render();};
  $('redo').onclick=()=>{if(!future.length)return;past.push(copy(draft));draft=future.pop();pending=null;render();};
  $('front').onclick=()=>{view='front';render();};$('back').onclick=()=>{view='back';render();};
  const media=matchMedia('(prefers-reduced-motion:reduce)');let pause=media.matches;
  function motion(){const forced=media.matches||document.body.classList.contains('astro-motion-off');document.body.classList.toggle('motion-paused',pause||forced);$('motion').disabled=forced;$('motion').setAttribute('aria-pressed',String(pause||forced));$('motion').textContent=forced?'Movimento reduzido':pause?'Retomar animações':'Pausar animações';}
  $('motion').onclick=()=>{pause=!pause;motion();};media.addEventListener?.('change',motion);document.addEventListener('astrolearn:preferences',motion);
  function help(){$('infoTitle').textContent='Escolha sua skin';$('infoText').textContent='Escolha um dos quatro ETs e clique na imagem de uma skin completa. Confira de frente e de costas. A skin inclui tudo que aparece na imagem. As skins apagadas custam mais que seu saldo; você pode experimentar e conferir quanto falta. O resgate usa astromoedas demonstrativas; saldo e visual ficam neste navegador.';open('info');}
  $('about').onclick=help;$('helper').onclick=help;
  motion();render();if(storageIssue)$('error').textContent='Não foi possível ler o visual anterior. Nenhum dado foi sobrescrito.';
})();
