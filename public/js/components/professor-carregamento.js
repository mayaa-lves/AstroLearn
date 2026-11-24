/* Hide the assembling page until styles, fonts and the initial data have settled. */
(() => {
  const layer=document.createElement('div');layer.id='teacherLoader';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
  const logo=document.createElement('img');logo.src='../public/assets/imagens/marca/astrolearn-simbolo.png';logo.alt='AstroLearn';
  const orbit=document.createElement('span');orbit.className='loader-orbit';orbit.setAttribute('aria-hidden','true');
  const message=document.createElement('span');message.textContent=document.body.dataset.page==='room'?'Carregando sua turma…':'Preparando sua estação…';
  layer.append(logo,orbit,message);document.body.append(layer);
  let done=false,finishing=false;
  let scenery=Promise.resolve();
  if(document.body.dataset.page==='room'){
    const image=new Image();image.src='../public/assets/imagens/professor/sala-amanhecer.png';
    scenery=Promise.race([image.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,6000))]);
  }
  const observer=new MutationObserver(check);
  const timeout=setTimeout(()=>{
    if(done)return;orbit.hidden=true;message.textContent='O carregamento está demorando mais que o esperado.';
    const retry=document.createElement('button');retry.type='button';retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();
    const show=document.createElement('button');show.type='button';show.textContent='Ver página';show.onclick=()=>finish();layer.append(retry,show);
  },30000);
  function finish(){if(done)return;done=true;clearTimeout(timeout);observer.disconnect();document.documentElement.classList.remove('astro-teacher-loading');layer.remove();}
  async function check(){
    if(done||finishing||document.readyState==='loading')return;
    const content=document.getElementById('content')||document.getElementById('materialList')||document.getElementById('materialForm');
    if(content?.getAttribute('aria-busy')==='true')return;
    finishing=true;
    await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].filter(link=>!link.sheet).map(link=>new Promise(resolve=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',resolve,{once:true});setTimeout(resolve,4000);})));
    if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,4000))]);
    await scenery;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{finishing=false;if(content?.getAttribute('aria-busy')!=='true')finish();}));
  }
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-busy']});
  document.addEventListener('DOMContentLoaded',check,{once:true});window.addEventListener('load',check,{once:true});check();
  window.addEventListener('pageshow',event=>{if(event.persisted)finish();});
})();
