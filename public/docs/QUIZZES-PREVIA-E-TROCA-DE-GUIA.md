# Complemento — cards, movimento e saída da guia

24/11/2026. O catálogo vazio indica que /api/aluno/dashboard devolveu zero quizzes_disponiveis. Não é um catálogo de demonstração: só deve mostrar quizzes reais publicados para a turma. As imagens de prévia mostram conteúdos ilustrativos; não foram inseridos na base nem no catálogo do aluno.

Este pacote aplica o movimento das ilhas e das estrelas nos temas realista e pixel. O fundo e as ilhas foram separados para não movimentar planeta/chão ou deixar cópias imóveis das ilhas. As animações pausam quando a guia fica oculta e respeitam reduzir movimento.

## Comportamento solicitado para prova com restrição de guia

A prévia mostra o aviso antes de começar e o estado final após confirmação do servidor. Aplicar somente quando o professor ativar encerrar_ao_sair_da_guia. Não aplicar a todos os treinos nem declarar uma tentativa cancelada só porque um painel local foi bloqueado.

A implementação definitiva depende do contrato de tentativas mencionado em QUIZZES-ALUNO-INTEGRACAO-YAN.md. Depois de receber o app.py atualizado:

1. Antes de começar, mostrar a regra e pedir ciência ao aluno. Criar/recuperar a tentativa no servidor, com ID e versão da política.
2. Enquanto a tentativa está ativa, visibilitychange com document.visibilityState=hidden registra um evento único de saída. Não usar blur isolado: ele também ocorre ao interagir com menus do navegador e janelas do sistema.
3. Encaminhar o evento com ID idempotente, ID de tentativa e escolhas ainda não confirmadas por salvamento. Registrar o motivo no servidor e finalizar atomicamente a tentativa conforme a política. O navegador não garante que toda requisição disparada ao ocultar/fechar chegue ao servidor; recuperar/confirmar ao voltar à página. Definir tolerância a falhas com a Maya.
4. O front bloqueia novas escolhas enquanto aguarda a confirmação; mostra “Confirmando encerramento”, sem prometer que respostas foram enviadas. Em caso de erro, consultar o estado da tentativa e permitir nova confirmação, sem criar outra tentativa nem liberar a prova por conta própria.
5. Somente após resposta autoritativa status=encerrada e motivo=troca_guia, exibir “Avaliação encerrada”. Só afirmar que respostas foram encaminhadas se o servidor realmente tiver registrado isso. Não inventar nota zero.
6. O professor pode analisar incidente e autorizar reabertura/nova tentativa conforme as regras aprovadas, com motivo e auditoria. Isso é uma restrição do fluxo, não prevenção infalível de cola.

O fluxo formal continua bloqueado no adaptador legado. Não basta ligar um evento JavaScript para transformar o backend atual em um sistema de tentativas válido. Nenhuma prova real será encerrada por este pacote visual.
