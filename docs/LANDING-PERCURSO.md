# Transições e percurso — AstroLearn

A landing conserva identidade, conteúdo institucional, planos provisórios,
logo, imagens e pintura realismo/pixel art da versão anterior.

## Movimento

- Título, apresentação e botões com entradas em sequência.
- Cena de pintura revelada por uma abertura de enquadramento.
- Percurso dos três planetas com uma cena sticky e avanço horizontal
  proporcional à rolagem vertical. Sem wheel preventDefault, sem biblioteca
  externa e sem captura de gestos de rolagem.
- Traçado orbital avança durante o percurso; botões indicam a etapa.
- Sobre: fundo suave se expande da esquerda para a direita.
- Contato: fundo é revelado de baixo para cima.
- Órbitas decorativas respondem ao cursor e ao clique na abertura.
- Mascotes de apoio respondem a hover, foco e clique.

Os mascotes são ilustrações com movimento de composição. Não são modelos
3D articulados e este pacote não acrescenta rastreamento independente de
pupilas, piscadas ou expressões faciais.

## Alternativas acessíveis

Sem JavaScript: percurso vertical e conteúdo presente no HTML.
Com preferência do sistema/rodapé por movimento reduzido: sem fixação ou
translação horizontal. No mobile e em janelas baixas: percurso vertical.
Botões de etapa suportam clique, Tab, Enter, setas, Home e End.
Focar um planeta revela sua etapa; “Continuar a página” sai do percurso.
Pintura mantém alternativas por botões. Dialogs mantêm Escape e foco.

## Arquivos

landing.css e landing.js: apresentação e interações de base.
landing-movimento.css e .js: entradas, órbitas e mascotes de apoio.
landing-percurso.css e .js: percurso e transições diferenciadas de seção.
As folhas são carregadas nessa ordem pelo index.html.

## Validação local

Verificações em navegador Chromium: fixação, translação proporcional,
liberação ao terminar, botões, teclado, diálogos, saída por link,
preferência real do rodapé, preferência do sistema, troca de viewport,
altura reduzida, pintura e abas preservadas, ausência de overflow em
1440, 1024, 999, 820, 650, 390 e 320 pixels.
Sem chamadas às APIs de conta ou alteração no banco de dados.
