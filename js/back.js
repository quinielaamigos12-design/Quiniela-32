
/* Draggable back button: creates or enhances any element with class 'back' to be draggable */
function makeBackDraggable(){
  document.querySelectorAll('.back').forEach(btn=>{
    btn.style.position = 'fixed';
    btn.style.zIndex = 9999;
    btn.style.cursor = 'grab';
    btn.onmousedown = function(e){
      btn.style.cursor='grabbing';
      const startX = e.clientX - (btn.offsetLeft || btn.getBoundingClientRect().left);
      const startY = e.clientY - (btn.offsetTop || btn.getBoundingClientRect().top);
      function move(ev){
        btn.style.left = (ev.clientX - startX) + 'px';
        btn.style.top = (ev.clientY - startY) + 'px';
      }
      function up(){ document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); btn.style.cursor='grab'; }
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };
  });
}
window.addEventListener('load', makeBackDraggable);
