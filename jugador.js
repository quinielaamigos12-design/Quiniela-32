async function loadData(){
  try{ return await fetch('data.json',{cache:'no-store'}).then(r=>r.json()); }catch(e){ return {players:[]}; }
}
function getQuery(name){ const params = new URLSearchParams(window.location.search); return params.get(name); }
async function render(){
  const data = await loadData();
  const list = document.getElementById('playerList');
  list.innerHTML='';
  (data.players||[]).forEach((p,i)=>{
    const div = document.createElement('div'); div.className='player-item';
    div.innerHTML = '<div class="left"><div class="badge">'+(i+1)+'</div><div><strong>'+p.displayName+'</strong><div class="small-muted">'+p.name+'</div></div></div><div class="small-muted">'+(p.email||'')+'</div>';
    list.appendChild(div);
  });
  // populate profile if logged
  const session = sessionStorage.getItem('session') || getQuery('user');
  if(session){
    const me = (data.players||[]).find(x => x.name===session) || (session==='MIGI' ? {name:'MIGI',displayName:'MIGI',email:''} : null);
    if(me){
      document.getElementById('displayName').value = me.displayName || me.name;
      document.getElementById('email').value = me.email || '';
    }
  }
}
document.getElementById('saveProfile').addEventListener('click', async ()=>{
  const data = await loadData();
  const session = sessionStorage.getItem('session');
  if(!session) return alert('No estás identificado');
  const idx = (data.players||[]).findIndex(x=>x.name===session);
  const displayName = document.getElementById('displayName').value.trim();
  const email = document.getElementById('email').value.trim();
  if(idx===-1){
    // if not found, add (for fixed MIGI)
    data.players = data.players || [];
    data.players.push({name:session,password:'',displayName:displayName,email:email});
  }else{
    data.players[idx].displayName = displayName;
    data.players[idx].email = email;
  }
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='data.json'; document.body.appendChild(a); a.click(); a.remove();
  document.getElementById('status').textContent = 'Datos preparados para exportar (descarga data.json)';
  await render();
});
document.addEventListener('DOMContentLoaded', render);
