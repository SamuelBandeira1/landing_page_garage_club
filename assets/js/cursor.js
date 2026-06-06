/* ============================================================
   GARAGE CLUB — cursor.js
   Custom cursor (rAF lerp) · magnetic elements · inertia follower
   ============================================================ */
window.GC = window.GC || {};

GC.initCursor = function(){
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!fine) return;

  const cursor = document.querySelector('.cursor');
  const label  = cursor.querySelector('.cursor__label');
  const ring   = cursor.querySelector('.cursor__ring');

  const target = { x:innerWidth/2, y:innerHeight/2 };
  const dot    = { x:target.x, y:target.y };
  const ringP  = { x:target.x, y:target.y };

  window.addEventListener('mousemove', (e)=>{
    target.x = e.clientX; target.y = e.clientY;
  });
  window.addEventListener('mousedown', ()=> cursor.classList.add('is-down'));
  window.addEventListener('mouseup',   ()=> cursor.classList.remove('is-down'));

  // hover / label states via delegation
  const hoverSel = 'a, button, [data-magnetic], [data-cursor], .os__row';
  document.addEventListener('mouseover', (e)=>{
    const t = e.target.closest(hoverSel);
    if(!t) return;
    cursor.classList.add('is-hover');
    const lbl = t.getAttribute('data-cursor');
    if(lbl){ label.textContent = lbl; cursor.classList.add('is-label'); }
  });
  document.addEventListener('mouseout', (e)=>{
    const t = e.target.closest(hoverSel);
    if(!t) return;
    if(!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverSel)){
      cursor.classList.remove('is-hover','is-label');
    }
  });

  function raf(){
    dot.x += (target.x - dot.x) * 0.9;
    dot.y += (target.y - dot.y) * 0.9;
    ringP.x += (target.x - ringP.x) * 0.18;
    ringP.y += (target.y - ringP.y) * 0.18;
    cursor.querySelector('.cursor__dot').style.transform =
      `translate(${dot.x}px, ${dot.y}px) translate(-50%,-50%)`;
    label.style.transform = `translate(${ringP.x}px, ${ringP.y}px) translate(-50%,-50%)`;
    ring.style.transform  = `translate(${ringP.x}px, ${ringP.y}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  }
  raf();

  GC.initMagnetic();
  // OS follower removed per user request
};

/* ---- magnetic elements ---- */
GC.initMagnetic = function(){
  const els = document.querySelectorAll('[data-magnetic]');
  els.forEach((el)=>{
    const strength = el.classList.contains('btn-magnetic') ? 0.45 : 0.3;
    el.addEventListener('mousemove', (e)=>{
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top + r.height/2);
      gsap.to(el, { x:mx*strength, y:my*strength, duration:.6, ease:'power3.out' });
      const inner = el.querySelector('.btn-magnetic__label, .nav__word, span');
    });
    el.addEventListener('mouseleave', ()=>{
      gsap.to(el, { x:0, y:0, duration:.7, ease:'elastic.out(1,.4)' });
    });
  });
};

/* ---- O.S. service thumbnail follower — DISABLED ---- */
GC.initOSFollower = function(){ /* removed */ };
