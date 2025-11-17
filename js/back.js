
function makeBackDraggable(){
  const btns = document.querySelectorAll('.back');
  btns.forEach((btn)=>{
    btn.style.position='fixed';
    try{ const pos = JSON.parse(localStorage.getItem('quiniela_back_pos')||'{}'); if(pos.left) btn.style.left = pos.left; if(pos.top) btn.style.top = pos.top; }catch(e){}
    btn.style.zIndex=9999; btn.style.cursor='grab';
    btn.onmousedown = function(e){
      btn.style.cursor='grabbing';
      const startX = e.clientX - btn.getBoundingClientRect().left;
      const startY = e.clientY - btn.getBoundingClientRect().top;
      function move(ev){ btn.style.left = (ev.clientX - startX) + 'px'; btn.style.top = (ev.clientY - startY) + 'px'; }
      function up(){ document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); btn.style.cursor='grab'; localStorage.setItem('quiniela_back_pos', JSON.stringify({left:btn.style.left, top:btn.style.top})); }
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };
  });
}
window.addEventListener('load', makeBackDraggable);
