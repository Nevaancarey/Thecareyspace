(function(){
  var cursor = document.getElementById('drone-cursor');
  if (!cursor) return;
  var interactiveSelector = 'a, .icon-btn, .btn';
  document.addEventListener('mousemove', function(e){
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    var el = e.target.closest(interactiveSelector);
    cursor.classList.toggle('active', !!el);
  });
  document.addEventListener('mouseleave', function(){
    cursor.classList.remove('active');
  });
})();
