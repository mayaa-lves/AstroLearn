import {api} from './conexao.js';
export const ids=['lilas-astronauta','verde-cientista','azul-artista','turquesa-leitor','lilas-engenheiro','verde-astronauta','azul-explorador','turquesa-astronauta'];
export async function lerET(){const perfil=await api('/api/perfil');return ids.indexOf(perfil.avatar_id)}
export async function salvarET(i){const avatar_id=ids[i];if(!avatar_id)throw Error('ET inválido');const data=await api('/api/perfil/avatar','PATCH',{avatar_id});if(data.avatar_id!==avatar_id)throw Error('A escolha não foi confirmada.')}
