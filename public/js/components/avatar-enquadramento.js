// Uma escala para toda a coleção: gira sem mudar o tamanho do personagem.
// O centro de cada desenho e a linha dos pés substituem a margem transparente do atlas.
export function medirQuadros(pixels, width, height, columns = 4, rows = 2) {
  const cellWidth = Math.floor(width / columns), cellHeight = Math.floor(height / rows);
  const frames = [];
  for (let index = 0; index < columns * rows; index++) {
    const originX = index % columns * cellWidth, originY = Math.floor(index / columns) * cellHeight;
    let left = cellWidth, top = cellHeight, right = -1, bottom = -1;
    for (let y = 0; y < cellHeight; y++) for (let x = 0; x < cellWidth; x++) {
      if (pixels[((originY + y) * width + originX + x) * 4 + 3] > 64) {
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    if (right < left) { left = 0; top = 0; right = cellWidth - 1; bottom = cellHeight - 1; }
    frames.push({ sx: originX + left, sy: originY + top, sw: right - left + 1, sh: bottom - top + 1 });
  }
  const scale = Math.min(350 / Math.max(...frames.map(f => f.sw)), 472 / Math.max(...frames.map(f => f.sh)));
  return frames.map(frame => ({ ...frame, dx: (384 - frame.sw * scale) / 2,
    dy: 496 - frame.sh * scale, dw: frame.sw * scale, dh: frame.sh * scale }));
}
