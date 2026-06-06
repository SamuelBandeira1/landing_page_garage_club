/* ============================================================
   GARAGE CLUB — smooth.js
   Lenis smooth scroll wired into GSAP ScrollTrigger + ticker.
   Exposes GC.lenis and GC.velocity (normalized scroll speed).
   ============================================================ */
window.GC = window.GC || {};

GC.initSmooth = function(){
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration:1.05,
    easing:(t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out
    smoothWheel:true,
    wheelMultiplier:1,
    touchMultiplier:1.4,
    infinite:false
  });
  GC.lenis = lenis;
  GC.velocity = 0;

  lenis.on('scroll', (e)=>{
    ScrollTrigger.update();
    // normalized signed velocity (-1..1-ish)
    GC.velocity = e.velocity || 0;
  });

  // Re-sync Lenis scroll limit every time ScrollTrigger refreshes
  // (pin-spacers change the total page height)
  ScrollTrigger.addEventListener('refresh', ()=> lenis.resize());

  gsap.ticker.add((time)=>{ lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // start locked until the gate opens
  lenis.stop();

  return lenis;
};
