
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
