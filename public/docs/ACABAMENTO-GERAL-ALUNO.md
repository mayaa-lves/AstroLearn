# Acabamento geral — aluno

Entrega de 25/11/2026. O pacote aplica uma camada de acabamento às 18 páginas HTML da área do aluno, incluindo as telas externas dos jogos. O conteúdo interno dos jogos incorporados, os cenários e as imagens não são substituídos.

## Ajustes

- Títulos, subtítulos e espaçamentos mais consistentes, preservando a composição especial da trilha, das missões, do universo de jogos e dos quizzes.
- Formulários e ações com limites de largura, melhor espaçamento e adaptação para celular.
- Perfil, equipe e biblioteca passam para uma coluna quando o espaço disponível diminui.
- Janelas comuns com margens, rolagem e dimensões mais consistentes. O visualizador do avatar, o telescópio e as janelas imersivas mantêm seus enquadramentos próprios.
- Estilo das ações e janelas ajustado também para pixel art, sem alterar texturas, cores dos cenários, skins ou fotos escolhidas.
- Quadro do avatar e controle de rotação com alinhamento comum, mantendo os deslocamentos de cada vista do sprite.
- Painel de notificações com filtros que quebram linha e rolagem interna da lista, sem alterar regras de leitura ou integração.
- Tabelas sem contêiner passam a ter rolagem horizontal local acessível pelo teclado.

## Estrutura

Cada HTML recebe a classe student-finish e o marcador data-student-area. Carrega public/css/aluno-acabamento.css e public/js/components/aluno-acabamento.js com o caminho relativo apropriado, inclusive dentro de aluno/jogos.

O script não consulta APIs nem modifica respostas, compras, pontuações ou missões. Ele somente cria um contêiner de rolagem para tabelas que ainda não o possuem. Os IDs e scripts anteriores são preservados.

## Conferência e limites

Conferidos os IDs das 18 páginas, referências de arquivos, sintaxe, preservação dos scripts existentes e estabilidade do processamento de tabelas dinâmicas. O acabamento é separado por tema, com exceções para os layouts imersivos.

A renderização no navegador não pôde ser realizada neste ambiente. Conferir o visual no navegador utilizado pela Maya nos dois temas, com menu aberto/recolhido e tela menor. Esta conferência local não é a campanha de testes do TCC nem homologação da API em produção.

As pendências de backend dos quizzes permanecem nos guias próprios: publicação da avaliação, tentativas, prazo autoritativo, saída de guia e revisão detalhada após o envio. Este pacote não habilita esses recursos nem altera os resultados dos quizzes.
