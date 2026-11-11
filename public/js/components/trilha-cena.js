/* Coordenadas em pixels CSS, compartilhadas pelo desenho e pela máscara de fundo. */
export function molduraSaturno(width, pixel = document.documentElement.dataset.astroTema === 'pixel') {
  const w = width < 801 ? 440 : 680;
  if (pixel || width < 801) return { x: width - w*.76, y: width < 801 ? -45 : -38, w, h: w*.63 };
  return { x: width - w*.83, y: -58, w, h: w*.63 };
}

export function molduraDaMissao(rect, extent = 1.18) {
  const diameter = rect.width*.92;
  const w = diameter*extent;
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height*.1 + diameter/2;
  return { x: centerX-w/2, y: centerY-w/2, w, h: w };
}

export function recortarObjetosDoCeu(ctx, width, height, ready) {
  const saturno = molduraSaturno(width);
  const radius = ready ? saturno.w/4.8 : Math.max(180, Math.min(width*.18,285))/2;
  const x = ready ? saturno.x+saturno.w/2 : width*.97-radius;
  const y = ready ? saturno.y+saturno.h/2 : 35+radius;
  ctx.beginPath();
  ctx.rect(0,0,width,height);
  ctx.moveTo(x+radius,y);
  ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.clip('evenodd');
}
