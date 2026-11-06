// Contrato de multipart confirmado em app.py: um arquivo no campo anexo.
export function prepararMaterial(dados, arquivo) {
  if (!arquivo) return dados;
  if (!/\.(pdf|png|jpe?g)$/i.test(arquivo.name)) throw new Error('Use PDF, PNG, JPG ou JPEG.');
  if (!arquivo.size) throw new Error('O arquivo selecionado está vazio.');
  if (arquivo.size > 20 * 1024 * 1024) throw new Error('O arquivo deve ter no máximo 20 MB.');
  const form = new FormData();
  form.set('titulo', dados.titulo); form.set('descricao', dados.descricao || '');
  form.set('missao_id', dados.missao_id || '');form.set('links', JSON.stringify(dados.links || []));
  form.set('anexo', arquivo, arquivo.name);return form;
}
