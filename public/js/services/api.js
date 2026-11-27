import { CONFIG } from '../config.js';
let requestSequence=0;
function avisarCarregamento(phase,id,path,metodo){
  if(typeof window!=='undefined'){
    // A consulta pode começar antes de o script deferido montar o carregador.
    const active=window.__astroLoadingRequests||(window.__astroLoadingRequests=new Map());
    if(phase==='start')active.set(id,{path,metodo});else active.delete(id);
    window.dispatchEvent(new CustomEvent('astrolearn:request',{detail:{phase,id,path,metodo}}));
  }
}

export class ErroAPI extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem);
    this.name = 'ErroAPI';
    this.status = status;
  }
}

export async function solicitar(caminho, {
  metodo = 'GET', dados, token, sinal,
} = {}) {
  const url = new URL(caminho, CONFIG.apiBaseUrl);

  if (!caminho.startsWith('/api/') ||
    url.origin !== new URL(CONFIG.apiBaseUrl).origin ||
    !url.pathname.startsWith('/api/')) {
    throw new ErroAPI('O endereço da API é inválido.');
  }

  metodo = metodo.toUpperCase();

  if (dados !== undefined && ['GET', 'HEAD'].includes(metodo)) {
    throw new ErroAPI('Esta consulta não aceita dados no corpo.');
  }

  const headers = { Accept: 'application/json' };

  if (token) headers.Authorization = `Bearer ${token}`;

  const arquivo = dados instanceof FormData;

  if (dados !== undefined && !arquivo) {
    headers['Content-Type'] = 'application/json';
  }

  const controle = new AbortController();
  const cancelar = () => controle.abort();
  let expirou = false;

  const timer = setTimeout(() => {
    expirou = true;
    controle.abort();
  }, CONFIG.tempoLimiteMs);

  if (sinal?.aborted) cancelar();

  sinal?.addEventListener('abort', cancelar, { once: true });

  const requestId=++requestSequence;
  avisarCarregamento('start',requestId,url.pathname,metodo);
  try {
    const resposta = await fetch(url.href, {
      method: metodo,
      headers,
      signal: controle.signal,
      body: dados === undefined
        ? undefined
        : arquivo
          ? dados
          : JSON.stringify(dados),
    });

    if (resposta.status === 401 && token) {
      // Uma resposta antiga não deve apagar uma sessão nova.
      try {
        const atual = JSON.parse(
          sessionStorage.getItem(CONFIG.chaveSessao)
        );

        if (atual?.token === token) {
          sessionStorage.removeItem(CONFIG.chaveSessao);
        }
      } catch {
        // O erro HTTP continua sendo mostrado.
      }
    }

    if (resposta.status === 413) {
      throw new ErroAPI('O envio ultrapassou o limite da hospedagem. Reduza os arquivos e tente novamente.', 413);
    }

    let resultado;

    try {
      resultado = await resposta.json();
    } catch (erro) {
      if (controle.signal.aborted) throw erro;

      throw new ErroAPI(
        'O servidor retornou uma resposta inválida.',
        resposta.status
      );
    }

    if (!resposta.ok || resultado?.success !== true) {
      throw new ErroAPI(
        typeof resultado?.error === 'string'
          ? resultado.error
          : 'Não foi possível concluir a operação.',
        resposta.status
      );
    }

    return resultado.data;
  } catch (erro) {
    if (erro instanceof ErroAPI) throw erro;

    if (controle.signal.aborted) {
      throw new ErroAPI(
        expirou
          ? 'O servidor demorou para responder. Tente novamente.'
          : 'Operação cancelada.'
      );
    }

    throw new ErroAPI(
      'Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.'
    );
  } finally {
    clearTimeout(timer);
    sinal?.removeEventListener('abort', cancelar);
    avisarCarregamento('end',requestId,url.pathname,metodo);
  }
}
