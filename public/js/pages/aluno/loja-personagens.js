/* Arte da oficina: cada quadro é alinhado pelos mesmos marcos anatômicos. */
((root) => {
  'use strict';
  // [eixo X, pescoço, cintura, pés], medidos por quadro de 512×512.
  const anchors = {
    explorador: [[256,223,328,498],[256,217,328,498],[256,227,328,498],[256,217,328,498],[256,227,328,498],[256,217,328,498]],
    turquesa: [[256,245,370,498],[256,242,370,498],[256,245,370,498],[256,243,370,498],[256,245,370,498],[256,243,370,498]],
    lilas: [[256,209,330,499],[256,208,330,499],[256,211,330,499],[256,209,329,499],[256,211,330,499],[256,209,329,499]],
    'tres-olhos': [[256,211,320,498],[256,210,320,498],[256,210,320,498],[256,209,320,498],[256,212,320,498],[256,210,320,498]],
  };
  const targets = {explorador:[227,328,498],turquesa:[245,370,498],lilas:[211,330,499],'tres-olhos':[210,320,498]};
  const arms = {explorador:[184,328,380],turquesa:[186,326,370],lilas:[178,334,382],'tres-olhos':[180,332,375]};
  const cache = new Map();
  function load(id) {
    if (!anchors[id]) return Promise.reject(new Error('Personagem inválido'));
    if (!cache.has(id)) {
      const image = new Image();
      image.src = `../public/assets/imagens/aluno/loja/realistas/${id}.png`;
      cache.set(id, image.decode().then(() => image));
    }
    return cache.get(id);
  }
  function draw(ctx, image, id, row, side, part = 'full') {
    if (!anchors[id] || !Number.isInteger(row) || row < 0 || row > 2) return;
    const column = side === 'back' ? 1 : 0;
    const [cx,neck,waist,feet] = anchors[id][row * 2 + column];
    const [toNeck,toWaist,toFeet] = targets[id];
    const cellW = image.width / 2, cellH = image.height / 3;
    const sourceX = column * cellW, sourceY = row * cellH;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const strip = (from, to, destY, destH) => {
      ctx.drawImage(image, sourceX, sourceY + from / 512 * cellH,
        cellW, (to - from) / 512 * cellH, 256 - cx, destY, 512, destH);
    };
    // Um único eixo horizontal. Os cortes de cada roupa usam marcos próprios,
    // e chegam exatamente ao mesmo pescoço, cintura e linha dos pés na prévia.
    if (part === 'head' || part === 'full') strip(0, neck, 0, toNeck);
    const [left,right,handBottom] = arms[id];
    if (part === 'top' || part === 'full') {
      strip(neck, waist, toNeck-4, toWaist-toNeck+4);
      // As mangas e mãos abaixo da cintura pertencem à jaqueta, não à calça.
      if (handBottom > toWaist) {
        ctx.save(); ctx.beginPath();
        ctx.rect(0,toWaist,left,handBottom-toWaist);
        ctx.rect(right,toWaist,512-right,handBottom-toWaist);
        ctx.clip(); strip(waist,feet,toWaist,toFeet-toWaist); ctx.restore();
      }
    }
    if (part === 'legs' || part === 'full') {
      ctx.save(); ctx.beginPath();
      if (handBottom > toWaist) ctx.rect(left,toWaist,right-left,handBottom-toWaist);
      ctx.rect(0,Math.max(handBottom,toWaist),512,toFeet-Math.max(handBottom,toWaist));
      ctx.clip(); strip(waist,feet,toWaist,toFeet-toWaist); ctx.restore();
    }
  }
  function catalogue(ctx, image, id, row, part) {
    const buffer = document.createElement('canvas');
    buffer.width = buffer.height = 512;
    const paint = buffer.getContext('2d');
    if (!paint) return;
    draw(paint, image, id, row, 'front', 'full');
    const [neck,waist,feet] = targets[id];
    const crops = {top:[80,neck-3,352,waist-neck+6],legs:[110,waist-2,292,feet-waist+5],hat:[55,0,402,neck]};
    const [x,y,w,h] = crops[part];
    ctx.clearRect(0,0,512,320);
    const scale = Math.min(472 / w, 280 / h), dw = w * scale, dh = h * scale;
    ctx.drawImage(buffer,x,y,w,h,(512-dw)/2,(320-dh)/2,dw,dh);
  }
  async function frame(el, id, row = 0, side = 'front', part = 'full', thumbnail = false) {
    const token = [id,row,side,part,thumbnail].join(':');
    el.dataset.renderKey = token;
    el.dataset.character = id; el.dataset.side = side; el.dataset.row = String(row);
    el.classList.add('realistic-frame');
    const image = await load(id);
    if (el.dataset.renderKey !== token) return;
    const canvas = el.querySelector('canvas') || document.createElement('canvas');
    canvas.width = 512; canvas.height = thumbnail ? 320 : 512;
    canvas.setAttribute('aria-hidden','true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (thumbnail) catalogue(ctx,image,id,row,part);
    else draw(ctx,image,id,row,side,part);
    el.replaceChildren(canvas);
  }
  root.AstroLojaArte = { frame, draw, load, anchors, targets };
})(globalThis);
