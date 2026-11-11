"""Conecta o CSS de rolagem às páginas existentes do AstroLearn."""

import os
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CSS = ROOT / "public/css/rolagem.css"
CHAT = ROOT / "public/js/components/assistente-flutuante.js"
MARKER = b"data-astro-rolagem"
HEAD_END = re.compile(rb"(?im)^([ \t]*)</head\s*>")
CHAT_STYLE = re.compile(rb"root\.innerHTML\s*=\s*`<style>")
CHAT_IMPORT = b'@import url("${new URL(\'../../css/rolagem.css\',base).href}");'


def paginas():
    yield ROOT / "index.html"
    for area in ("aluno", "professor", "auth", "public/jogos"):
        yield from sorted((ROOT / area).rglob("*.html"))


def main():
    if not all(path.is_file() for path in (ROOT / "index.html", CSS, CHAT)):
        raise SystemExit("Extraia o ZIP na raiz do AstroLearn e execute novamente.")

    alteracoes = {}
    total = 0
    for pagina in paginas():
        if not pagina.resolve().is_relative_to(ROOT):
            raise SystemExit(f"Página fora da pasta do projeto: {pagina}")
        total += 1
        original = pagina.read_bytes()
        if MARKER in original:
            continue
        head = HEAD_END.search(original)
        if head is None:
            head = re.search(rb"(?i)</head\s*>", original)
        if head is None:
            raise SystemExit(f"Cabeçalho HTML não encontrado em {pagina.relative_to(ROOT)}.")
        caminho = os.path.relpath(CSS, pagina.parent).replace(os.sep, "/")
        nova_linha = b"\r\n" if b"\r\n" in original else b"\n"
        link = f'  <link rel="stylesheet" href="{caminho}" data-astro-rolagem>'.encode()
        alteracoes[pagina] = original[:head.start()] + nova_linha + link + nova_linha + original[head.start():]

    original = CHAT.read_bytes()
    if CHAT_IMPORT not in original:
        estilo = CHAT_STYLE.search(original)
        if estilo is None:
            raise SystemExit("Formato do componente do chat diferente do esperado.")
        nova_linha = b"\r\n" if b"\r\n" in original else b"\n"
        ponto = estilo.end()
        alteracoes[CHAT] = original[:ponto] + nova_linha + CHAT_IMPORT + original[ponto:]

    for caminho, conteudo in alteracoes.items():
        caminho.write_bytes(conteudo)
    print(f"Rolagem aplicada. {total} páginas verificadas e {len(alteracoes)} arquivos atualizados.")


if __name__ == "__main__":
    main()
