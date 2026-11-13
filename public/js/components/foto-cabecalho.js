import { ids, lerET } from '../services/avatar-conta.js';

// A mesma escolha do Perfil para cabeçalho comum, Trilha e Atividade.
export function iniciarFotoCabecalho(usuario) {
  if (!usuario || usuario.role !== 'aluno') return;
  const selector = '#astroAccountButton, #astroAccountPanel .account-avatar, #profileInitial, #accountInitial, #activityAccountInitial, #activityProfileInitial';
  const sheet = new URL((globalThis.astroArte || (url => url))('../../assets/avatares/ets-perfil.png'), import.meta.url).href;
  const image = new Image();
  image.src = sheet;
  const ready = image.decode().then(() => true, () => false);
  let revision = 0;
  const style = document.createElement('style');
  style.textContent = `
    [data-astro-profile-photo] { color: transparent !important; text-shadow: none !important; }
    #activityAccountInitial[data-astro-profile-photo] { display: block; width: 100%; height: 100%; border-radius: inherit; }
    html[data-astro-tema="pixel"] [data-astro-profile-photo] { image-rendering: pixelated; }
  `;
  document.head.append(style);

  async function mostrar(indice, ticket) {
    const valid = Number.isInteger(indice) && indice >= 0 && indice < ids.length;
    if (valid && !await ready) return;
    if (ticket !== revision) return;
    for (const node of document.querySelectorAll(selector)) {
      if (valid) {
        node.dataset.astroProfilePhoto = ids[indice];
        node.style.setProperty('background-image', `url("${sheet}")`, 'important');
        node.style.setProperty('background-position', `${indice % 4 * 100 / 3}% ${indice < 4 ? 0 : 100}%`, 'important');
        node.style.setProperty('background-size', '400% 200%', 'important');
        node.style.setProperty('background-repeat', 'no-repeat', 'important');
        node.style.setProperty('border-radius', '50%');
      } else {
        delete node.dataset.astroProfilePhoto;
        for (const prop of ['background-image', 'background-position', 'background-size', 'background-repeat']) node.style.removeProperty(prop);
        node.textContent = (usuario.nome || 'Aluno').trim().charAt(0).toUpperCase();
      }
    }
  }
  async function atualizar() {
    const ticket = ++revision;
    try { await mostrar(await lerET(), ticket); }
    catch { /* Falha de rede preserva a última foto confirmada. */ }
  }
  window.addEventListener('astrolearn:avatar-changed', event => {
    if (event.detail?.userId != null && event.detail.userId !== usuario.id) return;
    mostrar(ids.indexOf(event.detail?.avatar_id), ++revision);
  });
  window.addEventListener('pageshow', event => { if (event.persisted) atualizar(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) atualizar(); });
  atualizar();
}
