
/* Main JS for Quiniela32 V25 - client-side SPA */

let DATA = null;
let activeJ = 1;
const currentUserKey = 'quiniela_user';

async function loadData(){
  const res = await fetch('data.json');
  DATA = await res.json();
  // ensure pronosticos objects exist
  DATA.jornadas.forEach(j=>{ j.pronosticos = j.pronosticos || {}; j.resultados = j.resultados || {}; });
  renderAll();
}

function renderAll(){
  renderTabs();
  setActive(activeJ);
  renderJornadasList();
  document.getElementById('currentUser').textContent = currentUser();
  updateStats();
  updateResultPanel();
}

function renderTabs(){
  const container = document.getElementById('jornadaTabs');
  container.innerHTML='';
  DATA.jornadas.forEach(j=>{
    const b = document.createElement('button'); b.className = 'tab' + (j.id===activeJ?' active':''); b.textContent = j.nombre;
    b.onclick = ()=> setActive(j.id);
    container.appendChild(b);
  });
}

function setActive(id){
  activeJ = id;
  document.getElementById('activeJLabel').textContent = id;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  [...document.querySelectorAll('.tab')].find(t => t.textContent.includes(id))?.classList.add('active');
  renderMatches();
  updateFechaText();
  localStorage.setItem('quiniela_active', activeJ);
}

function renderMatches(){
  const list = document.getElementById('matchesList');
  list.innerHTML='';
  const jornada = DATA.jornadas.find(x=>x.id===activeJ);
  Object.entries(jornada.partidos).forEach(([idx,desc])=>{
    const div = document.createElement('div'); div.className='match';
    const left = document.createElement('div'); left.innerHTML = '<strong>'+idx+'.</strong> '+desc;
    const right = document.createElement('div'); right.className='choices';
    ['1','X','2'].forEach(opt=>{
      const ch = document.createElement('div'); ch.className='choice'; ch.textContent = opt;
      const userPron = jornada.pronosticos[currentUser()] && jornada.pronosticos[currentUser()][idx];
      if(userPron===opt) ch.classList.add('selected');
      ch.onclick = ()=> { toggleChoice(idx,opt); // re-render selection visuals
        [...right.children].forEach(c=>c.classList.remove('selected'));
        ch.classList.add('selected');
      };
      right.appendChild(ch);
    });
    div.appendChild(left); div.appendChild(right); list.appendChild(div);
  });
}

function toggleChoice(idx,opt){
  const j = DATA.jornadas.find(x=>x.id===activeJ);
  if(!j.pronosticos[currentUser()]) j.pronosticos[currentUser()] = {};
  j.pronosticos[currentUser()][idx] = opt;
  saveLocalData();
}

function saveLocalData(){
  localStorage.setItem('quiniela_data', JSON.stringify(DATA));
  updateStats();
}

function currentUser(){ return localStorage.getItem(currentUserKey) || 'INVITADO'; }

function updateFechaText(){ const j = DATA.jornadas.find(x=>x.id===activeJ); document.getElementById('fechaText').textContent = j.id + ' — ' + (j.fecha || '--'); }

// Login modal logic (jugador/admin unified)
document.addEventListener('click', (e)=>{
  if(e.target.matches('#openLogin')) document.getElementById('loginModal').style.display='flex';
  if(e.target.matches('#closeLogin')) document.getElementById('loginModal').style.display='none';
});

document.getElementById('doLogin').addEventListener('click', ()=>{
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const role = document.getElementById('loginRole').value;
  if(role === 'admin'){
    // simple admin check
    if((user==='admin' && pass==='admin') || (user==='ADMIN' && pass==='ADMIN1234')){ localStorage.setItem(currentUserKey,'ADMIN'); location.href='admin_home.html'; }
    else document.getElementById('loginError').textContent = 'Admin incorrecto';
    return;
  }
  // jugador login (case-insensitive fallback)
  const p = DATA.players.find(x=> x.username === user && x.password === pass) ||
            DATA.players.find(x=> x.username.toLowerCase()===user.toLowerCase() && x.password.toLowerCase()===pass.toLowerCase());
  if(p){ localStorage.setItem(currentUserKey, p.username); document.getElementById('currentUser').textContent = p.username; document.getElementById('loginModal').style.display='none'; loadProfileToForm(); renderMatches(); }
  else document.getElementById('loginError').textContent = 'Usuario no encontrado o contraseña errónea';
});

