import { sessaoObrigatoria } from '../../services/conexao.js';
import { biblioteca } from '../../services/aluno.js';

const session = sessaoObrigatoria('aluno');
const $ = id => document.getElementById(id);

const storageKey =
  'astrolearn-biblioteca-favoritos-v1:' + session.usuario.id;

let materials = [];
let favorites = new Set();
let onlyFavorites = false;
let loading = false;
let selected = null;
let readerOpener = null;
let toastTimer;

try {
  const saved = JSON.parse(
    localStorage.getItem(storageKey) || '[]'
  );

  if (Array.isArray(saved)) {
    favorites = new Set(
      saved.filter(id => typeof id === 'string')
    );
  }
} catch {
  $('storageNotice').textContent =
    'Não foi possível recuperar os favoritos deste navegador.';
}

function element(tag, text = '', className = '') {
  const node = document.createElement(tag);

  node.textContent = text;
  node.className = className;

  return node;
}

function resources(material) {
  const list = [...(Array.isArray(material.links) ? material.links : [])];
  if (material.anexo_url) list.unshift({ url: material.anexo_url, titulo: material.anexo_nome || "Abrir anexo" });

  return list.flatMap(raw => {
    try {
      const url = new URL(
        typeof raw === 'string' ? raw : raw?.url
      );

      if (
        !['https:', 'http:'].includes(url.protocol) ||
        url.username ||
        url.password
      ) {
        return [];
      }

      return [{
        url: url.href,
        title:
          typeof raw === 'object'
            ? String(raw?.titulo || 'Abrir recurso')
            : 'Abrir recurso'
      }];
    } catch {
      return [];
    }
  });
}

function coverIndex(material) {
  const text =
    `${material.titulo || ''} ${material.descricao || ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  if (/robot|program|circuit|arduino|tecnolog/.test(text)) {
    return 1;
  }

  if (/espac|solar|planet|univers|astro|lua|orbita/.test(text)) {
    return 0;
  }

  if (/diario|pesquisa|ciencia|descobert|anotac/.test(text)) {
    return 2;
  }

  return Math.max(0, materials.indexOf(material)) % 3;
}

function materialFormat(material) {
  const links = resources(material);

  if (!links.length) return 'LEITURA';

  return links.some(link => /\.pdf(?:[?#]|$)/i.test(link.url))
    ? 'PDF / LINK'
    : 'LINK';
}

function updateReaderFavorite() {
  if (!selected) return;

  const saved = favorites.has(selected.id);

  $('saveInReader').setAttribute(
    'aria-pressed',
    String(saved)
  );

  $('saveInReader').textContent = saved
    ? 'Remover dos favoritos'
    : 'Salvar nos favoritos';
}

function toggleFavorite(id) {
  favorites.has(id)
    ? favorites.delete(id)
    : favorites.add(id);

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify([...favorites])
    );

    $('storageNotice').textContent = '';
  } catch {
    $('storageNotice').textContent =
      'O favorito ficará disponível só nesta página: o navegador não permitiu salvá-lo.';
  }

  render();
  updateReaderFavorite();

  clearTimeout(toastTimer);

  $('favoriteToast').textContent = favorites.has(id)
    ? 'Material salvo nos favoritos.'
    : 'Material removido dos favoritos.';

  $('favoriteToast').hidden = false;

  toastTimer = setTimeout(() => {
    $('favoriteToast').hidden = true;
  }, 2600);
}

function openReader(material, opener) {
  selected = material;
  readerOpener = opener;

  $('readerTitle').textContent =
    material.titulo || 'Material da turma';

  $('readerDescription').textContent =
    material.descricao ||
    'Material compartilhado pelo professor.';

  $('readerMission').textContent = material.missoes?.titulo
    ? 'Atividade: ' + material.missoes.titulo
    : 'Biblioteca geral da turma';

  $('readerLinks').replaceChildren();

  const links = resources(material);

  links.forEach((resource, index) => {
    const title =
      resource.title +
      (links.length > 1 ? ` ${index + 1}` : '') +
      ' ↗';

    const link = element('a', title, 'primary');

    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    $('readerLinks').append(link);
  });

  if (!links.length) {
    $('readerLinks').append(
      element(
        'p',
        'Este material não possui links ou arquivos anexados.',
        'hint'
      )
    );
  }

  $('readerLinkHint').hidden = !links.length;

  updateReaderFavorite();

  $('reader').showModal();
  $('closeReader').focus();
}

function render() {
  const term = $('search').value
    .trim()
    .toLocaleLowerCase('pt-BR');

  const filtered = materials.filter(material => {
    const text =
      `${material.titulo || ''} ${material.descricao || ''}`
        .toLocaleLowerCase('pt-BR');

    return (
      (!onlyFavorites || favorites.has(material.id)) &&
      text.includes(term)
    );
  });

  $('materials').replaceChildren();

  for (const material of filtered) {
    const card = element('article', '', 'material');

    const visual = element(
      'div',
      '',
      'material-visual thumb-' + coverIndex(material)
    );

    visual.setAttribute('aria-hidden', 'true');

    const bookmark = element('button', '', 'bookmark');

    bookmark.type = 'button';
    bookmark.dataset.id = material.id;

    bookmark.setAttribute(
      'aria-label',
      'Favoritar: ' + (material.titulo || 'Material')
    );

    bookmark.setAttribute(
      'aria-pressed',
      String(favorites.has(material.id))
    );

    bookmark.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12v18l-6-4-6 4z"/>
      </svg>
    `;

    bookmark.onclick = () => {
      toggleFavorite(material.id);

      const replacement = [
        ...$('materials').querySelectorAll('.bookmark')
      ].find(button => button.dataset.id === material.id);

      (replacement || $('favorites')).focus();
    };

    const open = element(
      'button',
      'Abrir material →',
      'primary'
    );

    open.type = 'button';
    open.onclick = () => openReader(material, open);

    card.append(
      visual,
      bookmark,
      element(
        'h3',
        material.titulo || 'Material da turma'
      ),
      element(
        'span',
        materialFormat(material),
        'format'
      ),
      element(
        'p',
        material.descricao ||
          'Material compartilhado pelo professor.',
        'material-description'
      ),
      open
    );

    $('materials').append(card);
  }

  $('resultCount').textContent =
    `${filtered.length} ${
      filtered.length === 1 ? 'material' : 'materiais'
    }`;

  $('favoriteCount').textContent = materials.filter(
    material => favorites.has(material.id)
  ).length;

  $('allFilter').setAttribute(
    'aria-pressed',
    String(!onlyFavorites)
  );

  $('favorites').setAttribute(
    'aria-pressed',
    String(onlyFavorites)
  );

  $('clearSearch').hidden = !$('search').value;

  renderSaved();

  $('empty').hidden = filtered.length > 0;

  $('emptyTitle').textContent = onlyFavorites
    ? 'Seus favoritos ficam aqui'
    : 'Nenhum material encontrado';

  $('emptyText').textContent = term
    ? 'Tente buscar outro título ou assunto.'
    : onlyFavorites
      ? 'Use o marcador nos cartões para guardar seus materiais.'
      : 'Seu professor ainda não compartilhou materiais com esta turma.';
}

