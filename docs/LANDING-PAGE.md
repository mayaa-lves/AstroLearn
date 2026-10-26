# Landing page do AstroLearn

Implementação de 25/10/2026, baseada na imagem clara aprovada pela equipe.

## Arquivos principais

- `index.html`: estrutura, conteúdo, preços provisórios, equipe, navegação e diálogo informativo.
- `public/css/pages/landing.css`: estilos exclusivos da apresentação; importa as fontes locais já existentes.
- `public/js/pages/landing.js`: interações exclusivas da landing, sem alterar sessões ou dados escolares.
- `public/assets/imagens/landing-v2/`: cinco imagens WebP, incluindo cenas realista e pixel art alinhadas.

Não foram modificados os arquivos de autenticação ou páginas de aluno/professor. O script já existente de redirecionamento de recuperação de senha continua no início do HTML. O favicon foi preservado.

## Conteúdo

Abertura, apresentação STEAM, experiência de pintura, jornada de três planetas, sobre o projeto, perfis de aluno/professor, equipe, planos em planejamento, perguntas frequentes, contato e rodapé.

Equipe apresentada sem funções: Mayara Alves, Isadora Jucá, Yan Proença e Daniel Pupo. Instituição: SENAI. Instrutores: Rafael Ribas e João Paulo Lepinsk.

O e-mail sugerido ainda não foi criado e os LinkedIns ainda não foram enviados. A página informa que esses canais serão disponibilizados; não publica endereços inventados ou links vazios. Quando a equipe confirmar os dados, substituir o aviso em `#contato` por um link `mailto:` real e inserir os links profissionais no rodapé.

## Interações

- Pintura por movimento do mouse e por arraste dentro da imagem em telas de toque.
- Rastro de pixel art preservado até recomeçar; o restante da imagem mantém o realismo.
- Botões para mostrar toda a cena em pixel art, retornar ao realismo e limpar a pintura.
- Controles equivalentes por teclado, sem obrigar a pessoa a usar mouse ou gesto.
- Áreas STEAM e planetas clicáveis com explicações curtas.
- Abas de aluno/professor com setas, Home/End e sem duplicar conteúdo na tela.
- Menu compacto em telas menores, perguntas expansíveis, janelas fecháveis com Escape e retorno do foco.
- Movimentos sutis do cenário e dos planetas. Estrelas discretas na abertura reagem ao cursor e aparecem ao clicar em áreas livres.
- Preferência de reduzir movimentos no rodapé, guardada localmente; a preferência do sistema tem prioridade.

No celular, o arraste dentro da cena é reservado à pintura; role a página a partir das áreas ao redor. A comparação completa pelos botões também funciona.

## Planos

Propostas aprovadas para apresentação provisória, sujeitas a revisão:

- Exploração: gratuito por 60 dias, 1 professor, até 2 turmas e 40 alunos no total.
- Órbita: R$ 149 por mês por escola, até 100 alunos ativos e 5 turmas.
- Galáxia: R$ 299 por mês por escola, até 300 alunos ativos e 15 turmas.

Cada turma tem um professor; um professor pode ter várias turmas. Não há limite separado de professores nos planos pagos. Não existe cobrança, checkout ou controle comercial de limites implementado por esta landing. Veja `APRESENTACAO-E-PLANOS.md` para premissas e custos a validar.

## Privacidade e uso

Os botões do rodapé abrem informações específicas sobre o estágio do projeto. Esses textos não são apresentados como política completa de privacidade ou contrato definitivo. Não foram incluídos formulário de contato, analytics, rastreamento de marketing, dados de pagamento ou segredos administrativos.

## Manutenção

Os textos são HTML real, separados das ilustrações. As duas cenas da pintura possuem o mesmo enquadramento e proporção. Ao substituir uma delas, manter a proporção e o posicionamento dos elementos; caso contrário, o pincel revelará objetos desalinhados.

A página usa arquivos locais e funciona com Go Live ou com o servidor de desenvolvimento existente. Não depende de instalação de framework, CDN de animações ou nova API. A pintura é demonstrativa e não muda o tema visual das páginas internas.
