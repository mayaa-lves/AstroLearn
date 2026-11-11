import {atualizarPlanetaMissao} from '../../components/planeta-missao.js';
/* Interface da atividade: não altera os handlers de entrega ou correção. */
import {sessaoObrigatoria,api,encerrar} from '../../services/conexao.js';
import {dashboard} from '../../services/aluno.js';
import {formatarPrazo} from '../../services/atividades.js';
const params=new URLSearchParams(location.search),preview=params.get('preview')==='1';
const session=sessaoObrigatoria(preview?'professor':'aluno');
const $=id=>document.getElementById(id),trigger=$('activityAccountToggle'),panel=$('activityAccountPanel');
const initial=(session.usuario.nome||'Explorador').trim().slice(0,1).toUpperCase();
$('activityAccountInitial').textContent=initial;$('activityProfileInitial').textContent=initial;
$('activityProfileName').textContent=session.usuario.nome||'Explorador';$('activityProfileEmail').textContent=session.usuario.email||'';$('activityProfileEmail').hidden=!session.usuario.email;
$('activityLogout').onclick=encerrar;
if(preview){$('activityHome').href='../professor/turma.html?sala='+encodeURIComponent(params.get('sala')||'');$('activityHome').setAttribute('aria-label','Voltar à turma');$('activityHomeTip').textContent='Voltar à turma';$('activityProfileRole').textContent='Professor · AstroLearn';$('activityProfileLink').href='../professor/home.html';$('activityProfileLink').textContent='Minhas turmas →';$('activityPreferencesLink').hidden=true;}
if(!preview){
 const link=$('activityHome'),id=params.get('atividade');link.href=id?'home.html?missao='+encodeURIComponent(id)+'#journey':'home.html#journey';
 link.textContent='← Voltar para a trilha';link.setAttribute('aria-label','Voltar para a trilha');link.removeAttribute('aria-describedby');
 Object.assign(link.style,{display:'inline-flex',width:'auto',flexBasis:'auto',padding:'0 12px',borderRadius:'22px',whiteSpace:'nowrap',fontSize:'14px'});
}
let pinned=false,timer=0;
function open(){clearTimeout(timer);panel.hidden=false;trigger.setAttribute('aria-expanded','true');}
function close(restore=false){clearTimeout(timer);panel.hidden=true;pinned=false;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();}
for(const element of [trigger,panel]){
 element.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')open();});
 element.addEventListener('pointerleave',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!pinned&&!trigger.matches(':hover')&&!panel.matches(':hover')&&!panel.contains(document.activeElement)&&document.activeElement!==trigger)close();},220);});
 element.addEventListener('focusout',()=>setTimeout(()=>{if(!panel.contains(document.activeElement)&&document.activeElement!==trigger)close();},0));
}
trigger.onclick=e=>{if(!panel.hidden&&pinned)close();else{open();pinned=true;if(e.detail===0)panel.querySelector('a').focus();}};
$('activityCloseAccount').onclick=()=>close(true);
document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
async function identify(){
 const id=params.get('atividade');
 if(!id){$('activityTeacher').textContent='Professor: não informado';$('activityTeacherDue').textContent='Abra uma atividade pela trilha.';return;}
 try{
  let missions,teacher;
  if(preview){const room=await api('/api/professor/salas/'+encodeURIComponent(params.get('sala')||''));missions=room.missoes||[];teacher=session.usuario.nome;}
  else{const data=await dashboard();missions=(data.periodos_trilha||[]).flatMap(period=>period.missoes||[]);teacher=data.sala?.perfis?.nome||data.sala?.professor?.nome||data.sala?.professor_nome;}
  const index=missions.findIndex(m=>String(m.id)===id),mission=missions[index];
  $('activityTeacher').textContent='Professor: '+(teacher||'não informado');
  $('activityTeacherDue').textContent=mission?.data_limite?'Prazo: '+formatarPrazo(mission.data_limite):'Sem prazo definido';
  if(index<0)return;
  const planet=$('activityPlanet');atualizarPlanetaMissao(planet,index);planet.hidden=false;document.body.dataset.activityWorld=String([0,1,2,2,1,0][index%6]);document.body.dataset.activityFamily=String(index%6);
  document.dispatchEvent(new CustomEvent('astrolearn:planets'));
 }catch{$('activityTeacher').textContent='Professor: informação indisponível';$('activityTeacherDue').textContent='Não foi possível consultar os dados da turma.';}
}
identify();

