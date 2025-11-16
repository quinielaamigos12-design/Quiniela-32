
// Admin panel script - enhanced: shows players from data.json + localStorage, allows import
async function loadAndRenderPlayers(){
  let data = {};
  try{
    const resp = await fetch('data.json');
    data = await resp.json();
  }catch(e){
    console.warn('No data.json');
  }
  const basePlayers = data.players || [];
  const stored = JSON.parse(localStorage.getItem('app_players')||'[]');
  const merged = [...basePlayers, ...stored];
  // Remove duplicates by username
  const map = {};
  merged.forEach(p=>{ if(p && p.username) map[p.username]=p; });
  const players = Object.values(map);
  const tbody = document.getElementById('playersBody');
  tbody.innerHTML = '';
  players.forEach((p,idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${p.username||p.name||''}</td><td>${p.name||''}</td><td>${p.email||''}</td><td><button class="secondary" data-user="${p.username}">Editar</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('playersCount').textContent = players.length + ' usuarios';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const importBtn = document.getElementById('importBtn');
  if(importBtn){
    importBtn.addEventListener('click', ()=>{
      const txt = document.getElementById('importArea').value.trim();
      if(!txt) return alert('Pega la lista de usuarios (numero nombre contraseña) en el área y pulsa Importar.');
      const lines = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const parsed = [];
      lines.forEach(line=>{
        // accept "numero nombre contraseña" or "username password" or "username,name,password"
        let parts = line.split(/\s+/);
        if(parts.length>=3){
          parsed.push({ username: parts[1], name: parts[1], password: parts[2], email: ''});
        } else {
          parts = line.split(',');
          if(parts.length>=2) parsed.push({ username: parts[0].trim(), name: parts[1].trim(), password: parts[2]||'', email: ''});
        }
      });
      const existing = JSON.parse(localStorage.getItem('app_players')||'[]');
      const combined = existing.concat(parsed);
      localStorage.setItem('app_players', JSON.stringify(combined));
      document.getElementById('importArea').value = '';
      loadAndRenderPlayers();
      alert('Importación completada. Revisa la lista abajo.');
    });
  }

  // Render players table
  loadAndRenderPlayers();
});


// --- Procesamiento económico semanal ---
function parseAciertosText(txt){
  const lines = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const map = {};
  lines.forEach(line=>{
    const parts = line.split(/\s+/);
    if(parts.length>=2){
      const user = parts[0].toUpperCase();
      const aciertos = parseInt(parts[1],10) || 0;
      map[user]=aciertos;
    }
  });
  return map;
}

function aplicarDescuentos(semana, aciertosMap){
  // load players from data.json via fetch to get file copy, but primary store is localStorage 'app_players' merged with data.players
  fetch('data.json').then(r=>r.json()).then(data=>{
    const basePlayers = data.players || [];
    const stored = JSON.parse(localStorage.getItem('app_players')||'[]');
    const mergedMap = {};
    basePlayers.concat(stored).forEach(p=>{ if(p && p.username) mergedMap[p.username.toUpperCase()] = Object.assign({}, p); });
    const players = Object.values(mergedMap);
    // ensure saldo field
    players.forEach(p=>{ if(typeof p.saldo === 'undefined') p.saldo = 50; });
    // build aciertos array
    const arr = players.map(p=>({ username: p.username.toUpperCase(), aciertos: aciertosMap[p.username.toUpperCase()] || 0 }));
    // determine min and second min
    const sorted = arr.slice().sort((a,b)=>a.aciertos - b.aciertos);
    const minVal = sorted.length? sorted[0].aciertos : 0;
    // find all with minVal
    const worst = sorted.filter(x=>x.aciertos===minVal).map(x=>x.username);
    // second min value (first value > minVal)
    const second = sorted.find(x=>x.aciertos>minVal);
    const secondVal = second? second.aciertos : null;
    const secondWorst = secondVal===null? [] : sorted.filter(x=>x.aciertos===secondVal).map(x=>x.username);

    // apply deductions: -1 € all, -2 to worst, -1 to second worst
    const changes = [];
    players.forEach(p=>{
      const uname = p.username.toUpperCase();
      const before = p.saldo || 0;
      let deduction = 1; // weekly fee
      if(worst.includes(uname)) deduction += 2;
      else if(secondWorst.includes(uname)) deduction += 1;
      p.saldo = Math.max(0, (p.saldo||0) - deduction);
      changes.push({ usuario: uname, saldoAntes: before, deducido: deduction, saldoDespues: p.saldo, aciertos: aciertosMap[uname] || 0 });
    });

    // save updated players to localStorage app_players (admin can export to data.json)
    // convert to array
    const saveArr = players.map(p=>({ username: p.username, name: p.name||p.displayName||p.username, password: p.password||'', email: p.email||'', saldo: p.saldo }));
    localStorage.setItem('app_players', JSON.stringify(saveArr));

    // save historial
    const hist = JSON.parse(localStorage.getItem('historial')||'{}');
    hist[semana] = changes;
    localStorage.setItem('historial', JSON.stringify(hist));

    // update UI and table
    document.getElementById('procMsg').textContent = 'Descuentos aplicados para '+semana + '. Revisa la tabla de usuarios.';
    // trigger reload of players table if function exists
    if(typeof loadAndRenderPlayers === 'function') loadAndRenderPlayers();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const procBtn = document.getElementById('procesarBtn');
  if(procBtn){
    procBtn.addEventListener('click', ()=>{
      const txt = document.getElementById('aciertosArea').value.trim();
      const semana = document.getElementById('semanaLabel').value.trim() || ('jornada-'+ new Date().toISOString().slice(0,10));
      const map = parseAciertosText(txt);
      if(Object.keys(map).length===0){
        if(!confirm('No hay aciertos detectados. ¿Quieres aplicar solo la cuota semanal a todos?')) return;
      }
      aplicarDescuentos(semana, map);
    });
  }

  const exportBtn = document.getElementById('exportDataBtn');
  if(exportBtn){
    exportBtn.addEventListener('click', ()=>{
      // export merged players to file for download
      fetch('data.json').then(r=>r.json()).then(data=>{
        const basePlayers = data.players || [];
        const stored = JSON.parse(localStorage.getItem('app_players')||'[]');
        // merge and prefer stored entries
        const map = {};
        basePlayers.forEach(p=>{ if(p && p.username) map[p.username.toUpperCase()] = p; });
        stored.forEach(p=>{ if(p && p.username) map[p.username.toUpperCase()] = p; });
        const out = Object.values(map).map(p=>({ name: p.name||p.displayName||p.username, username: p.username, password: p.password||'', email: p.email||'', saldo: p.saldo||50 }));
        const blob = new Blob([JSON.stringify({ meta: data.meta||{}, players: out, jornadas: data.jornadas||[] }, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'data_export.json'; document.body.appendChild(a); a.click(); a.remove();
      });
    });
  }

  const exportHistBtn = document.getElementById('exportHistBtn');
  if(exportHistBtn){
    exportHistBtn.addEventListener('click', ()=>{
      const hist = JSON.parse(localStorage.getItem('historial')||'{}');
      const blob = new Blob([JSON.stringify(hist, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'historial.json'; document.body.appendChild(a); a.click(); a.remove();
    });
  }
});
