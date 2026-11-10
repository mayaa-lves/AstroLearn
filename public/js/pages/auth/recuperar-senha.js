import {solicitarRecuperacao} from '../../services/recuperacao.js';
const $ = id => document.getElementById(id);
const form=$('recoveryForm'), email=$('email'), submit=form.querySelector('[type="submit"]');
const result=$('recoveryResult'), status=$('recoveryStatus');
let busy=false;
form.onsubmit=async event=>{
  event.preventDefault(); if(busy) return;
  email.value=email.value.trim();
  const valid=email.value && email.validity.valid;
  $('emailError').textContent=valid?'':'Digite um e-mail válido.';
  email.setAttribute('aria-invalid',String(!valid));
  if(!valid){email.focus();return;}
  busy=true;submit.disabled=true;email.readOnly=true;form.setAttribute('aria-busy','true');
  status.textContent='Solicitando as instruções…';
  try {
    const enviado=email.value;
    await solicitarRecuperacao(enviado);
    $('submittedEmail').textContent=enviado;
    // O servidor usa resposta genérica; não comprova entrega do e-mail.
    form.hidden=true;result.hidden=false;status.textContent='';
    result.tabIndex=-1;result.focus();
  } catch(error) {
    status.textContent=error.status===429?'Muitas solicitações em pouco tempo. Aguarde antes de tentar novamente.':error.message;
  } finally {
    busy=false;submit.disabled=false;email.readOnly=false;form.setAttribute('aria-busy','false');
  }
};
email.oninput=()=>{$('emailError').textContent='';email.removeAttribute('aria-invalid');};
$('tryAgain').onclick=()=>{result.hidden=true;$('submittedEmail').textContent='';form.hidden=false;status.textContent='';email.focus();email.select();};
