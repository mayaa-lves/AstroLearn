import {api} from './conexao.js';

// Remove a demonstração temporária; a permissão deve vir da turma no servidor.
try {
  sessionStorage.removeItem('astrolearn-jogos-demo-yan-v1');
  const url = new URL(location.href);
  if (url.searchParams.get('demo') === 'yan') {
    url.searchParams.delete('demo');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
} catch { /* O armazenamento não é necessário para consultar o servidor. */ }

export async function consultarAcessoJogos() {
  try {
    // Sala obtida pela matrícula, sem confiar em um ID na URL do aluno.
    const data = await api('/api/aluno/dashboard');
    if (data?.tem_sala === false) {
      return {integrado: true, liberado: false, mensagem: 'Entre em uma turma para que seu professor possa liberar os jogos.'};
    }
    const sala = data?.sala;
    if (data?.tem_sala !== true || !sala?.id || typeof sala.jogos_bloqueados !== 'boolean') {
      return {
        integrado: false, liberado: false, erro: true, pendente: true,
        mensagem: 'A consulta da turma ainda não informa a permissão dos jogos. Aguarde a atualização do servidor ou tente novamente.',
      };
    }
    return {
      integrado: true, liberado: !sala.jogos_bloqueados, sala_id: sala.id,
      mensagem: sala.jogos_bloqueados
        ? 'Seu professor pausou os jogos desta turma. Continue sua trilha de atividades.'
        : 'Jogos liberados pelo professor.',
    };
  } catch (error) {
    return {integrado: false, liberado: false, erro: true, mensagem: error.message || 'Não foi possível consultar o acesso. Tente novamente.'};
  }
}

export function acompanharAcessoJogos(onChange) {
  let busy = false, disposed = false, last = 0;
  async function refresh() {
    if (busy || disposed) return;
    busy = true;
    try {
      const state = await consultarAcessoJogos();
      last = Date.now();
      if (!disposed) {
        onChange(state);
        document.dispatchEvent(new CustomEvent('astrolearn:games-access', {detail: state}));
      }
    } finally { busy = false; }
  }
  const visible = () => { if (!document.hidden && Date.now() - last > 5000) refresh(); };
  const shown = event => { if (event.persisted) refresh(); };
  const leave = event => { if (!event.persisted) dispose(); };
  const timer = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  function dispose() {
    disposed = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', visible);
    window.removeEventListener('focus', visible);
    document.removeEventListener('astrolearn:refresh-games-access', refresh);
    window.removeEventListener('pagehide', leave);
    window.removeEventListener('pageshow', shown);
  }
  document.addEventListener('visibilitychange', visible);
  window.addEventListener('focus', visible);
  document.addEventListener('astrolearn:refresh-games-access', refresh);
  window.addEventListener('pagehide', leave);
  window.addEventListener('pageshow', shown);
  refresh();
  return dispose;
}
