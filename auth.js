function authLoginPlayer(user, pass){
  fetch('data.json').then(r=>r.json()).then(d=>{
    const p=d.players.find(x=>x.username===user && x.password===pass);
    if(!p){document.getElementById('msg').textContent='Credenciales incorrectas';return;}
    sessionStorage.setItem('currentUser',p.username);
    location='jugador_home.html';
  });
}

function authLoginAdmin(user, pass){
  if(user==='admin' && pass==='admin1234'){
    sessionStorage.setItem('currentUser','admin');
    location='admin_home.html';
  } else{
    document.getElementById('msg').textContent='Admin incorrecto';
  }
}