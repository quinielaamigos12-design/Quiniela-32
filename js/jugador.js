
// jugador.js - improved player area
(async function(){
  const data = await loadData();
  const url = new URL(window.location.href);
  const user = sessionStorage.getItem('session') || url.searchParams.get('user');
  if(!user){ window.location.href='index.html'; return; }
  document.getElementById('playerName').textContent = user;

  const selectJornada = document.getElementById('selectJornada');
  const partidosArea = document.getElementById('partidosArea');
  const savePron = document.getElementById('savePron');
  const showAll = document.getElementById('showAll');
  const allPron = document.getElementById('allPron');
  const btnLogout = document.getElementById('btnLogout');
  const playerSaldo = document.getElementById('playerSaldo');

  // Auto-close logic: if today is Thursday and hour >= 16, close next pending jornada
  function checkAutoClose(){
    const now = new Date();
    const day = now.getDay(); // 4 = Thursday
    const hour = now.getHours();
    if(day===4 && hour>=16){
      // find first non-published and not autoClosed
      const j = data.jornadas.find(x=>!x.published && !x.autoClosed);
      if(j){ j.autoClosed = true; fillMissingRandom(j); console.log('Auto-closed jornada', j.id); }
    }
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

  function renderJornadas(){
    selectJornada.innerHTML='';
    data.jornadas.forEach(j=>{
      const opt=document.createElement('option'); opt.value=j.id; opt.textContent = `Jornada ${j.id} ${j.published? '(Resultados)':''} ${j.autoClosed? '(CERRADA)':''}`;
      selectJornada.appendChild(opt);
    });
    if(data.jornadas.length===0) selectJornada.innerHTML='<option value="">No hay jornadas</option>';
    renderPartidos();
  }

  function renderPartidos(){
    partidosArea.innerHTML='';
    const jid = Number(selectJornada.value);
    const j = data.jornadas.find(x=>x.id===jid);
    if(!j){ partidosArea.innerHTML='Selecciona una jornada'; return; }
    const isClosed = !!j.autoClosed;
    for(let i=0;i<j.partidos.length;i++){
      const p = j.partidos[i];
      const val = (j.pronosticos && j.pronosticos[user]) ? (j.pronosticos[user][i]||'') : '';
      const div=document.createElement('div'); div.className='item';
      div.innerHTML = `<div>${i+1}. ${p.local} vs ${p.visitante}</div><div><select id="sel_${i}" ${isClosed? 'disabled':''}>
        <option value="">--</option><option value="1">1</option><option value="X">X</option><option value="2">2</option></select></div>`;
      partidosArea.appendChild(div);
      if(val) document.getElementById('sel_'+i).value = val;
    }
    // show reason if closed
    if(isClosed) partidosArea.insertAdjacentHTML('beforeend','<div class="muted small">La jornada está cerrada — no se pueden editar pronósticos.</div>');
  }

  selectJornada.addEventListener('change', renderPartidos);

  savePron.addEventListener('click', ()=>{
    const jid = Number(selectJornada.value);
    const j = data.jornadas.find(x=>x.id===jid);
    if(!j) return alert('Selecciona jornada');
    if(j.autoClosed) return alert('Jornada cerrada. No puedes guardar pronósticos.');
    const lista=[];
    for(let i=0;i<j.partidos.length;i++){
      const v = document.getElementById('sel_'+i).value || '';
      lista.push(v);
    }
    if(!j.pronosticos) j.pronosticos={};
    j.pronosticos[user]=lista;
    alert('Pronósticos guardados en memoria. Pide al admin que exporte data.json para compartir.');
    renderPartidos();
  });

  showAll.addEventListener('click', ()=>{
    const jid = Number(selectJornada.value); const j = data.jornadas.find(x=>x.id===jid);
    if(!j) return alert('Selecciona jornada');
    const pron = j.pronosticos || {};
    let out=''; Object.keys(pron).forEach(player=> out += player + ': ' + JSON.stringify(pron[player]) + '\n');
    allPron.textContent = out || 'No hay pronósticos';
  });

  btnLogout.addEventListener('click', ()=>{ sessionStorage.removeItem('session'); window.location.href='index.html'; });

  function calcSaldoForPlayer(name){
    let saldo = 50;
    data.jornadas.forEach(j=>{
      if(!j.partidos) return;
      // compute aciertos only if results published
      // but fines apply per jornada regardless
      // check player's pronos exist
      const pron = (j.pronosticos && j.pronosticos[name]) || [];
      // determine aciertos if results present
      let ac=0;
      for(let i=0;i<j.partidos.length;i++){
        const r = j.partidos[i].resultado;
        if(!r) continue;
        if(pron[i] && pron[i]===r) ac++;
      }
      // fines: find last and penult if results present; otherwise skip last/penult fines until results exist
      if(j.partidos.some(p=>p.resultado)){
        // compute aciertos per player to rank
        // build array
      }
      // everyone pays 1€ fixed per jornada participation
      saldo -= 1;
    });
    return saldo;
  }

  // run auto-close on load
  checkAutoClose();
  renderJornadas();

  // display saldo quick (simple)
  const sessionName = user;
  playerSaldo.textContent = 'Saldo inicial: 50 € (se descuentan multas al calcular clasificación general en admin)';
})();
