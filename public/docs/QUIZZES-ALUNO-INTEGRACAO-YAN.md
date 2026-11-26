# Quizzes do aluno — integração para Yan

Entrega de 24/11/2026. O visual foi aprovado em duas etapas: realização do quiz e resultado simplificado com lista expansível. Os números das imagens são ilustrativos; nenhum deles foi inserido como resultado no front.

## Implementado

Página aluno/quizzes.html, versões realista/pixel conforme a preferência existente, perfil escolhido usando o componente compartilhado, menu Quizzes, catálogo real do dashboard, instruções, uma questão por vez, navegação por números, revisão das escolhas e confirmação explícita de envio. Após confirmação do servidor: pontuação e revisão expansível quando os dados existirem. Erros, questões em branco e explicações dependem das respostas retornadas pelo servidor.

O front não contém perguntas de demonstração, não gera nota e não revela gabarito no formulário. Respostas ficam em sessionStorage por aluno e quiz, acompanhadas da versão e do conteúdo recebido para não recuperar escolhas em questões modificadas. O status informa armazenamento no navegador, sem prometer salvamento no servidor. Resultados recentes da sessão guardam apenas ID, título e sala; reabertura busca e confirma tudo no servidor. Não é um histórico permanente.

## Rotas atuais usadas

| Função | Rota atual | Contrato |
| --- | --- | --- |
| Disponíveis | GET /api/aluno/dashboard | tem_sala, sala.id, quizzes_disponiveis |
| Detalhes e recuperação do resultado | GET /api/aluno/quiz/:id | quiz, perguntas, ja_respondido, progresso |
| Envio legado | POST /api/aluno/quiz/:id/responder | respostas: objeto question_id → a/b/c/d |

O adaptador público está em public/js/services/quizzes-aluno.js. Usa a autenticação e o envelope success/data já existentes. Não colocar chaves de IA no aluno.

O endpoint atual já omite correct_answer das perguntas. Isso é obrigatório: dados sensíveis não podem apenas ficar ocultos por CSS. O normalizador do front recusa gabarito/explicação em perguntas de um quiz ainda não finalizado.

A pontuação atual é score entre 0 e 100, correct_answers e total_questions. A tela apresenta score / 10, explicitamente de 10. Não confundir porcentagem com nota em futuras alterações de API. O servidor é a fonte da correção, nunca o navegador.

## O que falta para exibir a revisão aprovada

O app.py enviado calcula só o agregado, não registra as respostas individuais e não retorna gabarito/explicação após o envio. Portanto, hoje o front mostra a pontuação confirmada e informa que os detalhes ainda não foram liberados. Não adivinhar o que o aluno errou a partir do total.

Proposta de extensão do contrato, a implementar e validar no servidor:

- POST responder devolve, além de score/correct_answers/total_questions, uma lista revisao.
- GET quiz devolve a mesma lista revisao SOMENTE com ja_respondido=true e para o aluno dono da tentativa, dentro da política de liberação.
- Cada item de revisao: question_id (único), question, option_a, option_b, option_c, option_d, correct_answer (a/b/c/d), sua_resposta (a/b/c/d ou null), explicacao (opcional).
- A lista deve conter todas as questões, em ordem. O front valida quantidade, identificadores, gabarito e acertos para não mostrar uma revisão parcial ou contraditória. Quando faltar consistência, preserva a pontuação válida e não inventa detalhes.
- Guardar enunciados, alternativas, gabaritos e explicações versionados junto da tentativa, para edição futura do professor não mudar resultado antigo.

## Avaliações com tempo e incidentes

Os recursos de prova formal continuam pendentes. A criação pelo professor também mantém publicação bloqueada até o contrato novo ficar pronto. O aluno não inicia quizzes identificados como avaliacao, com duracao_minutos definida, ou encerrar_ao_sair_da_guia=true usando o fluxo legado. Isso evita apresentar um cronômetro sem validação do servidor.

Antes de habilitar esse fluxo:

1. Criar começo/recuperação de tentativa, estado e ID da tentativa, versão do quiz, prazo expires_at e horário server_now. A janela de aplicação depende da decisão da Maya. Envio e expiração devem ser processados no servidor.
2. Salvar respostas por questão com confirmação; retomada após queda sem perder o que foi confirmado. UI já reserva o cronômetro, mas não cria um prazo local fictício. Alterar o adaptador e o controlador para usar o contrato real.
3. Finalizar de forma idempotente por tentativa. Se o POST der timeout, o front atual consulta o estado antes de reenviar. O backend deve impor unicidade/concorrência; checar ja_existe e depois inserir sem constraint/transação deixa corrida entre abas.
4. Revisão dos erros/acertos somente após finalização autorizada; sem gabarito no payload inicial. Reabertura por incidente com professor autorizado e motivo auditável.
5. A política de troca de guia é opcional e precisa de aviso prévio, registro e revisão. Eventos do navegador não são uma prevenção infalível de cola. Não encerrar só um painel local enquanto a tentativa continua aberta no servidor.
6. Separar treino de avaliação na média e integrar dashboard do aluno e pauta do professor conforme pesos, tentativas, ausências e arredondamento aprovados. O backend legado considera quizzes na média sem essa separação; não tratá-lo como contrato definitivo.
7. Disponibilizar catálogo incluindo concluídos e endpoint de histórico do aluno. A lista atual do dashboard contém apenas não respondidos. O histórico temporário desta sessão não substitui a consulta permanente.

## Verificações desta entrega

Sintaxe, caminhos, contratos de dados, gabarito oculto, nota recebida, navegação, armazenamento da conta, revisão, erro de rede sem falso sucesso, reconciliação após timeout e bloqueio de prova avançada sem servidor foram conferidos localmente com dados de teste isolados. Isso não equivale à homologação contra a API em produção nem à campanha de testes do TCC. A renderização final precisa ser conferida no navegador da Maya.