// Profile save/load
function loadProfileToForm(){
  const u = currentUser();
  if(u==='INVITADO') return;
  const users = JSON.parse(localStorage.getItem('quiniela_users')||'{}');
  const p = users[u] || DATA.players.find(x=>x.username===u) || {name:u,email:'',pass:''};
  document.getElementById('perfilNombre').value = p.name || u;
  document.getElementById('perfilEmail').value = p.email || '';
  document.getElementById('perfilPass').value = users[u] ? users[u].pass || '' : '';
}

document.getElementById('saveProfile').addEventListener('click', ()=>{
  const u = currentUser();
  if(u==='INVITADO'){ alert('Inicia sesión para editar tu perfil'); return; }
  const users = JSON.parse(localStorage.getItem('quiniela_users')||'{}');
  users[u] = users[u] || {};
  users[u].name = document.getElementById('perfilNombre').value.trim() || u;
  users[u].email = document.getElementById('perfilEmail').value.trim();
  users[u].pass = document.getElementById('perfilPass').value;
  localStorage.setItem('quiniela_users', JSON.stringify(users));
  alert('Perfil guardado localmente');
  document.getElementById('currentUser').textContent = users[u].name;
});

document.getElementById('resetProfile').addEventListener('click', ()=>{ loadProfileToForm(); });

// Results modal
document.getElementById('editResults').addEventListener('click', openResults);
function openResults(){
  const modal = document.getElementById('resultsModal'); modal.style.display='flex';
  document.getElementById('resJ').textContent = activeJ;
  const container = document.getElementById('resInputs'); container.innerHTML='';
  const jornada = DATA.jornadas.find(x=>x.id===activeJ);
  Object.keys(jornada.partidos).forEach(i=>{
    const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center'; row.style.marginBottom='6px';
    row.innerHTML = '<div style="width:40px">'+i+'.</div>';
    ['1','X','2'].forEach(opt=>{
      const inp = document.createElement('input'); inp.type='radio'; inp.name='res'+i; inp.value = opt;
      if(jornada.resultados && jornada.resultados[i]===opt) inp.checked=true;
      const lab = document.createElement('label'); lab.style.marginRight='8px'; lab.textContent = opt;
      row.appendChild(inp); row.appendChild(lab);
    });
    container.appendChild(row);
  });
}

document.getElementById('closeResults').addEventListener('click', ()=>{ document.getElementById('resultsModal').style.display='none'; });
document.getElementById('saveResults').addEventListener('click', ()=>{
  const jornada = DATA.jornadas.find(x=>x.id===activeJ);
  Object.keys(jornada.partidos).forEach(i=>{
    const sel = document.querySelector('input[name=res'+i+']:checked');
    if(sel) jornada.resultados[i] = sel.value;
  });
  saveLocalData();
  document.getElementById('resultsModal').style.display='none';
  updateResultPanel();
  checkAutoAdvance();
});

function updateResultPanel(){
  const j = DATA.jornadas.find(x=>x.id===activeJ);
  if(!j.resultados || Object.keys(j.resultados).length===0){ document.getElementById('resultPanel').textContent='Sin resultados'; return; }
  document.getElementById('resultPanel').textContent = Object.entries(j.resultados).map(([i,v])=> i+': '+v).join(' | ');
}

function calcAciertosForUser(u, jornada){
  const j = jornada || DATA.jornadas.find(x=>x.id===activeJ);
  const res = j.resultados || {};
  const pron = j.pronosticos[u] || {};
  let cnt = 0;
  for(const k in res){ if(pron[k] && pron[k].toUpperCase()===res[k].toUpperCase()) cnt++; }
  return cnt;
}

