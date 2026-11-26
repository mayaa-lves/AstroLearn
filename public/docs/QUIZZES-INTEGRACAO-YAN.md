# AstroLearn — editor de quizzes do professor

Entregue em 24/11/2026. Esta entrega adiciona a criação pelo professor. A aplicação da prova ao aluno, cálculo de média e relatórios individuais continuam pendentes. Não publicar este módulo como fluxo completo de avaliação.

## O que está pronto no front

Entrada Quizzes no menu de uma sala; preparar com IA ou manualmente; editor com quatro alternativas e um gabarito; adicionar, duplicar, reordenar, excluir com desfazer; explicação opcional; treino/avaliação e duração opcional; intenção de encerrar ao sair da guia; revisão antes de publicar. Rascunhos locais separados por ID do professor e da sala, recuperação ao reabrir e exportação JSON (contém o gabarito; não compartilhar com alunos). Sem publicação automática. Nenhum resultado ou nota fictícios.

Quatro alternativas correspondem ao contrato atual. Outros tipos de questão e quantidade variável de alternativas não estão implementados.

## Integrações existentes, conferidas no app.py fornecido

| Operação | Rota | Uso nesta entrega |
| --- | --- | --- |
| Consultar nome da sala/semestres | GET /api/professor/salas/:sala | Ativa; lê sala e periodos |
| Gerar com Gemini | POST /api/professor/gemini/gerar-quiz | Ativa; tema, quantidade, dificuldade |
| Criar quiz antigo | POST /api/professor/salas/:sala/quizzes | Não chamada: não distingue treino e prova e pode afetar média imediatamente |
| Editar/excluir quiz antigo | PATCH/DELETE /api/professor/salas/:sala/quizzes/:quiz | Ainda não conectado; faltam listagem e recuperação completa do editor |

Geração: `{tema, quantidade, dificuldade}`; dificuldade: facil/medio/dificil. Ano e orientações são anexados ao texto de tema, pois a rota atual não os recebe separadamente. Resposta esperada no envelope já usado pela API: `{success:true,data:{perguntas:[{pergunta,opcoes:[...4],resposta_correta}]}}`. O adaptador também aceita as colunas question/option_a...option_d/correct_answer. A alternativa correta pode ser letra ou o texto de uma única opção. Conteúdo malformado, quantidade incorreta ou erro de rede não substituem as questões anteriores. O front só renderiza texto, nunca HTML gerado pela IA.

O backend precisa de GEMINI_API_KEY no servidor, modelo disponível na conta e validação do retorno. Não há chave de IA no navegador. A consulta usa o timeout global atual da API (30 segundos); rever no backend o tempo de geração, sem alterar globalmente todas as outras telas.

## Ponto único para conectar o novo app.py

`public/js/services/quizzes-professor.js`: rotas e funções de integração. `publicationEnabled=false` mantém Publicar indisponível. Não basta trocar para true: implementar publishQuiz com a rota real e só ativar quando todas as opções selecionadas forem persistidas e aplicadas. `quizzes-modelo.js` fornece publicationPayload; seus campos adicionais são uma proposta, não uma rota já existente nem uma migração aprovada.

Proposta de payload: titulo, descricao, periodo_id, dificuldade, tipo (treino/avaliacao), duracao_minutos (null=sem limite), encerrar_ao_sair_da_guia, perguntas com question, option_a/b/c/d, correct_answer, explicacao e ordem. Não descartar explicações ou configurações silenciosamente. Publicação deve retornar quiz.id real; validar sala/permissão no servidor. Recomenda-se idempotência para prevenir duplicação em repetição após timeout.

## Pendências para a avaliação funcionar

1. Fechar as decisões da Maya sobre composição/pesos da média, ausências, tentativas, incidentes, padrão de troca de guia e janela de disponibilidade. Sem definir 70/30 ou outro peso por conta própria. Treino deve ficar separado da média oficial.
2. Persistir rascunho/publicado no servidor; listar e recuperar quiz completo para seu professor; edição versionada que não muda tentativas já iniciadas. Definir publicação e retirada da publicação.
3. Modelo de tentativa/resposta por questão, início e término autoritativos no servidor, salvamento progressivo, recuperação de conexão, correção e reabertura auditada pelo professor autorizado. Prazo deve ser validado no servidor.
4. Endpoint do aluno sem gabarito/explicação antes da finalização; revisar erros/acertos apenas depois. Não confiar em esconder dados com CSS. Implementar o fluxo de realização para aluno nos temas realista e pixel art.
5. Troca de guia é um sinal do navegador, não um sistema infalível de prevenção de cola. Política opcional com aviso prévio, registro de incidente, confirmação do servidor e possibilidade de revisão. Não encerrar provas apenas por um bloqueio visual local.
6. Integração no dashboard/média depois das regras aprovadas, com desempenho por aluno e por questão (incluindo questão com mais erros, denominador e tentativas consideradas). Controle de acesso aos dados individuais.
7. Limitar quantidade/tamanho de entradas e saída da IA no servidor, validar gabarito, quatro opções únicas e dificuldade; rate limit e mensagens de erro sem expor segredos. Preservar explicações se geradas.

## Validação desta entrega

Conferências locais de sintaxe, caminhos e regras do editor; não equivalem à campanha de testes do TCC nem à homologação com a API real. A aprovação visual deve ser conferida no navegador da Maya. O editor preserva o menu/cabeçalho compartilhado; a arte lunar foi gerada a partir da referência aprovada.
