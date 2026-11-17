const materialStatus = document.getElementById('materialStatus');
if (materialStatus) {
  const filter = document.createElement('details');
  filter.className = 'orbital-filter';
  const trigger = document.createElement('summary');
  trigger.setAttribute('aria-label', 'Filtrar materiais');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>';
  const menu = document.createElement('div');
  menu.className = 'orbital-filter-options';
  for (const option of materialStatus.options) {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = option.textContent;
    choice.onclick = () => {
      if (materialStatus.value !== option.value) {
        materialStatus.value = option.value;
        materialStatus.dispatchEvent(new Event('change'));
      }
      filter.open = false;
      trigger.focus();
    };
    menu.append(choice);
  }
  filter.append(trigger, menu);
  materialStatus.after(filter);
  materialStatus.hidden = true;
  filter.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') filter.open = true;
  });
  filter.addEventListener('pointerleave', () => {
    if (!filter.contains(document.activeElement)) filter.open = false;
  });
  filter.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      filter.open = false;
      trigger.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!filter.contains(event.target)) filter.open = false;
  });
}
const file = document.getElementById('files');
if (file) {
  const zone = file.closest('.orbital-upload');
  file.addEventListener('change', () => {
    document.getElementById('orbitalFileName').textContent =
      file.files[0]?.name || 'Nenhum novo arquivo selecionado';
  });
  zone.addEventListener('dragover', event => event.preventDefault());
  zone.addEventListener('drop', event => {
    event.preventDefault();
    if (event.dataTransfer.files.length !== 1) return;
    file.files = event.dataTransfer.files;
    file.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

const librarySearch = document.querySelector('.library-search');
if (librarySearch) {
  const input = librarySearch.querySelector('input');
  const toggle = librarySearch.querySelector('button');
  toggle.addEventListener('click', () => {
    librarySearch.classList.add('is-open');
    input.focus();
  });
  librarySearch.addEventListener('focusout', event => {
    if (!librarySearch.contains(event.relatedTarget)) librarySearch.classList.remove('is-open');
  });
  input.addEventListener('input', () => librarySearch.classList.toggle('has-value', Boolean(input.value)));
  input.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    librarySearch.classList.remove('is-open');
    toggle.focus();
  });
}
