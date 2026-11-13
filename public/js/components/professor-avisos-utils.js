export function categoriaAviso(n){
 const type=String(n.tipo||n.type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const explicit={pergunta:{key:'question',label:'Pergunta'},duvida:{key:'question',label:'Pergunta'},entrega:{key:'delivery',label:'Entrega'},material:{key:'material',label:'Material'},resultado:{key:'result',label:'Resultado'},tarefa:{key:'task',label:'Tarefa'}};if(explicit[type])return explicit[type];
 const title=String(n.titulo||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/pergunta|duvida/.test(type)||/duvida|pergunta/.test(title))return{key:'question',label:'Pergunta'};
 if(/entrega/.test(type)||/entrega/.test(title))return{key:'delivery',label:'Entrega'};
 if(/material|biblioteca/.test(type))return{key:'material',label:'Material'};
 if(/correcao|resultado/.test(type))return{key:'result',label:'Resultado'};
 if(/tarefa/.test(type))return{key:'task',label:'Tarefa'};
 return{key:'info',label:'Informação'};
}
export function pertenceSala(n,sala,missionIds=new Set()){
 const explicit=n.sala_id??n.sala?.id??n.dados?.sala_id;
 if(explicit!=null)return String(explicit)===String(sala);
 let url;try{url=new URL(n.link||'','https://astrolearn.invalid');}catch{return false;}
 const path=/\/professor\/salas\/([^/?#]+)/.exec(url.pathname);
 const linkRoom=url.searchParams.get('sala')??url.searchParams.get('sala_id')??(path?decodeURIComponent(path[1]):null);
 if(linkRoom!==null)return String(linkRoom)===String(sala);
 const pathMission=/\/(?:aluno\/)?missoes\/([^/?#]+)/.exec(url.pathname);
 const mission=n.missao_id??n.dados?.missao_id??(pathMission?decodeURIComponent(pathMission[1]):null);
 return mission!=null&&missionIds.has(String(mission));
}

// Contrato proposto para o backend; leitura não define resolução.
export function pendenciaAviso(n){
 const states={aguardando_resposta:{label:'Aguardando resposta',pending:true},respondida:{label:'Respondida',pending:false},aguardando_correcao:{label:'Aguardando correção',pending:true},corrigida:{label:'Corrigida',pending:false},sem_pendencia:{label:'Sem pendência',pending:false}};
 const key=n.estado_pendencia;
 return states[key]?{key,...states[key]}:{key:'desconhecida',label:'Situação não informada',pending:null};
}
