
function togglePass(id){const i=document.getElementById(id); if(i) i.type = i.type==='password'?'text':'password';}
document.getElementById('loginJugadorForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const user = document.getElementById('jugadorUser').value.trim();
  const pass = document.getElementById('jugadorPass').value.trim();
  fetch('data.json').then(r=>r.json()).then(db=>{
    let exact = db.players.find(p=> p.username === user && p.password === pass);
    if(exact){ localStorage.setItem('jugadorActivo', exact.username); location.href='jugador_home.html'; return; }
    let userExact = db.players.find(p=> p.username === user);
    if(userExact && userExact.password !== pass){ document.getElementById('loginJugadorError').innerText='❌ Contraseña incorrecta.'; return; }
    let ci = db.players.find(p=> p.username.toLowerCase()===user.toLowerCase() && p.password.toLowerCase()===pass.toLowerCase());
    if(ci){ localStorage.setItem('jugadorActivo', ci.username); location.href='jugador_home.html'; return; }
    let userCI = db.players.find(p=> p.username.toLowerCase()===user.toLowerCase());
    if(userCI && userCI.password.toLowerCase() !== pass.toLowerCase()){ document.getElementById('loginJugadorError').innerText='❌ Contraseña incorrecta (revisa mayúsculas).'; return; }
    document.getElementById('loginJugadorError').innerText='❌ Usuario no encontrado.';
  }).catch(e=>{ document.getElementById('loginJugadorError').innerText='❌ Error leyendo data.json'; console.error(e); });
});
function loginAdmin(){ const u=document.getElementById('adminUser').value.trim(); const p=document.getElementById('adminPass').value.trim(); if((u==='admin' && p==='admin') || (u==='ADMIN' && p==='ADMIN1234')){ location.href='admin_home.html'; } else document.getElementById('loginAdminError').innerText='❌ Admin incorrecto'; }
