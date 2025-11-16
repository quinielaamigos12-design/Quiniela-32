
const FIXED_ADMIN_USER='admin', FIXED_ADMIN_PASS='admin1234', FIXED_PLAYER_USER='MIGI', FIXED_PLAYER_PASS='MIGUI23';
let APP_DATA=null;
async function loadData(){ if(APP_DATA) return APP_DATA; try{ const res=await fetch('data.json',{cache:'no-store'}); APP_DATA=await res.json(); }catch(e){ APP_DATA={meta:{name:'Quiniela 32'},players:[],jornadas:[]}; } return APP_DATA; }
document.addEventListener('DOMContentLoaded', async ()=>{
  const data=await loadData();
  const loginBtn=document.getElementById('loginBtn'), userInput=document.getElementById('user'), passInput=document.getElementById('pass'), msg=document.getElementById('msg');
  loginBtn.addEventListener('click', ()=>{
    const user=(userInput.value||'').trim(), pass=(passInput.value||'').trim(); if(!user||!pass){ msg.textContent='Introduce usuario y contraseña'; return; }
    if(user===FIXED_ADMIN_USER && pass===FIXED_ADMIN_PASS){ sessionStorage.setItem('session','admin'); window.location.href='admin.html'; return; }
    if(user===FIXED_PLAYER_USER && pass===FIXED_PLAYER_PASS){ sessionStorage.setItem('session',user); window.location.href='jugador.html?user='+encodeURIComponent(user); return; }
    const player=(data.players||[]).find(p=>p.name===user && p.password===pass); if(player){ sessionStorage.setItem('session',user); window.location.href='jugador.html?user='+encodeURIComponent(user); return; }
    msg.textContent='Usuario o contraseña incorrectos';
  });
});
