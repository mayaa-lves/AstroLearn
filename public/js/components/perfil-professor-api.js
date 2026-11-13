import {sessaoObrigatoria} from '../services/conexao.js';
import {iniciarGaleria} from './galeria-avatar.js?v=fotos-predefinidas-2';
import {iniciarSeguranca} from './seguranca-perfil.js?v=seguranca-3';
const {usuario:user}=sessaoObrigatoria('professor');
const $=id=>document.getElementById(id);
$('studentName').textContent=user.nome||'Professor';
$('studentEmail').textContent=user.email||'E-mail não informado na sessão';
$('avatarInitials').textContent=(user.nome||'Professor').trim().split(/\s+/).slice(0,2).map(p=>p[0]).join('').toLocaleUpperCase('pt-BR');
iniciarGaleria(user);iniciarSeguranca(user);
