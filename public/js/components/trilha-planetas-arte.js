if (document.documentElement.dataset.astroTema === 'pixel') {
  const atlas = new Image();
  atlas.src = new URL('../../assets/imagens/aluno/inicial/trilha-revisada/planetas-pixel.png', import.meta.url).href;
  atlas.decode().then(() => {
    document.body.classList.add('trilha-sprites-prontos');
    document.dispatchEvent(new Event('astrolearn:motion'));
  }).catch(() => {
    // O renderizador anterior cobre falha de carregamento da nova arte.
  });
}

if (document.documentElement.dataset.astroTema === 'pixel') {
 const planet = new Image();
 planet.className = 'saturno-pixel-rpg'; planet.alt = ''; planet.setAttribute('aria-hidden','true');
 planet.src = new URL('../../assets/imagens/aluno/inicial/trilha-revisada/saturno-rpg.png', import.meta.url).href;
 planet.decode().then(() => {
  document.body.prepend(planet);
  document.body.classList.add('saturno-pixel-pronto');
  document.dispatchEvent(new Event('astrolearn:motion'));
 }).catch(() => {});
}
