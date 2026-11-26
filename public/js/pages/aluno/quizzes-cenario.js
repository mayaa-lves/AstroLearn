/* Apenas efeitos visuais. Não altera respostas, tentativas ou resultados. */
const pause=()=>document.body.classList.toggle('sq-motion-paused',document.hidden);
document.addEventListener('visibilitychange',pause);window.addEventListener('pageshow',pause);pause();
