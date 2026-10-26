# AstroLearn — entradas e interações da landing

Atualização de 25/10/2026, aplicada à landing interativa já entregue.

## Referências e direção

A equipe enviou vídeos de Bluemonster e Arlyze. A inspiração foi o ritmo das entradas, a presença dos personagens e elementos flutuantes que reagem ao cursor. A implementação mantém a identidade e as ilustrações do AstroLearn, sem importar o personagem, o código ou a identidade visual desses projetos.

## O que foi adicionado

- Entrada breve do menu, sem tela de carregamento ou espera artificial.
- Revelação do título por palavras, preservando os textos e quebras de linha.
- Entrada em sequência da chamada, ilustração e botões.
- Surgimento dos blocos conforme entram na área visível, com pequenos intervalos entre planetas, integrantes, planos e perguntas.
- Pequenas órbitas translúcidas circulando no fundo da abertura. Elas se afastam do cursor e voltam gradualmente ao fluxo. Clicar em uma delas faz aparecer pequenas estrelas; a órbita retorna depois de alguns segundos.
- Reação discreta do conjunto ilustrado da abertura à posição do cursor.
- Os dois mascotes menores podem ser cumprimentados com clique ou Enter/Espaço. Exibem uma frase curta e uma animação breve. O texto também aparece com foco.

Os mascotes usam ilustrações 2D renderizadas em 3D. A reação é uma animação do adesivo/composição; este pacote não implementa rig 3D, movimento independente de olhos ou animação facial. Os personagens e o cenário aprovados não foram substituídos. A pintura realismo/pixel art permanece com o comportamento anterior.

## Arquivos

- `index.html`: adiciona um CSS e um script, mantendo o conteúdo anterior.
- `public/css/pages/landing-movimento.css`: entradas e estados visuais complementares.
- `public/js/pages/landing-movimento.js`: sequência de entrada, órbitas e respostas.

Não foram adicionadas bibliotecas externas, dependências ou chamadas de API. As imagens são reutilizadas da landing anterior. Aluno, professor, autenticação, permissões de jogos, planos, contatos, logo e favicon não foram modificados.

## Movimento e acessibilidade

A opção Reduzir movimentos no rodapé e a configuração do sistema continuam valendo. Quando ativas, a entrada não oculta o conteúdo, os movimentos automáticos param e a reação por inclinação é neutralizada. Os botões continuam funcionando.

As animações em canvas pausam fora da tela ou com a aba oculta. O texto do título não é trocado por imagem, e o efeito não altera sua leitura. As órbitas são decorativas e não interceptam links ou botões.

## Validação

32 verificações de navegador concluídas: título e entradas, camada única de órbitas, movimento ao longo do tempo, resposta ao cursor, recentralização, saudação pelo teclado, surgimento dos planos, preferência manual e do sistema, parada das órbitas, pintura e abas anteriores preservadas, navegação mobile, nenhuma rolagem horizontal em 1440/1024/820/650/390/320 pixels, nenhum erro de JavaScript ou recurso solicitado ausente e nenhuma chamada a endpoints de conta.

Inspeção visual em desktop e celular. Não equivale a auditoria de acessibilidade nem a teste de desempenho em todos os dispositivos. Nada foi publicado na Vercel.
