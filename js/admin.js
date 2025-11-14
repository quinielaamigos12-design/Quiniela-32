
// admin.js - admin panel features: import/export, manage players, jornadas
(async function(){
  const data = await loadData();
  // elements
  const btnExport = document.getElementById('btnExport');
  const importFile = document.getElementById('importFile');
  const btnImport = document.getElementById('btnImport');
  const playersList = document.getElementById('playersList');
  const addPlayerBtn = document.getElementById('addPlayerBtn');
  const newPlayerName = document.getElementById('newPlayerName');
  const createDefaultJornada = document.getElementById('createDefaultJornada');
  const importFromApi = document.getElementById('importFromApi');
  const apiUrl = document.getElementById('apiUrl');
  const jornadasList = document.getElementById('jornadasList');
  const calcBtn = document.getElementById('calcBtn');
  const results = document.getElementById('results');
  const logout = document.getElementById('logout');

  function renderPlayers(){
    playersList.innerHTML = '';
    data.players.forEach(p=>{
      const d = document.createElement('div');
      d.innerHTML = `${p.id}. <b>${p.name}</b> — pass: <i>${p.password || '(empty)'}</i>
       <button data-id="${p.id}" class="edit">Editar</button>
       <button data-id="${p.id}" class="del">Borrar</button>`;
      playersList.appendChild(d);
    });
    // attach events
    playersList.querySelectorAll('.edit').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.getAttribute('data-id'));
        const pl = data.players.find(x=>x.id===id);
        const newName = prompt('Nuevo nombre', pl.name);
        if(newName) { pl.name = newName; alert('Cambios en memoria. Exporta data.json para guardar.'); renderPlayers(); }
      });
    });
    playersList.querySelectorAll('.del').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.getAttribute('data-id'));
        if(confirm('Borrar jugador '+id+'?')){
          const idx = data.players.findIndex(x=>x.id===id);
          if(idx>=0) data.players.splice(idx,1);
          alert('Borrado en memoria. Exporta data.json para guardar.');
          renderPlayers();
        }
      });
    });
  }

  btnExport.addEventListener('click', ()=>{
    saveDownloadDataJson(data);
  });

  btnImport.addEventListener('click', ()=>{
    const file = importFile.files[0];
    if(!file){ alert('Selecciona un archivo JSON'); return; }
    const reader = new FileReader();
    reader.onload = ()=> {
      try{
        const parsed = JSON.parse(reader.result);
        // replace data in memory
        Object.assign(data, parsed);
        alert('data.json importado en memoria. Ahora verás cambios.');
        renderPlayers();
        renderJornadas();
      }catch(e){ alert('JSON inválido'); }
    };
    reader.readAsText(file);
  });

  addPlayerBtn.addEventListener('click', ()=>{
    const name = newPlayerName.value.trim();
    if(!name) return alert('Escribe nombre');
    const newId = (data.players.reduce((m,p)=>Math.max(m,p.id),0) || 0)+1;
    data.players.push({id:newId,name,active:true,password:'pass1234'});
    newPlayerName.value='';
    renderPlayers();
    alert('Jugador creado en memoria. No olvides exportar data.json para que sea compartido.');
  });

  createDefaultJornada.addEventListener('click', ()=>{
    const jnum = (data.jornadas.length || 0) + 1;
    const partidos = [];
    for(let i=1;i<=14;i++){
      partidos.push({local:'Local '+i, visitante:'Visitante '+i, resultado:null});
    }
    data.jornadas.push({id:jnum, partidos, published:false});
    renderJornadas();
    alert('Jornada creada en memoria. Exporta data.json para compartir.');
  });

  importFromApi.addEventListener('click', async ()=>{
    const url = apiUrl.value.trim();
    if(!url) return alert('Pega la URL');
    try{
      const r = await fetch(url);
      const json = await r.json();
      // expect json.partidos array of {local, visitante}
      const jnum = (data.jornadas.length || 0)+1;
      const partidos = (json.partidos || json.matches || []).slice(0,14).map(m=>({local:m.home||m.local||m.localTeam||m.homeTeam,name:'',visitante:m.away||m.visitant||m.awayTeam||m.away}));
      // fallback simple map
      if(partidos.length===0 && Array.isArray(json)) partidos = json.slice(0,14);
      data.jornadas.push({id:jnum, partidos, published:false});
      renderJornadas();
      alert('Jornada importada (en memoria). Exporta data.json para compartir.');
    }catch(e){
      alert('Error importando: '+e.message);
    }
  });

  function renderJornadas(){
    jornadasList.innerHTML='';
    data.jornadas.forEach(j=>{
      const d = document.createElement('div');
      d.innerHTML = `<b>Jornada ${j.id}</b> (partidos: ${j.partidos.length}) — published: ${j.published}
      <button data-id="${j.id}" class="pub">Publicar resultados</button>`;
      jornadasList.appendChild(d);
    });
    jornadasList.querySelectorAll('.pub').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.getAttribute('data-id'));
        const j = data.jornadas.find(x=>x.id===id);
        if(!j) return;
        // ask admin to enter results for each match
        j.partidos.forEach((p,i)=>{
          const r = prompt(`Resultado partido ${i+1} (${p.local} vs ${p.visitante}) — escribe 1 / X / 2`, p.resultado||'');
          if(r) p.resultado = r;
        });
        j.published = true;
        alert('Resultados guardados en memoria. Exporta data.json para compartir a todos.');
        renderJornadas();
      });
    });
  }

  calcBtn.addEventListener('click', ()=>{
    // compute aciertos for last published jornada
    const lastPublished = [...data.jornadas].reverse().find(j=>j.published);
    if(!lastPublished){ results.textContent='No hay jornadas publicadas.'; return; }
    const res = {};
    data.players.forEach(p=> res[p.name]=0);
    // pronosticos stored in lastPublished.pronosticos {playerName: ['1','X',...]}
    (lastPublished.pronosticos||{}); // may be undefined
    const table = [];
    data.players.forEach(player=>{
      const pronos = (lastPublished.pronosticos && lastPublished.pronosticos[player.name]) || [];
      let aciertos=0;
      for(let i=0;i<lastPublished.partidos.length;i++){
        const real = lastPublished.partidos[i].resultado;
        if(!real) continue;
        if(pronos[i] && pronos[i]===real) aciertos++;
      }
      table.push({player:player.name, aciertos});
    });
    table.sort((a,b)=>b.aciertos-a.aciertos);
    // apply multas: last and penultimate
    const orderedAsc = [...table].sort((a,b)=>a.aciertos-b.aciertos);
    if(orderedAsc.length>=1) orderedAsc[0].multa=2;
    if(orderedAsc.length>=2) orderedAsc[1].multa=1;
    results.textContent = 'Clasificación (última jornada):\\n' + table.map(t=>`${t.player}: ${t.aciertos} aciertos`).join('\\n') + '\\n\\nMultas:\\n' + (orderedAsc.map(o=>`${o.player}: ${o.multa||0} €`).join('\\n'));
  });

  logout.addEventListener('click', ()=>{
    sessionStorage.removeItem('session');
    window.location.href='index.html';
  });

  // initial render
  renderPlayers();
  renderJornadas();

})();
