
function toggleJugadorPass(){const i=document.getElementById('jugadorPass'); if(i) i.type = i.type==='password'?'text':'password';}
function toggleAdminPass(){const i=document.getElementById('adminPass'); if(i) i.type = i.type==='password'?'text':'password';}
document.getElementById('loginJugadorForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const user=document.getElementById('jugadorUser').value.trim();
  const pass=document.getElementById('jugadorPass').value.trim();
  fetch('data.json').then(r=>r.json()).then(db=>{
    const found = db.players.find(p=> p.username.toUpperCase()===user.toUpperCase() && p.password===pass);
    if(!found){ document.getElementById('loginJugadorError').innerText='❌ Usuario o contraseña incorrectos'; return; }
    localStorage.setItem('jugadorActivo', found.username);
    window.location='jugador_home.html';
  });
});
function loginAdmin(){ const u=document.getElementById('adminUser').value.trim(); const p=document.getElementById('adminPass').value.trim(); if(u==='admin' && p==='admin'){ window.location='admin_home.html'; } else document.getElementById('loginAdminError').innerText='❌ Admin incorrecto'; }
