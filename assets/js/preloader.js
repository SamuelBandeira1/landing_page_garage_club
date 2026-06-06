/* ============================================================
   GARAGE CLUB — preloader.js
   State machine: PRELOAD -> INTRO(gate) -> MAIN
   Scroll stays locked until the garage gate finishes opening.
   ============================================================ */
window.GC = window.GC || {};

GC.state = 'PRELOAD';

GC.runIntro = function(onMainReady){
  const counterEl = document.getElementById('counter');
  const barEl     = document.getElementById('loadbar');
  const flare     = document.getElementById('flare');
  const preloader = document.getElementById('preloader');
  const gate      = document.getElementById('gate');
  const nav       = document.getElementById('nav');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let count = { v:0 };

  const tl = gsap.timeline({ defaults:{ ease:'power2.out' } });

  // --- 1. numeric loader 00 -> 100 ---
  tl.to(count, {
    v:100,
    duration:reduce ? 0.4 : 2.4,
    ease:'power1.inOut',
    onUpdate(){
      const n = Math.round(count.v);
      counterEl.textContent = String(n).padStart(2,'0');
      barEl.style.width = n + '%';
    }
  });

  // --- 2. headlights flare at 100 ---
  tl.set(flare, { scale:0, opacity:0 });
  if(!reduce){
    tl.to(flare, { opacity:1, scale:1, duration:.18, ease:'power2.in' }, '+=0.05')
      .to(flare, { scale:18, duration:.5, ease:'expo.out' }, '<0.08')
      .to('.preloader__center', { opacity:0, duration:.3 }, '<')
      .to(flare, { opacity:0, duration:.4 }, '>-0.1');
  }

  // --- 3. hide preloader, reveal stage ---
  tl.set(preloader, { display:'none' });
  GC.state = 'INTRO';

  // --- 4. garage pantographic gate opens (expo.out) ---
  tl.add(()=>{ gate.classList.add('is-open'); });
  tl.to('.gate__panel--top',    { yPercent:-101, duration:1.15, ease:'expo.out' }, 'gate')
    .to('.gate__panel--bottom', { yPercent: 101, duration:1.15, ease:'expo.out' }, 'gate');

  // --- 5. release: nav in, scroll unlocked, hero plays ---
  tl.add(()=>{
    gate.style.display = 'none';
    nav.classList.add('is-in');
    document.body.classList.remove('is-loading');
    if(GC.lenis) GC.lenis.start();
    GC.state = 'MAIN';
    if(typeof onMainReady === 'function') onMainReady();
  }, '-=0.5');

  return tl;
};
