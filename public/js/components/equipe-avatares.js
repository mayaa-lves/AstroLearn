import {ids} from '../services/avatar-conta.js';

export function normalizarIntegrantes(roster, currentUserId, ownProfile = null) {
  const unique = new Map();
  for (const person of Array.isArray(roster) ? roster : []) {
    if (!person || typeof person.id !== 'string' || !person.id || unique.has(person.id)) continue;
    const ownChoice = person.id === currentUserId && ownProfile && Object.prototype.hasOwnProperty.call(ownProfile, 'avatar_id');
    unique.set(person.id, {
      id: person.id,
      nome: typeof person.nome === 'string' && person.nome.trim() ? person.nome : 'Integrante',
      avatar_id: ownChoice ? ownProfile.avatar_id : person.avatar_id ?? null,
    });
  }
  return [...unique.values()];
}

export function pintarRetrato(node, person, extraClass = '') {
  node.className = 'portrait profile-portrait' + (extraClass ? ' ' + extraClass : '');
  node.setAttribute('aria-hidden', 'true');
  const index = ids.indexOf(person?.avatar_id);
  if (index >= 0) {
    node.dataset.avatarId = ids[index];
    node.style.setProperty('--profile-avatar-position', `${index % 4 * 100 / 3}% ${index < 4 ? 0 : 100}%`);
    node.textContent = '';
  } else {
    // Sem escolha cadastrada, exibe iniciais em vez de atribuir um ET incorreto.
    delete node.dataset.avatarId;
    node.style.removeProperty('--profile-avatar-position');
    const parts = (person?.nome || 'Integrante').trim().split(/\s+/);
    node.textContent = [parts[0]?.[0], parts.length > 1 ? parts.at(-1)?.[0] : ''].join('').toUpperCase();
  }
  return node;
}
