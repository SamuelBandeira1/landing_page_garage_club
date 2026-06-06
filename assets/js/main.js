/* ============================================================
   GARAGE CLUB — main.js  (orchestrator + lifecycle)
   ============================================================ */
(function(){
  'use strict';

  function build(){
    GC.buildHero();
    GC.buildCarousel();
    GC.buildBarbers();
    GC.buildOS();
  }

  function scenes(){
    GC.sceneNav();
    GC.sceneBrandIntro();
    GC.sceneCarousel();
    GC.sceneBarbers();
    GC.sceneFrameScrub();

    GC.sceneGarage();
    GC.sceneOS();
    GC.sceneClub();
    if(GC.sceneLimiar) GC.sceneLimiar();
    if(GC.sceneFooterMap) GC.sceneFooterMap();
    ScrollTrigger.refresh();
    // Lenis must re-measure AFTER pin-spacers are injected
    if(GC.lenis) GC.lenis.resize();
  }

  /* smooth anchor links via Lenis */
  function anchors(){
    document.querySelectorAll('a[href^="#"]').forEach((a)=>{
      a.addEventListener('click', (e)=>{
        const id = a.getAttribute('href');
        if(id.length < 2) return;
        const el = document.querySelector(id);
        if(!el) return;
        e.preventDefault();
        if(GC.lenis) GC.lenis.scrollTo(el, { offset:0, duration:1.4 });
      });
    });
  }

  /* clean teardown — kill every ScrollTrigger + Lenis to keep the
     browser snappy if the page lives a long time / gets unmounted */
  function teardown(){
    if(GC.triggers){ GC.triggers.forEach(t=> t && t.kill && t.kill()); }
    if(window.ScrollTrigger) ScrollTrigger.getAll().forEach(t=>t.kill());
    if(GC.lenis && GC.lenis.destroy) GC.lenis.destroy();
    gsap.ticker.lagSmoothing(500,33);
  }

  function init(){
    build();
    GC.initSmooth();
    GC.initCursor();
    scenes();
    anchors();

    // refresh once heavy media settles
    window.addEventListener('load', ()=>{
      ScrollTrigger.refresh();
      if(GC.lenis) GC.lenis.resize();
    });
    setTimeout(()=>{
      ScrollTrigger.refresh();
      if(GC.lenis) GC.lenis.resize();
    }, 1200);
    let rT;
    window.addEventListener('resize', ()=>{ clearTimeout(rT); rT=setTimeout(()=>ScrollTrigger.refresh(),200); });

    // run the intro state machine
    GC.runIntro(function onMain(){
      GC.playHero();
      ScrollTrigger.refresh();
      if(GC.lenis) GC.lenis.resize();
    });
  }

  window.addEventListener('pagehide', teardown);
  window.addEventListener('beforeunload', teardown);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
