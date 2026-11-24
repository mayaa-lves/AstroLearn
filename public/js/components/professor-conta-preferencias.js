/* Preferences remain in the profile; the avatar menu only links to them. */
const sound=document.getElementById('profileNotificationSound');
if(sound){
 const key='astrolearn-som-notificacoes',status=document.getElementById('profileSoundStatus');
 const sync=()=>{try{sound.checked=localStorage.getItem(key)!=='off';}catch{sound.checked=true;}};
 sync();
 sound.addEventListener('change',()=>{try{localStorage.setItem(key,sound.checked?'on':'off');status.textContent='Preferência de som salva neste navegador.';}catch{status.textContent='Não foi possível salvar a preferência.';sync();}});
 window.addEventListener('storage',event=>{if(event.key===key)sync();});
 const showPreferences=()=>{if(['#preferencesPanel','#preferencesTitle'].includes(location.hash)){document.getElementById('preferencesTab')?.click();requestAnimationFrame(()=>document.getElementById('preferencesPanel')?.scrollIntoView({block:'start'}));}};
 window.addEventListener('hashchange',showPreferences);showPreferences();
}