function updateStats(){
  const u = currentUser();
  const total = DATA.jornadas.reduce((acc,j)=> acc + calcAciertosForUser(u,j), 0);
  document.getElementById('statsText').textContent = 'Aciertos totales: ' + total;
  renderAciertosArea();
}

function renderAciertosArea(){
  const area = document.getElementById('aciertosArea'); area.innerHTML='';
  const tabla = document.createElement('table'); tabla.style.width='100%'; tabla.style.borderCollapse='collapse';
  const head = document.createElement('tr'); head.innerHTML = '<th>Jugador</th><th>Aciertos</th>'; tabla.appendChild(head);
  DATA.players.forEach(p=>{
    const tr = document.createElement('tr'); tr.innerHTML = '<td>'+p.username+'</td><td>'+ DATA.jornadas.reduce((s,j)=> s + calcAciertosForUser(p.username,j),0) +'</td>';
    tabla.appendChild(tr);
  });
  area.appendChild(tabla);
}

function renderJornadasList(){
  const el = document.getElementById('jornadasList'); el.innerHTML='';
  DATA.jornadas.forEach(j=>{
    const card = document.createElement('div'); card.className='card'; card.style.marginBottom='8px';
    card.innerHTML = '<strong>'+j.nombre+'</strong> — '+(j.fecha||'--')+'<div style="margin-top:6px"><button class="btn" onclick="setActive('+j.id+')">Ver</button></div>';
    el.appendChild(card);
  });
}

function checkAutoAdvance(){
  const j = DATA.jornadas.find(x=>x.id===activeJ);
  const total = Object.keys(j.partidos).length;
  const have = Object.keys(j.resultados||{}).length;
  if(have>0 && have>=total){
    if(activeJ < DATA.jornadas.length) { setActive(activeJ+1); alert('Todos los resultados están disponibles; avanzando a la siguiente jornada.'); }
  }
}

// draggable fecha
(function(){ const el = document.getElementById('fecha'); let dragging=false, offset={x:0,y:0}; el.addEventListener('pointerdown', e=>{ dragging=true; el.classList.add('dragging'); offset.x = e.clientX - el.getBoundingClientRect().left; offset.y = e.clientY - el.getBoundingClientRect().top; el.setPointerCapture && el.setPointerCapture(e.pointerId); }); window.addEventListener('pointermove', e=>{ if(!dragging) return; el.style.position='absolute'; el.style.left = (e.clientX - offset.x) + 'px'; el.style.top = (e.clientY - offset.y) + 'px'; }); window.addEventListener('pointerup', e=>{ if(!dragging) return; dragging=false; el.classList.remove('dragging'); localStorage.setItem('fecha_pos', JSON.stringify({left:el.style.left, top:el.style.top})); el.releasePointerCapture && el.releasePointerCapture(e.pointerId); }); const pos = localStorage.getItem('fecha_pos'); if(pos){ const p = JSON.parse(pos); el.style.position='absolute'; el.style.left = p.left; el.style.top = p.top; } })();

// accent color
document.getElementById('accentPicker').addEventListener('input', e=> document.documentElement.style.setProperty('--accent', e.target.value));
// menu toggle
document.getElementById('menuBtn').addEventListener('click', ()=> document.querySelector('.sidebar').classList.toggle('open'));
// navigation
document.querySelectorAll('.nav-item').forEach(b=> b.addEventListener('click', ()=>{ document.querySelectorAll('.nav-item').forEach(n=> n.classList.remove('active')); b.classList.add('active'); const sec = b.getAttribute('data-section'); document.querySelectorAll('.section').forEach(s=> s.style.display='none'); document.getElementById(sec).style.display='block'; }));
// init load
(function(){ const sv = localStorage.getItem('quiniela_active'); if(sv) activeJ = Number(sv); loadData(); window.Q_DATA = DATA; })();