function renderSaved() {
  const saved = materials.filter(
    material => favorites.has(material.id)
  );

  $('savedList').replaceChildren();
  $('favoritesEmpty').hidden = saved.length > 0;

  for (const material of saved) {
    const button = element('button', '', 'saved-item');

    button.type = 'button';

    const picture = element(
      'span',
      '',
      'saved-thumb thumb-' + coverIndex(material)
    );

    picture.setAttribute('aria-hidden', 'true');

    const text = element('span', '', 'saved-copy');

    text.append(
      element(
        'strong',
        material.titulo || 'Material da turma'
      ),
      element('span', 'Abrir →')
    );

    button.append(picture, text);
    button.onclick = () => openReader(material, button);

    $('savedList').append(button);
  }
}

async function load() {
  if (loading) return;

  loading = true;

  $('refresh').disabled = true;
  $('error').hidden = true;
  $('materials').setAttribute('aria-busy', 'true');

  if (!materials.length) {
    $('resultCount').textContent = 'Carregando materiais…';
  }

  try {
    const data = await biblioteca();

    materials = (
      Array.isArray(data?.materiais)
        ? data.materiais
        : []
    ).filter(
      material =>
        material &&
        typeof material.id === 'string'
    );

    render();
  } catch (error) {
    $('error').textContent =
      error.message ||
      'Não foi possível carregar. Tente atualizar.';

    $('error').hidden = false;

    $('resultCount').textContent = materials.length
      ? 'Exibindo a última lista carregada'
      : 'Falha ao carregar materiais';

    $('empty').hidden = true;
  } finally {
    loading = false;

    $('refresh').disabled = false;
    $('materials').setAttribute('aria-busy', 'false');
  }
}

$('search').addEventListener('input', render);

$('clearSearch').onclick = () => {
  $('search').value = '';

  render();
  $('search').focus();
};

$('allFilter').onclick = () => {
  onlyFavorites = false;
  render();
};

$('favorites').onclick = () => {
  onlyFavorites = true;
  render();
};

$('reset').onclick = () => {
  onlyFavorites = false;
  $('search').value = '';

  render();
  $('search').focus();
};

$('refresh').onclick = load;

$('closeReader').onclick = () => {
  $('reader').close();
};

$('saveInReader').onclick = () => {
  if (selected) {
    toggleFavorite(selected.id);
  }
};

$('reader').addEventListener('close', () => {
  if (
    readerOpener?.isConnected &&
    readerOpener.getClientRects().length
  ) {
    readerOpener.focus();
  } else {
    $('search').focus();
  }
});

$('reader').addEventListener('click', event => {
  if (event.target !== $('reader')) return;

  const rect = $('reader').getBoundingClientRect();

  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    $('reader').close();
  }
});

window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;

  try {
    const saved = JSON.parse(event.newValue || '[]');

    if (Array.isArray(saved)) {
      favorites = new Set(
        saved.filter(id => typeof id === 'string')
      );

      render();
      updateReaderFavorite();
    }
  } catch {
    // Preserva os favoritos atuais se o armazenamento estiver inválido.
  }
});

load();