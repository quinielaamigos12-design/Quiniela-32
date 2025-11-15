
// admin.js - improved admin panel
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
  const calcGeneral = document.getElementById('calcGeneral');
  const results = document.getElementById('results');
  const closeNow = document.getElementById('closeNow');
  const reopenNow = document.getElementById('reopenNow');
  const logout = document.getElementById('logout');

  function renderPlayers(){
    playersList.innerHTML='';
    data.players.forEach(p=>{
      const div=document.createElement('div'); div.className='item';
      div.innerHTML = `<div>${p.id}. <b>${p.name}</b> — <i>${p.password||'(empty)'}</i></div>
        <div>
          <button class="edit" data-id="${p.id}">Editar</button>
          <button class="chgpass" data-id="${p.id}">Cambiar pass</button>
          <button class="del" data-id="${p.id}">Borrar</button>
        </div>`;
      playersList.appendChild(div);
    });
    // events
    playersList.querySelectorAll('.edit').forEach(btn=> btn.addEventListener('click', ()=>{
      const id=Number(btn.dataset.id); const pl=data.players.find(x=>x.id===id);
      const newName = prompt('Nuevo nombre', pl.name);
      if(newName){ pl.name=newName; alert('Cambios en memoria. Exporta data.json para guardar.'); renderPlayers(); }
    }));
    playersList.querySelectorAll('.chgpass').forEach(btn=> btn.addEventListener('click', ()=>{
      const id=Number(btn.dataset.id); const pl=data.players.find(x=>x.id===id);
      const newPass = prompt('Nueva contraseña para '+pl.name, pl.password||'');
      if(newPass){ pl.password=newPass; alert('Contraseña modificada. Exporta data.json para guardar.'); renderPlayers(); }
    }));
    playersList.querySelectorAll('.del').forEach(btn=> btn.addEventListener('click', ()=>{
      const id=Number(btn.dataset.id); if(confirm('Borrar jugador '+id+'?')){ const idx=data.players.findIndex(x=>x.id===id); if(idx>=0) data.players.splice(idx,1); renderPlayers(); alert('Borrado en memoria. Exporta data.json.'); }
    }));
  }

  btnExport.addEventListener('click', ()=> saveDownloadDataJson(data));
  btnImport.addEventListener('click', ()=>{
    const file=importFile.files[0]; if(!file){ alert('Selecciona un JSON'); return; }
    const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(reader.result); Object.assign(data, parsed); alert('Importado en memoria'); renderPlayers(); renderJornadas(); }catch(e){ alert('JSON inválido'); } }; reader.readAsText(file);
  });

  addPlayerBtn.addEventListener('click', ()=>{
    const name=newPlayerName.value.trim(); if(!name) return alert('Escribe nombre');
    const pass = prompt('Contraseña para '+name, 'pass1234'); if(!pass) return alert('Contraseña requerida');
    const newId = (data.players.reduce((m,p)=>Math.max(m,p.id),0) || 0)+1;
    data.players.push({id:newId,name,active:true,password:pass});
    newPlayerName.value=''; renderPlayers(); alert('Jugador creado. Exporta data.json para guardar.');
  });

  createDefaultJornada.addEventListener('click', ()=>{
    const jnum=(data.jornadas.length||0)+1; const partidos=[];
    for(let i=1;i<=14;i++) partidos.push({local:'Local '+i,visitante:'Visitante '+i,resultado:null});
    data.jornadas.push({id:jnum,partidos, published:false, autoClosed:false, pronosticos:{}});
    renderJornadas(); alert('Jornada creada en memoria.');
  });

  importFromApi.addEventListener('click', async ()=>{
    const url = apiUrl.value.trim(); if(!url) return alert('Pega la URL');
    try{
      const r = await fetch(url); const json = await r.json();
      const jnum=(data.jornadas.length||0)+1;
      let partidos = (json.partidos||json.matches||json).slice(0,14).map((m)=>({local:m.home||m.local||m.homeTeam, visitante:m.away||m.visitant||m.awayTeam, resultado:null}));
      if(!partidos.length && Array.isArray(json)) partidos = json.slice(0,14);
      data.jornadas.push({id:jnum,partidos,published:false,autoClosed:false,pronosticos:{}});
      renderJornadas(); alert('Jornada importada en memoria.');
    }catch(e){ alert('Error importando: '+e.message); }
  });

  function renderJornadas(){
    jornadasList.innerHTML='';
    data.jornadas.forEach(j=>{
      const div=document.createElement('div'); div.className='item';
      div.innerHTML = `<div><b>Jornada ${j.id}</b> — partidos: ${j.partidos.length} — published: ${j.published? 'Sí':'No'} — closed: ${j.autoClosed? 'Sí':'No'}</div>
        <div>
          <button class="pub" data-id="${j.id}">Publicar resultados</button>
          <button class="toggleclose" data-id="${j.id}">${j.autoClosed? 'Reabrir':'Cerrar'}</button>
        </div>`;
      jornadasList.appendChild(div);
    });
    jornadasList.querySelectorAll('.pub').forEach(btn=> btn.addEventListener('click', ()=>{
      const id=Number(btn.dataset.id); const j=data.jornadas.find(x=>x.id===id);
      if(!j) return;
      j.partidos.forEach((p,i)=>{ const r = prompt(`Resultado partido ${i+1} (${p.local} vs ${p.visitante}) — 1 / X / 2`, p.resultado||''); if(r) p.resultado = r; });
      j.published = true; alert('Resultados guardados. Exporta data.json.'); renderJornadas();
    }));
    jornadasList.querySelectorAll('.toggleclose').forEach(btn=> btn.addEventListener('click', ()=>{
      const id=Number(btn.dataset.id); const j=data.jornadas.find(x=>x.id===id);
      if(!j) return;
      j.autoClosed = !j.autoClosed;
      if(j.autoClosed) fillMissingRandom(j);
      alert('Estado cambiado. Exporta data.json para compartir.'); renderJornadas();
    }));
  }

  function fillMissingRandom(j){
    if(!j.pronosticos) j.pronosticos={};
    data.players.forEach(p=>{
      const pron = j.pronosticos[p.name] || [];
      for(let i=0;i<j.partidos.length;i++) if(!pron[i]) pron[i] = randomChoice(['1','X','2']);
      j.pronosticos[p.name] = pron;
    });
  }

  function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  closeNow.addEventListener('click', ()=>{
    // close first non-published and not closed jornada
    const j = data.jornadas.find(x=>!x.published && !x.autoClosed);
    if(!j){ alert('No hay jornadas pendientes para cerrar'); return; }
    j.autoClosed = true; fillMissingRandom(j); alert('Jornada cerrada y pronósticos faltantes completados. Exporta data.json.'); renderJornadas();
  });

  reopenNow.addEventListener('click', ()=>{
    const j = data.jornadas.slice().reverse().find(x=>x.autoClosed);
    if(!j){ alert('No hay jornadas cerradas'); return; }
    j.autoClosed = false; alert('Jornada reabierta (recuerda exportar data.json).'); renderJornadas();
  });

  calcGeneral.addEventListener('click', ()=>{
    // compute totals
    const totals = {};
    data.players.forEach(p=> totals[p.name] = {aciertos:0, multas:0, saldoBase:50});
    data.jornadas.forEach(j=>{
      if(!j.partidos) return;
      // compute aciertos per player this jornada
      const playersAci = [];
      data.players.forEach(pl=>{
        const pron = (j.pronosticos && j.pronosticos[pl.name]) || [];
        let ac=0;
        for(let i=0;i<j.partidos.length;i++){
          const r = j.partidos[i].resultado;
          if(!r) continue;
          if(pron[i] && pron[i]===r) ac++;
        }
        playersAci.push({name:pl.name, aciertos:ac});
      });
      // sort asc to find last and penult
      const asc = playersAci.slice().sort((a,b)=>a.aciertos-b.aciertos);
      if(asc.length>=1) totals[asc[0].name].multas += 2;
      if(asc.length>=2) totals[asc[1].name].multas += 1;
      // everyone pays 1€ fixed per jornada
      playersAci.forEach(pa=> totals[pa.name].multas += 1);
      // add aciertos to totals
      playersAci.forEach(pa=> totals[pa.name].aciertos += pa.aciertos);
    });
    // build result text
    const arr = Object.keys(totals).map(n=> ({name:n, aciertos:totals[n].aciertos, multas:totals[n].multas, saldo: totals[n].saldoBase - totals[n].multas}));
    arr.sort((a,b)=>b.aciertos - a.aciertos);
    let out = 'Clasificación General (aciertos / multas / saldo)\n\n';
    arr.forEach(a=> out += `${a.name}: ${a.aciertos} aciertos — ${a.multas} € multas — Saldo: ${a.saldo} €\n`);
    results.textContent = out;
  });

  logout.addEventListener('click', ()=>{ sessionStorage.removeItem('session'); window.location.href='index.html'; });

  // initial render
  renderPlayers();
  renderJornadas();

})();
