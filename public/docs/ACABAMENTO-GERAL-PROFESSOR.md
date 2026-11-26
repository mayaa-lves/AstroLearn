# Acabamento geral — professor

Entrega de 24/11/2026. Camada de acabamento aplicada às 17 páginas da pasta professor. Não modifica endpoints, validação de negócio, banco, arquivos enviados ou regras de nota/publicação. Mantém os cenários, avatares, planetas, distintivos e animações aprovados.

## Alterações

- Margens de conteúdo, títulos, subtítulos e espaçamento do cabeçalho consistentes.
- Mural: Criar turma alinhado com a busca, preservando o botão original e seus eventos.
- Sala: tabela de alunos com linhas e avatares menores, mantendo os dados e ações.
- Formulários: espaçamentos, controles, largura das ações e alinhamento à direita.
- Janelas de ações: bordas, preenchimento, botões de fechar e limites de altura/largura; distintivos das equipes preservados.
- Tabelas sem contêiner passam a ter rolagem horizontal local acessível pelo teclado. Não transforma tabela em cards nem oculta colunas.
- Painéis e grades se adaptam também à largura disponível quando o menu está expandido. Nas telas pequenas, formulários e painéis passam para uma coluna.
- Menu em notebooks baixos: atalhos compactados e rolagem local para manter todas as áreas acessíveis.
- Perfil e assistente acompanham a densidade dos outros cabeçalhos; nenhum personagem ou foto é trocado.

## Arquivos centrais

public/css/professor-acabamento.css é a camada compartilhada, ativada pela classe teacher-finish no body. Cada HTML carrega esse arquivo no fim do head. public/js/components/professor-acabamento.js só ajusta a apresentação de tabelas e do botão Criar turma. Não contém requisições HTTP.

O botão Criar turma é movido individualmente para roomToolbar; pageActions continua no cabeçalho para não quebrar a recarga do mural. O processamento do DOM é agrupado em requestAnimationFrame e evita envolver uma tabela repetidamente.

## Conferência realizada

As 17 páginas preservaram seus IDs e scripts anteriores. Conferidos arquivos referenciados, sintaxe JavaScript, escopo docente, estabilidade do observador, recarga do mural e preservação dos nós de ação. Não houve substituição de imagens nem alteração nos scripts da área do aluno.

A conferência local não é homologação visual em navegador, teste da API em produção ou a campanha de testes do TCC. O navegador de renderização não ficou disponível neste ambiente. Conferir o resultado no navegador usado pela Maya, principalmente em 1366×768, com menu aberto/recolhido, e em celular. Pendências de quizzes continuam descritas nos guias de integração próprios; esta entrega não habilita publicação de provas ou cancelamento por troca de guia.
