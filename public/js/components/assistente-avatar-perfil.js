import {ids, lerET} from '../services/avatar-conta.js';

const names = ['Lilás astronauta','Verde cientista','Azul artista','Turquesa leitor',
  'Lilás engenheiro','Verde astronauta','Azul explorador','Turquesa astronauta'];

export function vincularAvatarPerfil(companion) {
  let selected = null, revision = 0, paused = false, disposed = false;
  const loaded = new Map();
  function preload(url) {
    if (!loaded.has(url)) {
      const promise = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(url);
        image.onerror = () => reject(new Error('Arte indisponível'));
        image.src = url;
      }).catch(error => {loaded.delete(url);throw error;});
      loaded.set(url, promise);
    }
    return loaded.get(url);
  }
  async function render() {
    if (disposed || paused || !ids.includes(selected)) return;
    const version = ++revision, id = selected;
    const url = new URL(`../../assets/imagens/aluno/assistente/perfil/${id}.png`, import.meta.url).href;
    try {
      await preload(url);
      if (disposed || paused || version !== revision) return;
      companion.setPortrait({url, pixel:document.documentElement.dataset.astroTema === 'pixel', name:names[ids.indexOf(id)]});
    } catch { /* A arte atual permanece visível se o arquivo não carregar. */ }
  }
  async function refresh() {
    const version = revision;
    try {
      const index = await lerET();
      if (disposed || paused || version !== revision || !ids[index]) return;
      selected = ids[index];
      render();
    } catch { /* Não interfere na conexão do chat nem troca a escolha salva. */ }
  }
  const changed = event => {
    const id = event.detail?.avatar_id;
    if (!ids.includes(id)) return;
    selected = id;
    render();
  };
  const theme = new MutationObserver(render);
  theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-astro-tema']});
  window.addEventListener('astrolearn:avatar-changed',changed);
  const focus = () => {if (!paused) refresh();};
  window.addEventListener('focus',focus);
  refresh();
  return {
    pause(){paused=true;++revision;},
    resume(){paused=false;render();refresh();},
    dispose(){disposed=true;++revision;theme.disconnect();window.removeEventListener('astrolearn:avatar-changed',changed);window.removeEventListener('focus',focus);}
  };
}
