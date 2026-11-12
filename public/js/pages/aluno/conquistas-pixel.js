// Mantém o botão depois do aviso mesmo quando o texto ocupa várias linhas.
if (document.documentElement.dataset.astroTema === 'pixel') {
  const aviso = document.querySelector('.achievements-page main > .preview-note');
  const telescopio = document.getElementById('openTelescope');

  if (aviso && telescopio) {
    const linha = document.createElement('div');
    linha.className = 'pixel-achievement-actions';
    aviso.before(linha);
    linha.append(aviso, telescopio);
  }
}
