// Simple client-side auth: checks players in data.json and admin credentials.
function authLoginPlayer(user, pass){
  user = (user||'').toString().trim();
  pass = (pass||'').toString().trim();
  if(!user || !pass){ document.getElementById('msg').textContent='Introduce usuario y contraseña.'; return; }
  fetch('data.json').then(r=>r.json()).then(d=>{
    const p = (d.players||[]).find(x=> (x.username||x.name||'').toString().toUpperCase()===user.toUpperCase() );
    if(!p){ document.getElementById('msg').textContent='Usuario no encontrado.'; return; }
    if((p.password||'')!==pass){ document.getElementById('msg').textContent='Contraseña incorrecta.'; return; }
    sessionStorage.setItem('currentUser', (p.username||p.name).toString());
    localStorage.setItem('lastLoginUser',(p.username||p.name).toString());
    location='jugador_home.html';
  });
}

function authLoginAdmin(user, pass){
  // default admin credentials: admin / admin1234
  if((user||'').toString()==='admin' && (pass||'').toString()==='admin1234'){
    sessionStorage.setItem('currentUser','ADMIN');
    location='admin_home.html';
    return;
  }
  // else also allow admin in players list with password
  fetch('data.json').then(r=>r.json()).then(d=>{
    const p = (d.players||[]).find(x=> (x.username||x.name||'').toString().toUpperCase()===user.toString().toUpperCase() );
    if(p && (p.password||'')===pass){
      sessionStorage.setItem('currentUser',(p.username||p.name).toString());
      location='admin_home.html';
      return;
    }
    document.getElementById('msg').textContent='Credenciales de administrador incorrectas.';
  });
}