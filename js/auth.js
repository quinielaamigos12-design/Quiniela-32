
// auth.js - handles login and user session; reads data.json
let APP_DATA = null;
async function loadData(){
  if(APP_DATA) return APP_DATA;
  try{
    const res = await fetch('data.json', {cache:'no-store'});
    APP_DATA = await res.json();
  }catch(e){
    // fallback if not found
    APP_DATA = { meta:{name:'Quiniela 32'}, players:[], jornadas:[] };
  }
  return APP_DATA;
}

function saveDownloadDataJson(obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// login handling for index.html
document.addEventListener('DOMContentLoaded', async ()=>{
  const btn = document.getElementById('btnLogin');
  if(btn) btn.addEventListener('click', async ()=>{
    const user = document.getElementById('inputUser').value.trim();
    const pass = document.getElementById('inputPass').value.trim();
    const msg = document.getElementById('msg');
    msg.textContent = '';
    const data = await loadData();
    if(!user){ msg.textContent='Introduce un usuario'; return; }
    // admin special
    if(user.toLowerCase() === 'admin'){
      // admin password stored in data.json meta.adminPass if present
      const adminPass = (data.meta && data.meta.adminPass) ? data.meta.adminPass : 'Quiniela2025*';
      if(pass === adminPass){
        sessionStorage.setItem('session','admin');
        window.location.href = 'admin.html';
        return;
      } else { msg.textContent='Contraseña admin incorrecta'; return; }
    }
    // find player
    const player = data.players.find(p=>p.name.toLowerCase() === user.toLowerCase());
    if(!player){ msg.textContent='Jugador no encontrado. Pide al admin que te cree.'; return; }
    // if player's password is default or empty, allow set on first login
    if(!player.password || player.password === 'pass1234'){
      // set new password flow: store temporarily in sessionStorage then prompt to change
      if(pass === 'pass1234'){
        // allow login and ask to change
        sessionStorage.setItem('session', user);
        // flag to prompt change
        sessionStorage.setItem('needChange', '1');
        window.location.href = 'jugador.html?user=' + encodeURIComponent(user);
        return;
      } else {
        // set provided as new password and prompt admin to export data.json to save globally
        // we update APP_DATA in memory
        player.password = pass;
        // store changed data locally in sessionStorage for export
        sessionStorage.setItem('modifiedData', JSON.stringify(data));
        sessionStorage.setItem('session', user);
        window.location.href = 'jugador.html?user=' + encodeURIComponent(user);
        return;
      }
    } else {
      if(pass === player.password){
        sessionStorage.setItem('session', user);
        window.location.href = 'jugador.html?user=' + encodeURIComponent(user);
        return;
      } else {
        msg.textContent='Contraseña incorrecta';
        return;
      }
    }
  });
});
