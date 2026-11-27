/* Move a ilustração existente sem recriar canvas, estado ou interações. */
(() => {
 const station=document.getElementById('armillaryStation'),workspace=document.querySelector('.library-workspace');
 if(!station||!workspace)return;
 const anchor=document.createComment('posição original da esfera armilar');station.before(anchor);
 const small=matchMedia('(max-width:800px)');
 const place=()=>{if(small.matches){if(station.nextElementSibling!==workspace)workspace.before(station);}else if(station.previousSibling!==anchor)anchor.after(station);};
 small.addEventListener('change',place);place();
})();
