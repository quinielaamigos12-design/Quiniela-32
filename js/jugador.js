
// jugador.js - player area: select jornada, input pronostics, export for admin
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

  function renderJornadas(){
    selectJornada.innerHTML = '';
    data.jornadas.forEach(j=>{
      const opt = document.createElement('option');
      opt.value = j.id;
      opt.textContent = `Jornada ${j.id} ${j.published ? '(Resultados publicados)':''}`;
      selectJornada.appendChild(opt);
    });
    if(data.jornadas.length===0) selectJornada.innerHTML = '<option value="">No hay jornadas</option>';
    renderPartidos();
  }

  function renderPartidos(){
    partidosArea.innerHTML = '';
    const jid = Number(selectJornada.value);
    const j = data.jornadas.find(x=>x.id===jid);
    if(!j){ partidosArea.innerHTML='Selecciona una jornada'; return; }
    j.partidos.forEach((p,i)=>{
      const val = (j.pronosticos && j.pronosticos[user]) ? (j.pronosticos[user][i]||'') : '';
      const div = document.createElement('div');
      div.innerHTML = `${i+1}. ${p.local} vs ${p.visitante} — <select id="sel_${i}"><option value="">--</option><option value="1">1</option><option value="X">X</option><option value="2">2</option></select>`;
      partidosArea.appendChild(div);
      if(val) document.getElementById('sel_'+i).value = val;
    });
  }

  selectJornada.addEventListener('change', renderPartidos);

  savePron.addEventListener('click', ()=>{
    const jid = Number(selectJornada.value);
    const j = data.jornadas.find(x=>x.id===jid);
    if(!j) return alert('Selecciona jornada');
    const lista = [];
    for(let i=0;i<j.partidos.length;i++){
      const v = document.getElementById('sel_'+i).value || '';
      lista.push(v);
    }
    if(!j.pronosticos) j.pronosticos = {};
    j.pronosticos[user] = lista;
    alert('Pronósticos guardados en memoria. Pide al admin que exporte data.json para compartirlos con todos.');
  });

  showAll.addEventListener('click', ()=>{
    const jid = Number(selectJornada.value);
    const j = data.jornadas.find(x=>x.id===jid);
    if(!j) return alert('Selecciona jornada');
    const pron = j.pronosticos || {};
    let out = '';
    Object.keys(pron).forEach(player=>{
      out += player + ': ' + JSON.stringify(pron[player]) + '\\n';
    });
    allPron.textContent = out || 'No hay pronósticos';
  });

  btnLogout.addEventListener('click', ()=>{
    sessionStorage.removeItem('session');
    window.location.href='index.html';
  });

  renderJornadas();

})();
