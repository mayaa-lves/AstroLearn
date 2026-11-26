// As posições são relativas às gravações recebidas, não aos elementos da conta.
export const tutorialVersion=1;
export const tutorialSteps=[
 {id:'turma',eyebrow:'SUA PRIMEIRA TURMA',title:'Comece criando uma turma',description:'A turma reúne alunos, atividades e os resultados que você acompanha.',video:'turma.mp4',poster:'turma-poster.webp',notes:[
  {title:'Crie a turma',text:'No mural, clique em Criar turma. Você pode organizar uma sala para cada grupo que acompanha.',at:0,point:[.925,.325]},
  {title:'Dê um nome fácil de reconhecer',text:'Preencha o nome e confirme. Aguarde a criação antes de tentar novamente.',at:3,point:[.5,.47]},
  {title:'Abra a sala criada',text:'O novo card aparece no mural. Clique em Abrir turma para acessar as ferramentas e os alunos.',at:15,point:[.62,.84]}
 ]},
 {id:'semestre',eyebrow:'ORGANIZAÇÃO DA SALA',title:'Crie o semestre antes das atividades',description:'O semestre organiza as propostas e os grupos da sua turma.',video:'semestre.mp4',poster:'semestre-poster.webp',notes:[
  {title:'Abra Todos os semestres',text:'Dentro da turma, abra esse controle e escolha Criar semestre.',at:0,point:[.84,.26],points:[{at:1.2,point:[.86,.47]}]},
  {title:'Informe o nome',text:'Use um nome como 1º semestre. Confirme em Criar semestre e aguarde o salvamento.',at:3.5,point:[.49,.535]},
  {title:'Use o semestre nas próximas etapas',text:'Depois de criado, ele pode ser escolhido ao montar atividades e equipes. O mesmo controle também filtra os dados da sala.',at:9.5,point:[.84,.26]}
 ]},
 {id:'convite',eyebrow:'TRAGA SUA TURMA',title:'Convide os alunos para a sala',description:'Compartilhe o convite para que cada aluno confirme a própria entrada.',video:'convite.mp4',poster:'convite-poster.webp',notes:[
  {title:'Abra Convidar alunos',text:'Use o ícone ao lado da visão geral de alunos, dentro da sala.',at:0,point:[.622,.397]},
  {title:'Copie o link ou o código',text:'A janela mostra as duas opções. Compartilhe o convite com os alunos pelos canais que você utiliza.',at:2.5,point:[.51,.555]},
  {title:'O aluno confirma a entrada',text:'Ao abrir o convite, o aluno entra ou cria sua conta e confirma o vínculo com a turma. O link mostrado nesta gravação é de demonstração.',at:6,point:[.51,.63]}
 ]},
 {id:'atividade',eyebrow:'SUA PROPOSTA DE APRENDIZAGEM',title:'Prepare uma atividade para os alunos',description:'Explique a proposta, o que entregar e como a turma vai trabalhar.',video:'atividade.mp4',poster:'atividade-poster.webp',hint:'O vídeo mostra o preenchimento. No final do formulário, use Salvar rascunho ou Revisar e publicar.',notes:[
  {title:'Defina o título da proposta',text:'Na sala, abra Criar atividade. Escolha um título que ajude o aluno a identificar a tarefa.',at:0,point:[.41,.49]},
  {title:'Explique o que deve ser feito',text:'Escreva as orientações e descreva o que o aluno precisa entregar. Evite deixar essa informação apenas no título.',at:5,point:[.40,.65]},
  {title:'Confira as opções antes de publicar',text:'Escolha o semestre, defina o formato e, se necessário, prazo e material de apoio. Revise a proposta antes da publicação.',at:13,point:[.45,.39],points:[{at:21,point:[.43,.86]}]}
 ]},
 {id:'biblioteca',eyebrow:'MATERIAIS DE APOIO',title:'Reúna as referências na Biblioteca',description:'Compartilhe os materiais que ajudam os alunos a realizar as atividades.',video:'biblioteca.mp4',poster:'biblioteca-poster.webp',notes:[
  {title:'Adicione um material',text:'Na Biblioteca, clique no botão de adicionar para abrir o formulário.',at:0,point:[.116,.412]},
  {title:'Preencha os dados',text:'Informe o título e uma descrição. Você pode relacionar o material a uma atividade e incluir links.',at:4.2,point:[.31,.48]},
  {title:'Confira o anexo e salve',text:'Se enviar um arquivo, confira a seleção antes de salvar. Depois, o material aparece na listagem da Biblioteca.',at:16.2,point:[.44,.72],points:[{at:22,point:[.89,.86]}]}
 ]},
 {id:'equipe',eyebrow:'TRABALHO EM GRUPO',title:'Organize as equipes da turma',description:'Crie os grupos e adicione os alunos já vinculados à sala.',video:'equipe.mp4',poster:'equipe-poster.webp',notes:[
  {title:'Crie a equipe',text:'Em Equipes, abra a criação, informe um nome e escolha o semestre.',at:0,point:[.48,.43]},
  {title:'Abra a organização do grupo',text:'Depois de criar, abra a equipe para consultar quem participa e organizar os integrantes.',at:9,point:[.48,.34]},
  {title:'Selecione e adicione os alunos',text:'Escolha o aluno disponível e clique em Adicionar integrante. Cada equipe pode ter até quatro integrantes.',at:15,point:[.58,.55]}
 ]},
 {id:'correcoes',eyebrow:'ACOMPANHE AS ENTREGAS',title:'Encontre as entregas para corrigir',description:'Use a listagem para localizar os trabalhos e acompanhar a situação de cada entrega.',image:'correcoes.webp',hint:'Esta etapa usa um print. Ao abrir uma entrega no sistema, você poderá consultar o trabalho, preencher nota e devolutiva e salvar a correção.',notes:[
  {title:'Busque e filtre as entregas',text:'Pesquise pelo aluno ou pela atividade. No filtro, escolha A corrigir, Todas as entregas ou Corrigidas; o semestre refina a consulta.',point:[.81,.285]},
  {title:'Confira situação e nota',text:'A situação identifica o que já foi corrigido. Uma nota zero é diferente de uma entrega ainda sem avaliação.',point:[.65,.445]},
  {title:'Abra a entrega',text:'Use Abrir entrega na linha desejada. Após analisar o trabalho, registre a nota e uma orientação clara para o aluno.',point:[.93,.445]}
 ]}
];
export function tutorialKey(userId){return `astrolearn-tutorial-professor-v${tutorialVersion}:${encodeURIComponent(userId)}`;}
export function readTutorialState(storage,userId){
 try{const value=JSON.parse(storage.getItem(tutorialKey(userId))||'null');
  if(value?.version!==tutorialVersion||!['in_progress','skipped','completed'].includes(value.status)||!Number.isInteger(value.slide)||value.slide<0||value.slide>tutorialSteps.length+1)return null;
  return value;
 }catch{return null;}
}
export function writeTutorialState(storage,userId,status,slide){
 try{storage.setItem(tutorialKey(userId),JSON.stringify({version:tutorialVersion,status,slide,updatedAt:new Date().toISOString()}));return true;}catch{return false;}
}
