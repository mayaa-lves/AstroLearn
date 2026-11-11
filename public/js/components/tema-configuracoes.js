const form = document.getElementById('preferencesForm');
if (form) {
  const group = document.createElement('fieldset');
  group.className = 'astro-tema-config';
  const title = document.createElement('legend');
  title.textContent = 'Tema';
  const options = document.createElement('div');
  options.className = 'astro-tema-opcoes';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.hidden = true;
  const active = document.documentElement.dataset.astroTema || 'realista';

  for (const [theme, label] of [['realista', 'Realista'], ['pixel', 'Pixel Art']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(theme === active));
    button.addEventListener('click', () => {
      if (theme === active) return;
      try {
        localStorage.setItem('astrolearn:tema-aluno', theme);
      } catch {
        status.hidden = false;
        status.textContent = 'O navegador não permitiu salvar o tema.';
        return;
      }
      location.reload();
    });
    options.append(button);
  }
  group.append(title, options, status);
  form.before(group);
}
