
function toggleJugadorPass(){const i=document.getElementById('jugadorPass'); if(i) i.type = i.type==='password'?'text':'password';}
function toggleAdminPass(){const i=document.getElementById('adminPass'); if(i) i.type = i.type==='password'?'text':'password';}

document.getElementById('loginJugadorForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const userInput = document.getElementById('jugadorUser').value.trim();
  const passInput = document.getElementById('jugadorPass').value.trim();
  fetch('data.json').then(r=>r.json()).then(db=>{
    // exact match first (case-sensitive)
    let found = db.players.find(p=> p.username === userInput && p.password === passInput);
    if(found){
      localStorage.setItem('jugadorActivo', found.username);
      window.location='jugador_home.html'; return;
    }
    // username exact but wrong password?
    let userExact = db.players.find(p=> p.username === userInput);
    if(userExact && userExact.password !== passInput){
      document.getElementById('loginJugadorError').innerText='❌ Contraseña incorrecta para el usuario especificado.';
      return;
    }
    // case-insensitive fallback: username and password both tried case-insensitive
    let foundCI = db.players.find(p=> p.username.toLowerCase() === userInput.toLowerCase() && p.password.toLowerCase() === passInput.toLowerCase());
    if(foundCI){
      localStorage.setItem('jugadorActivo', foundCI.username);
      window.location='jugador_home.html'; return;
    }
    // username case-insensitive exists but password wrong
    let userCI = db.players.find(p=> p.username.toLowerCase() === userInput.toLowerCase());
    if(userCI && userCI.password.toLowerCase() !== passInput.toLowerCase()){
      document.getElementById('loginJugadorError').innerText='❌ Contraseña incorrecta (prueba mayúsculas/minúsculas).';
      return;
    }
    document.getElementById('loginJugadorError').innerText='❌ Usuario no encontrado. Revisa tu usuario o contacta con el admin.';
  }).catch(err=>{
    document.getElementById('loginJugadorError').innerText='❌ Error accediendo a data.json';
    console.error(err);
  });
});

function loginAdmin(){
  const u=document.getElementById('adminUser').value.trim();
  const p=document.getElementById('adminPass').value.trim();
  if(u==='admin' && p==='admin'){ window.location='admin_home.html'; }
  else document.getElementById('loginAdminError').innerText='❌ Admin incorrecto';
}
