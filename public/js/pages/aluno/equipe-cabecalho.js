import '../../components/cabecalho-conta.js';
import { ids, lerET } from '../../services/avatar-conta.js';

const retratos = [...document.querySelectorAll('#astroAccountButton, #astroAccountPanel .account-avatar')];
const iniciais = retratos.map(retrato => retrato.textContent);
let revisao = 0;

function mostrarFoto(indice) {
  const temFoto = Number.isInteger(indice) && indice >= 0 && indice < ids.length;
  retratos.forEach((retrato, i) => {
    if (temFoto) {
      retrato.dataset.equipeRetrato = '';
      retrato.style.setProperty('--profile-avatar-position',
        `${indice % 4 * 100 / 3}% ${indice < 4 ? 0 : 100}%`);
      retrato.textContent = '';
    } else {
      delete retrato.dataset.equipeRetrato;
      retrato.style.removeProperty('--profile-avatar-position');
      retrato.textContent = iniciais[i];
    }
  });
}

async function atualizarFoto() {
  const consulta = ++revisao;
  try {
    const indice = await lerET();
    if (consulta === revisao) mostrarFoto(indice);
  } catch {
    // Mantém a última foto confirmada ou a inicial durante falhas de rede.
  }
}

if (retratos.length) {
  atualizarFoto();
  window.addEventListener('astrolearn:avatar-changed', event => {
    revisao++;
    mostrarFoto(ids.indexOf(event.detail?.avatar_id));
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) atualizarFoto();
  });
}
