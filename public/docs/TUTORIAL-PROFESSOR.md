# Tutorial inicial do professor

Implementado em 25/11/2026 com as gravações e os prints fornecidos pela Maya.

## Experiência

- Abertura “Vamos começar?”, botão Começar e opção pular.
- Tela de vidro com a página desfocada atrás; sem card branco externo.
- Sete etapas: turma, semestre, convite, atividade, biblioteca, equipes e correções.
- Seis vídeos H.264 sem áudio, com trechos de espera/digitação reduzidos, reprodução em repetição, pausa e opção de rever. As mídias só são carregadas na etapa atual.
- As explicações podem ser selecionadas para rever o trecho correspondente. As setas acompanham as posições da gravação e a etapa em reprodução.
- Correções utiliza apenas o print. O texto explica o fluxo posterior; não simula uma correção real.
- A gravação de atividade não mostra a publicação final. A orientação informa onde finalizar em Salvar rascunho ou Revisar e publicar, sem apresentar uma publicação fictícia.
- Mascotes sem fala e sem balão. A abertura conserva o aceno. As sete etapas alternam os quatro mascotes em poses próprias: bananeira, de cabeça para baixo, flutuando, apontando, lendo, deitado e equilibrando-se. O encerramento usa uma pose de comemoração. Há versões realista e pixel art dos novos atlas.
- As posições variam entre os cantos superiores e inferiores. Quando o mascote fica embaixo à direita, as notas trocam de lado para reservar espaço. No celular ele fica no fluxo, sem cobrir a demonstração ou os controles. Movimento reduzido suspende a animação e deixa o vídeo pausado inicialmente.
- Quizzes não fazem parte desta versão do tutorial.

## Abertura e persistência

Somente contas autenticadas com `role=professor`. A abertura automática ocorre na página do mural, depois que o carregamento inicial termina e sem interromper outra janela já aberta.

O estado fica separado pelo ID da conta em `astrolearn-tutorial-professor-v1:<ID codificado>`, no armazenamento local deste navegador. Salva versão, situação (`in_progress`, `skipped`, `completed`), etapa e data. Há fallback para a sessão quando não for possível gravar localmente. Se ambos os armazenamentos forem bloqueados, o tutorial continua utilizável, mas não consegue lembrar a escolha após sair da página.

Recarregar com o tutorial em andamento retoma a etapa. Concluir ou pular evita repetição automática. Rever pela Ajuda não apaga uma conclusão anterior. O estado não sincroniza entre dispositivos; isso precisaria de um contrato adicional no backend.

O ícone **Ajuda** (interrogação dentro do círculo), no rodapé do menu, reabre a apresentação em qualquer página do professor. No celular, Ajuda também está no menu Mais. Escape fecha a apresentação; quando a demonstração está ampliada, o primeiro Escape apenas reduz a mídia. O diálogo nativo conserva o foco dentro da janela e devolve-o ao sair.

Não cria, corrige, exclui ou publica nenhum dado: são gravações de demonstração. O tutorial não acessa rotas de escrita da API.

## Arquivos

- `public/js/components/professor-tutorial.js`: apresentação e interação.
- `public/js/components/professor-tutorial-dados.js`: textos, posições das setas e estado.
- `public/css/professor-tutorial.css`: vidro, layouts e preferências visuais.
- `public/assets/tutorial/professor/`: vídeos editados, posters e prints preparados para exibição.
- `public/js/components/professor-padrao.js`: importa o tutorial.
- Entradas HTML do professor: atualização da versão de importação para 9.
- `menu-professor-perfil.js` e `menu-unificado.js`: preservam o ícone e o rótulo de Ajuda ao reorganizar o menu.
- `scripts/dev-server.cjs`: suporte a intervalos HTTP para poder buscar/rever um trecho de vídeo ao usar `npm start`. Sem dependências novas.

As capturas são da interface realista recebida. O componente reconhece a preferência visual pixel para formas e mascote, mas não transforma as gravações em uma interface pixel fictícia. O tutorial do aluno ainda depende do roteiro e das capturas dessa área.

## Conferência realizada

Verificação em Chromium com API simulada: primeiro acesso, retomada, conclusão, pular, reabertura pela Ajuda no desktop e no menu Mais, pausa, busca de trecho, repetição, ampliação, Escape, movimento reduzido e fallback quando o vídeo não carrega. Layout conferido em 1366 × 768 e 390 × 844. Verificações adicionais de sintaxe, integridade de mídia e preservação das correções de botão/semestre.

Não houve acesso a uma conta real, migração ou publicação em produção. Isso não representa a campanha de testes do TCC.

Ajuste posterior: conferidas sete poses distintas, quatro posições, ausência de sobreposição com notas/vídeo, reabertura pela Ajuda com o menu expandido/recolhido e pelo Mais no celular, e troca para o atlas pixel.

Acabamento final: mascotes ampliados para 210 px nos cantos inferiores, 170 px nos superiores (120 px em janelas baixas) e 145 px no fluxo mobile. Abertura/encerramento também ampliados. O badge do sino fica visível além do limite do botão, enquanto só o rótulo expansível mantém o recorte.
