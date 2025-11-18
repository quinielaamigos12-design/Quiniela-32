
// Main JS with admin upload support
let DATA=null; let activeJ=1; const currentUserKey='quiniela_user';
async function loadData(){ const r=await fetch('data.json'); DATA=await r.json(); DATA.jornadas.forEach(j=>{ j.pronosticos=j.pronosticos||{}; j.resultados=j.resultados||{}; }); renderAll(); loadAdminBanner(); }
function renderAll(){ renderTabs(); setActive(activeJ); renderJornadasList(); document.getElementById('currentUser').textContent = currentUser(); updateStats(); updateResultPanel(); }
function renderTabs(){ const c=document.getElementById('jornadaTabs'); c.innerHTML=''; DATA.jornadas.forEach(j=>{ const b=document.createElement('button'); b.className='tab'+(j.id===activeJ?' active':''); b.textContent=j.nombre; b.onclick=()=>setActive(j.id); c.appendChild(b); }); }
function setActive(id){ activeJ=id; document.getElementById('activeJLabel').textContent=id; document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); [...document.querySelectorAll('.tab')].find(t=>t.textContent.includes(id))?.classList.add('active'); renderMatches(); updateFechaText(); localStorage.setItem('quiniela_active', activeJ); }
function renderMatches(){ const list=document.getElementById('matchesList'); list.innerHTML=''; const j=DATA.jornadas.find(x=>x.id===activeJ); Object.entries(j.partidos).forEach(([idx,desc])=>{ const div=document.createElement('div'); div.className='match'; const left=document.createElement('div'); left.innerHTML='<strong>'+idx+'.</strong> '+desc; const right=document.createElement('div'); right.className='choices'; ['1','X','2'].forEach(opt=>{ const ch=document.createElement('div'); ch.className='choice'; ch.textContent=opt; const userPron=j.pronosticos[currentUser()] && j.pronosticos[currentUser()][idx]; if(userPron===opt) ch.classList.add('selected'); ch.onclick=()=>{ toggleChoice(idx,opt); [...right.children].forEach(c=>c.classList.remove('selected')); ch.classList.add('selected'); }; right.appendChild(ch); }); div.appendChild(left); div.appendChild(right); list.appendChild(div); }); }
function toggleChoice(idx,opt){ const j=DATA.jornadas.find(x=>x.id===activeJ); if(!j.pronosticos[currentUser()]) j.pronosticos[currentUser()]={}; j.pronosticos[currentUser()][idx]=opt; saveLocalData(); }
function saveLocalData(){ localStorage.setItem('quiniela_data', JSON.stringify(DATA)); updateStats(); }
function currentUser(){ return localStorage.getItem(currentUserKey) || 'INVITADO'; }
function updateFechaText(){ const j=DATA.jornadas.find(x=>x.id===activeJ); document.getElementById('fechaText').textContent = j.id + ' — ' + (j.fecha||'--'); }

// admin: load and display banner & phrase
function loadAdminBanner(){
  const imgData = localStorage.getItem('quiniela_group_img');
  const frase = localStorage.getItem('quiniela_presidente_msg');
  if(imgData){
    const img = document.getElementById('groupImage'); img.src = imgData; img.style.display='block';
  }
  if(frase){
    document.getElementById('presidenteMsg').textContent = frase;
  }
}

// admin save
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id==='saveAdmin'){
    const fileInput = document.getElementById('groupUpload');
    const frase = document.getElementById('presidenteInput').value.trim();
    if(fileInput && fileInput.files && fileInput.files[0]){
      const reader = new FileReader();
      reader.onload = function(ev){
        localStorage.setItem('quiniela_group_img', ev.target.result);
        if(frase) localStorage.setItem('quiniela_presidente_msg', frase);
        loadAdminBanner();
        alert('Foto y frase guardadas');
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      if(frase){ localStorage.setItem('quiniela_presidente_msg', frase); loadAdminBanner(); alert('Frase guardada'); }
      else alert('Sube una foto o escribe una frase');
    }
  }
  if(e.target && e.target.id==='clearAdmin'){
    localStorage.removeItem('quiniela_group_img');
    localStorage.removeItem('quiniela_presidente_msg');
    document.getElementById('groupImage').style.display='none';
    document.getElementById('presidenteMsg').textContent = 'Bienvenidos a la Quiniela.';
    alert('Foto y frase eliminadas');
  }
});

// rest of app functions (results/profiles/aceirts) - kept minimal for brevity
function updateResultPanel(){ const j=DATA.jornadas.find(x=>x.id===activeJ); if(!j.resultados || Object.keys(j.resultados).length===0){ document.getElementById('resultPanel').textContent='Sin resultados'; return;} document.getElementById('resultPanel').textContent = Object.entries(j.resultados).map(([i,v])=> i+': '+v).join(' | '); }
function calcAciertosForUser(u,jornada){ const j=jornada||DATA.jornadas.find(x=>x.id===activeJ); const res=j.resultados||{}; const pron=j.pronosticos[u]||{}; let cnt=0; for(const k in res){ if(pron[k] && pron[k].toUpperCase()===res[k].toUpperCase()) cnt++; } return cnt; }
function updateStats(){ const u=currentUser(); const total=DATA.jornadas.reduce((acc,j)=> acc + calcAciertosForUser(u,j),0); document.getElementById('statsText').textContent = 'Aciertos totales: ' + total; renderAciertosArea(); }
function renderAciertosArea(){ const area=document.getElementById('aciertosArea'); area.innerHTML=''; const tabla=document.createElement('table'); tabla.style.width='100%'; const head=document.createElement('tr'); head.innerHTML='<th>Jugador</th><th>Aciertos</th>'; tabla.appendChild(head); DATA.players.forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML = '<td>'+p.username+'</td><td>'+ DATA.jornadas.reduce((s,j)=> s + calcAciertosForUser(p.username,j),0) +'</td>'; tabla.appendChild(tr); }); area.appendChild(tabla); }
function renderJornadasList(){ const el=document.getElementById('jornadasList'); el.innerHTML=''; DATA.jornadas.forEach(j=>{ const card=document.createElement('div'); card.className='card'; card.style.marginBottom='8px'; card.innerHTML='<strong>'+j.nombre+'</strong> — '+(j.fecha||'--')+'<div style="margin-top:6px"><button class="btn" onclick="setActive('+j.id+')">Ver</button></div>'; el.appendChild(card); }); }
function checkAutoAdvance(){ const j=DATA.jornadas.find(x=>x.id===activeJ); const total=Object.keys(j.partidos).length; const have=Object.keys(j.resultados||{}).length; if(have>0 && have>=total){ if(activeJ<DATA.jornadas.length){ setActive(activeJ+1); alert('Todos los resultados están disponibles; avanzando a la siguiente jornada.'); } } }
(function(){ const sv=localStorage.getItem('quiniela_active'); if(sv) activeJ=Number(sv); loadData(); window.Q_DATA=DATA; })();
