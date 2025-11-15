
// auth.js - improved
let APP_DATA=null;
async function loadData(){
  if(APP_DATA) return APP_DATA;
  try{
    const res = await fetch('data.json',{cache:'no-store'});
    APP_DATA = await res.json();
  }catch(e){
    APP_DATA = {meta:{name:'Quiniela 32'}, players:[], jornadas:[]};
  }
  return APP_DATA;
}

function saveDownloadDataJson(obj){
  const blob = new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='data.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const btn = document.getElementById('btnLogin');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    const user = document.getElementById('inputUser').value.trim();
    const pass = document.getElementById('inputPass').value.trim();
    const msg = document.getElementById('msg');
    msg.textContent='';
    const data = await loadData();
    if(!user){ msg.textContent='Introduce un usuario'; return;}
    if(user.toLowerCase()==='admin'){
      const adminPass = (data.meta && data.meta.adminPass)? data.meta.adminPass : 'Quiniela2025*';
      if(pass===adminPass){ sessionStorage.setItem('session','admin'); window.location.href='admin.html'; return;}
      else { msg.textContent='Contraseña admin incorrecta'; return; }
    }
    const player = data.players.find(p=>p.name.toLowerCase()===user.toLowerCase());
    if(!player){ msg.textContent='Jugador no encontrado.'; return; }
    if(!player.password || player.password==='pass1234'){
      if(pass==='pass1234'){ sessionStorage.setItem('session',player.name); sessionStorage.setItem('needChange','1'); window.location.href='jugador.html?user='+encodeURIComponent(player.name); return; }
      else { player.password = pass; sessionStorage.setItem('modifiedData', JSON.stringify(data)); sessionStorage.setItem('session', player.name); window.location.href='jugador.html?user='+encodeURIComponent(player.name); return; }
    }else{
      if(pass===player.password){ sessionStorage.setItem('session', player.name); window.location.href='jugador.html?user='+encodeURIComponent(player.name); return; }
      else { msg.textContent='Contraseña incorrecta'; return; }
    }
  });
});
