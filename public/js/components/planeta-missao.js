// O índice é a posição real na mesma lista ordenada usada pela trilha.
export function atualizarPlanetaMissao(planet, index) {
  if (!planet || !Number.isInteger(index) || index < 0) return;
  const family = index % 6;
  planet.dataset.indice = String(index);
  planet.dataset.familia = String(family);
  planet.dataset.world = String(index % 5);
  planet.style.setProperty('--faixa', (family % 3) * 50 + '%');
  planet.style.setProperty('--matiz', (index < 3 ? 0 : index * 137.508 % 360) + 'deg');
  planet.style.setProperty('--tempo', (30 + index % 13) + 's');
  for (const previous of planet.querySelectorAll('[data-mission-decoration]')) previous.remove();
  const add = (className) => {
    const item = document.createElement('span');
    item.className = className;
    item.dataset.missionDecoration = '';
    item.setAttribute('aria-hidden', 'true');
    planet.append(item);
    return item;
  };
  const building = add('activity-world-building');
  if (index === 0) building.classList.add('activity-observatory');
  building.style.setProperty('--building-x', family % 3 * 50 + '%');
  building.style.setProperty('--building-y', family < 3 ? '0%' : '100%');
  add('activity-world-mist');
}
