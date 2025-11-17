
function loadData(){ return fetch('data.json').then(r=>r.json()); }

function renderJornada1(){
  loadData().then(db=>{
    const j = db.jornadas && db.jornadas[0];
    if(!j) return;
    const matchesDiv = document.getElementById('matches');
    matchesDiv.innerHTML = '<ol>'+Object.values(j.partidos).map(s=>'<li>'+s+'</li>').join('')+'</ol>';

    const tableDiv = document.getElementById('table');
    let html = '<table class="pron-table"><thead><tr><th>Jugador</th>';
    for(let i=1;i<=14;i++) html += '<th>'+i+'</th>';
    html += '<th>Aciertos</th></tr></thead><tbody>';
    db.players.forEach(player=>{
      html += '<tr><td>'+player.username+'</td>';
      let aciertos=0;
      for(let i=1;i<=14;i++){
        const p = j.pronosticos[player.username] ? j.pronosticos[player.username][String(i)] : '';
        let cls = p? 'filled':'empty';
        html += '<td class="'+cls+'">'+(p||'')+'</td>';
      }
      html += '<td>'+aciertos+'</td></tr>';
    });
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
  });
}

function renderMyPron(){
  loadData().then(db=>{
    const user = localStorage.getItem('jugadorActivo');
    if(!user){ document.getElementById('mypron').innerHTML='Inicia sesión'; return; }
    const j = db.jornadas && db.jornadas[0];
    if(!j){ document.getElementById('mypron').innerHTML='No hay jornadas'; return; }
    const my = j.pronosticos[user] || {};
    let html = '<form id="myForm"><table class="edit-table"><tr><th>Partido</th><th>Tu Pronóstico</th></tr>';
    for(let i=1;i<=14;i++){
      const val = my[String(i)] || '';
      html += '<tr><td>'+j.partidos[String(i)]+'</td><td><select name="'+i+'"><option value="">--</option><option value="1">1</option><option value="X">X</option><option value="2">2</option></select></td></tr>';
    }
    html += '</table></form>';
    document.getElementById('mypron').innerHTML = html;
    document.getElementById('saveBtn')?.addEventListener('click', ()=> saveMyPron());
  });
}

function saveMyPron(){
  const form = document.getElementById('myForm');
  const data = {};
  for(let i=1;i<=14;i++){
    const val = form.querySelector('select[name="'+i+'"]').value;
    data[String(i)] = val;
  }
  loadData().then(db=>{
    const user = localStorage.getItem('jugadorActivo');
    if(!user){ alert('Inicia sesión'); return; }
    db.jornadas[0].pronosticos[user] = data;
    // save to localStorage as proxy (admin must export to repo to publish)
    localStorage.setItem('data_working', JSON.stringify(db));
    alert('Pronósticos guardados en memoria. Pide al admin exportar data.json para hacerlos globales.');
  });
}

document.addEventListener('DOMContentLoaded', function(){
  if(document.getElementById('matches')) renderJornada1();
  if(document.getElementById('mypron')) renderMyPron();
  if(document.getElementById('aciertos')) renderAciertos();
  if(document.getElementById('perfil')) renderPerfil();
});

function renderAciertos(){
  loadData().then(db=>{
    const out = document.getElementById('aciertos');
    if(!out) return;
    out.innerHTML = '<p>Función de aciertos pendiente (se calculará cuando cargues resultados)</p>';
  });
}

function renderPerfil(){
  loadData().then(db=>{
    const out = document.getElementById('perfil');
    const user = localStorage.getItem('jugadorActivo');
    if(!user){ out.innerHTML='Inicia sesión'; return; }
    const p = db.players.find(x=>x.username===user);
    out.innerHTML = '<p><strong>'+p.name+'</strong></p><p>Saldo: '+p.saldo+' €</p>';
  });
}
