// Mesma pose inicial e duração de rotação na trilha e no banner.
export function movimentoDoMundo(index, elapsed) {
  const family = index % 6;
  const offset = family === 0 ? 2.5 : index * .71;
  return {
    kind: family === 0 ? 0 : 1,
    angle: offset + elapsed * 2 * Math.PI / (48 + (index * 7) % 24),
    clouds: offset - elapsed * 2 * Math.PI / 75,
  };
}
