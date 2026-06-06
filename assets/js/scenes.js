/* ============================================================
   GARAGE CLUB — scenes.js
   Build dynamic DOM + all ScrollTrigger scenes.
   Every ScrollTrigger is registered into GC.triggers for cleanup.
   ============================================================ */
window.GC = window.GC || {};
GC.triggers = [];
const track = (st)=>{ if(st) GC.triggers.push(st); return st; };

/* ---------- helpers ---------- */
GC.splitChars = function(el){
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch)=>{
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
  });
  return el.querySelectorAll('.char');
};

/* ============================================================
   HERO
   ============================================================ */
GC.buildHero = function(){
  document.querySelectorAll('.hero__title [data-split]').forEach(GC.splitChars);
};

GC.playHero = function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chars = document.querySelectorAll('.hero__title .char');
  const tl = gsap.timeline({ delay:0.1 });

  if(reduce){
    gsap.set(chars,{ y:0 });
    gsap.set('.hero__script, .hero__eyebrow',{ opacity:1 });
    gsap.set('#headlights',{ opacity:1 });
    return;
  }
  tl.to('.hero__eyebrow', { opacity:1, duration:.6 }, 0)
    .to(chars, { y:0, duration:1.1, ease:'expo.out', stagger:0.035 }, 0.05)
    .to('.hero__script', { opacity:1, duration:.9, ease:'power3.out' }, 0.5)
    .fromTo('#headlights', { opacity:0, y:30 }, { opacity:1, y:0, duration:1.4, ease:'power2.out' }, 0.3)
    .fromTo('.btn-magnetic', { opacity:0, y:24 }, { opacity:1, y:0, duration:.8, ease:'power3.out' }, 0.7);

  // hero video subtle parallax + fade on scroll out
  track(ScrollTrigger.create({
    trigger:'.hero', start:'top top', end:'bottom top', scrub:true,
    animation: gsap.to('.hero__inner', { y:-80, opacity:0.3, ease:'none' })
  }));
  gsap.to('.hero__video', {
    scale:1.18, ease:'none',
    scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true, onUpdate:t=>track(t.scrollTrigger) }
  });
};

/* ============================================================
   SECTION 2 — HORIZONTAL CAROUSEL  (+ velocity RGB shift)
   ============================================================ */
GC.buildCarousel = function(){
  const trackEl = document.getElementById('carouselTrack');
  GC.cuts.forEach((c,i)=>{
    // Featured first item is bigger
    const sz = i === 0
      ? { w:'42vw', h:'78vh', y:'0' }
      : (GC.railSizes[i] || GC.railSizes[0]);
    const fig = document.createElement('figure');
    fig.className = 'rail-item' + (c.featured ? ' rail-item--featured' : '');
    fig.style.width = sz.w;
    fig.style.transform = `translateY(${sz.y})`;
    fig.innerHTML = `
      <div class="rail-item__media" style="height:${sz.h}">
        <div class="ab-stack">
          <img class="ab ab-r" src="${c.img}" alt="" loading="${i<3?'eager':'lazy'}" />
          <img class="ab ab-g" src="${c.img}" alt="${c.name}" loading="${i<3?'eager':'lazy'}" />
          <img class="ab ab-b" src="${c.img}" alt="" loading="${i<3?'eager':'lazy'}" />
        </div>
        <span class="rail-item__tag">${c.tag}</span>
        <div class="rail-item__cap">
          <span class="rail-item__no">N° ${c.no}</span>
          <div class="rail-item__name">${c.name}</div>
        </div>
        <div class="rail-item__smoke"></div>
      </div>`;
    trackEl.appendChild(fig);
  });
};

GC.sceneCarousel = function(){
  const pin   = document.getElementById('carouselPin');
  const trackEl = document.getElementById('carouselTrack');
  const bgWord = document.getElementById('carouselBgWord');
  const idxEl = document.getElementById('carIdx');

  const getScrollAmt = ()=> Math.max(0, trackEl.scrollWidth - window.innerWidth);

  const tl = gsap.timeline({
    scrollTrigger:{
      trigger:'.carousel',
      start:'top top',
      end:()=> '+=' + getScrollAmt() * 1.15,
      pin:pin,
      scrub:1,
      invalidateOnRefresh:true,
      onUpdate(self){
        idxEl.textContent = String(Math.min(GC.cuts.length,
          1 + Math.floor(self.progress * GC.cuts.length))).padStart(2,'0');
        // velocity → chromatic aberration target
        const v = self.getVelocity();
        GC.abTarget = Math.min(16, Math.abs(v) / 260);
      },
      onLeave(){ GC.abTarget = 0; },
      onLeaveBack(){ GC.abTarget = 0; }
    }
  });
  tl.to(trackEl, { x:()=> -getScrollAmt(), ease:'none' }, 0)
    .to(bgWord, { xPercent:-55, ease:'none' }, 0);

  // smoke effect: fire on every ~2nd item as it scrolls into view
  const items = document.querySelectorAll('.rail-item');
  let lastSmokeIdx = -1;
  tl.scrollTrigger.vars.onUpdate = function(self){
    idxEl.textContent = String(Math.min(GC.cuts.length,
      1 + Math.floor(self.progress * GC.cuts.length))).padStart(2,'0');
    const v = self.getVelocity();
    GC.abTarget = Math.min(16, Math.abs(v) / 260);
    // smoke on active item
    const activeIdx = Math.floor(self.progress * items.length);
    if(activeIdx !== lastSmokeIdx && activeIdx < items.length){
      lastSmokeIdx = activeIdx;
      const it = items[activeIdx];
      it.classList.remove('is-smoke');
      void it.offsetWidth; // reflow to restart animation
      it.classList.add('is-smoke');
    }
  };
  track(tl.scrollTrigger);

  // rAF: lerp the RGB-split var toward target so it decays smoothly
  GC.abTarget = 0; let ab = 0;
  gsap.ticker.add(()=>{
    ab += (GC.abTarget - ab) * 0.12;
    GC.abTarget *= 0.9;                 // natural decay
    trackEl.style.setProperty('--ab', ab.toFixed(2) + 'px');
  });
};

/* ============================================================
   SECTION 3 — BARBERS (sticky split)
   ============================================================ */
GC.buildBarbers = function(){
  const right = document.getElementById('barbersRight');
  GC.barbers.forEach((b,i)=>{
    const p = document.createElement('article');
    p.className = 'bpanel';
    p.dataset.idx = i;
    p.innerHTML = `
      <span class="bpanel__num">0${i+1}</span>
      <div class="bpanel__smoke"></div>
      <div class="bpanel__main">
        <img class="grade" src="${b.main}" alt="${b.first} ${b.last}" loading="lazy" />
      </div>
      <div class="bpanel__thumbs">
        ${b.thumbs.map(t=>`<img src="${t}" alt="" loading="lazy" />`).join('')}
      </div>`;
    right.appendChild(p);
  });
};

GC.setBarber = function(i){
  if(GC.curBarber === i) return;
  GC.curBarber = i;
  const b = GC.barbers[i];
  const nameEl = document.getElementById('barberName');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('barberRole').textContent = b.role;
  document.getElementById('barberSign').textContent = b.sign;
  document.getElementById('barberDesc').textContent = b.desc;
  document.querySelectorAll('.barbers__meta b')[0].textContent = b.years;
  document.querySelectorAll('.barbers__meta b')[1].textContent = b.cuts;
  document.getElementById('barberPager').textContent = '0'+(i+1);
  document.getElementById('barberPagerFill').style.width = ((i+1)/GC.barbers.length*100)+'%';

  nameEl.innerHTML = `
    <span class="mask"><span class="mask__in">${b.first}</span></span>
    <span class="mask"><span class="mask__in">${b.last}</span></span>`;
  if(!reduce){
    gsap.fromTo(nameEl.querySelectorAll('.mask__in'),
      { yPercent:110 }, { yPercent:0, duration:.9, ease:'expo.out', stagger:.08 });
    gsap.fromTo('#barberDesc', { opacity:0, y:14 }, { opacity:1, y:0, duration:.7, ease:'power3.out', delay:.1 });
  }
};

GC.sceneBarbers = function(){
  GC.curBarber = -1;
  const panels = document.querySelectorAll('.bpanel');
  panels.forEach((panel,i)=>{
    track(ScrollTrigger.create({
      trigger:panel, start:'top center', end:'bottom center',
      onToggle(self){
        if(self.isActive){
          panels.forEach(p=>p.classList.remove('is-active'));
          panel.classList.add('is-active');
          panel.querySelector('.grade').classList.add('is-warm');
          GC.setBarber(i);
        }
      }
    }));
  });
  GC.setBarber(0);
};

/* ============================================================
   SECTION 4 — GARAGE GRID parallax + O.S. menu
   ============================================================ */
GC.sceneGarage = function(){
  // Subtle parallax on the main ambient video
  gsap.fromTo('.garage__hero-vid video', { scale:1.08 }, {
    scale:1.14, ease:'none',
    scrollTrigger:{ trigger:'.garage__media-wrap', start:'top bottom',
      end:'bottom top', scrub:true, onUpdate:s=>track(s.scrollTrigger) }
  });

  // Reveal media wrap
  gsap.fromTo('.garage__media-wrap', { opacity:0, y:50 }, {
    opacity:1, y:0, duration:1.1, ease:'power3.out',
    scrollTrigger:{ trigger:'.garage__media-wrap', start:'top 88%',
      onUpdate:s=>track(s.scrollTrigger) }
  });

  // Float rail items stagger in
  gsap.fromTo('.garage__float-item', { opacity:0, x:30 }, {
    opacity:1, x:0, duration:.8, ease:'power3.out', stagger:.12,
    scrollTrigger:{ trigger:'.garage__float-rail', start:'top 85%',
      onUpdate:s=>track(s.scrollTrigger) }
  });
};

GC.buildOS = function(){
  const list = document.getElementById('osList');
  GC.services.forEach((s)=>{
    const li = document.createElement('li');
    li.className = 'os__row';
    li.dataset.img = s.img;
    li.dataset.cursor = 'VER';
    li.innerHTML = `
      <span class="os__row-name">${s.name}</span>
      <span class="os__row-dots"></span>
      <span class="os__row-price">${s.price}</span>`;
    li.addEventListener('click', () => {
      if(GC.showOSImage) GC.showOSImage(s.img, s.name);
    });
    list.appendChild(li);
  });
};

GC.showOSImage = function(imgSrc, title){
  let modal = document.getElementById('osLightbox');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'osLightbox';
    modal.className = 'os__lightbox';
    modal.innerHTML = `
      <div class="os__lightbox-backdrop"></div>
      <div class="os__lightbox-content">
        <img src="" class="os__lightbox-img" alt="Serviço Garage Club" />
        <p class="os__lightbox-title mono"></p>
        <button class="os__lightbox-close mono">FECHAR</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
      gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => { modal.style.display = 'none'; }});
    });
  }
  
  modal.querySelector('.os__lightbox-img').src = imgSrc;
  modal.querySelector('.os__lightbox-title').textContent = title;
  modal.style.display = 'flex';
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4 });
};

GC.sceneOS = function(){
  gsap.fromTo('#osPaper', { opacity:0, y:50, rotate:-3 }, {
    opacity:1, y:0, rotate:-0.6, duration:1, ease:'expo.out',
    scrollTrigger:{ trigger:'#os', start:'top 78%', onUpdate:s=>track(s.scrollTrigger) }
  });
};

/* ============================================================
   SECTION 5 — CLUB plans spotlight border
   ============================================================ */
GC.sceneClub = function(){
  document.querySelectorAll('[data-spotlight]').forEach((card)=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
    });
  });
  gsap.utils.toArray('.plan').forEach((p,i)=>{
    gsap.fromTo(p, { opacity:0, y:60 }, {
      opacity:1, y:0, duration:1, ease:'power3.out', delay:i*0.08,
      scrollTrigger:{ trigger:'#clubPlans', start:'top 82%', onUpdate:s=>track(s.scrollTrigger) }
    });
  });
  gsap.fromTo('.footer__word', { opacity:0, y:80 }, {
    opacity:1, y:0, duration:1, ease:'power3.out',
    scrollTrigger:{ trigger:'#footer', start:'top 90%', onUpdate:s=>track(s.scrollTrigger) }
  });
};

/* ============================================================
   SECTION 6 — LIMIAR TRANSITION (Car Mask Reveal)
   ============================================================ */
GC.sceneLimiar = function(){
  const section = document.getElementById('limiarSection');
  if(!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#limiarSection',
      start: 'top 80%',
      once: true
    }
  });

  // Start with strong motion blur on the car
  gsap.set('#limiarCar', { filter: 'blur(10px)' });

  // Autonomous majestic slide
  tl.fromTo('#limiarCar', { x: '-30vw' }, { 
    x: '130vw', 
    duration: 2.5, 
    ease: 'power2.inOut' 
  }, 0);

  // Sync the bright text clip-path to act as a mask revealed by the car
  tl.fromTo('#limiarText', { 
    clipPath: 'inset(0 100% 0 0)'
  }, { 
    clipPath: 'inset(0 0% 0 0)', 
    duration: 2.5, 
    ease: 'power2.inOut' 
  }, 0);

  // Fade out the blur gradually towards the end to show the car clearly before it leaves
  tl.to('#limiarCar', { filter: 'blur(0px)', duration: 0.8, ease: 'power1.out' }, 1.7);
};

/* ============================================================
   NAV scrolled state
   ============================================================ */
GC.sceneNav = function(){
  track(ScrollTrigger.create({
    start:'top -80', end:99999,
    onUpdate(self){
      document.getElementById('nav').classList.toggle('is-scrolled', self.scroll() > 80);
    }
  }));
};


/* ============================================================
   BARBER REEL — scroll-scrubbed video
   Lazy-loaded: o src real só é atribuído após window.load
   para não bloquear o carregamento inicial da página.
   currentTime mapeia 1:1 ao progresso do scroll.
   ============================================================ */
GC.sceneFrameScrub = function(){
  const section = document.getElementById('frameScrubSection');
  const canvas = document.getElementById('frameScrubCanvas');
  const prog = document.getElementById('reelProg');
  if(!section || !canvas) return;

  // Frame metadata — customize per frame
  const frameData = [];
  for(let i = 0; i < 300; i++){
    // Distribute text changes across the 300 frames
    if(i < 100){
      frameData[i] = {
        title: 'Precisão',
        desc: 'Cada movimento é calculado. A navalha segue linhas invisíveis que só o mestre vê.'
      };
    } else if(i < 200){
      frameData[i] = {
        title: 'Ritual',
        desc: 'Não é apenas cortar. É uma cerimônia onde técnica e confiança se encontram.'
      };
    } else {
      frameData[i] = {
        title: 'Arte',
        desc: 'A forma final é a assinatura do barbeiro. Uma obra que dura semanas.'
      };
    }
  }

  // Initialize frame scrub engine
  GC.frameScrub = new GC.FrameScrub({
    total: 300,
    dir: 'assets/frames/',
    ext: 'jpg',
    canvas: canvas,
    textPanel: null,
    frameData: frameData
  });



  // Master Timeline for Scroll Sync
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate(self){
        if(GC.frameScrub){
          GC.frameScrub.scrubTo(self.progress);
          if(prog) prog.style.width = (self.progress * 100).toFixed(1) + '%';
        }
      }
    }
  });

  // Parallax for Monumental Typography
  const words = document.querySelectorAll('.monumental-word');
  if(words.length === 3){
    // Fade in text slightly at the beginning to avoid jumping
    tl.fromTo(words, { opacity: 0 }, { opacity: 0.1, duration: 0.1 }, 0);
    
    // Word 1: PRECISÃO (moves left)
    tl.to(words[0], { x: '-30vw', ease: 'none', duration: 1 }, 0);
    
    // Word 2: ESTILO (moves right, faster)
    tl.to(words[1], { x: '20vw', ease: 'none', duration: 1 }, 0);
    
    // Word 3: ARTE (moves left, fastest)
    tl.to(words[2], { x: '-40vw', ease: 'none', duration: 1 }, 0);

    // Fade out everything near the very end
    tl.to(words, { opacity: 0, duration: 0.1 }, 0.9);
  }

  window.addEventListener('resize', () => ScrollTrigger.refresh());
};

/* ============================================================
   BRAND INTRO — SHOCK & AWE (Kinetic Typography + Navalha Reveal)
   ============================================================ */
GC.sceneBrandIntro = function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  /* ── 1. KINETIC WORD SPLITTER ──────────────────────────── */
  const titleEl = document.querySelector('.brand-intro__title');
  if(titleEl && !titleEl.dataset.split){
    titleEl.dataset.split = '1';
    // preserve <em> tags by splitting around them
    const raw = titleEl.innerHTML;
    const lines = raw.split(/<br\s*\/?>/i);
    titleEl.innerHTML = lines.map(line => {
      // wrap whole line in overflow clip
      return `<div class="bi-line" style="overflow:hidden;display:block;line-height:.92">` +
             `<div class="bi-word" style="display:inline-block;will-change:transform">${line}</div>` +
             `</div>`;
    }).join('');
  }

  /* ── 2. FLASH DE FUNDO ─────────────────────────────────── */
  const section = document.querySelector('#brand-intro');
  const flashTl = gsap.timeline({
    scrollTrigger:{ trigger:'#brand-intro', start:'top 70%', once:true }
  });

  // Flash: brief brightness pulse on the section bg
  flashTl.fromTo(section,
    { backgroundColor:'rgba(179,102,40,0.0)' },
    { backgroundColor:'rgba(179,102,40,0.18)', duration:0.07, ease:'power4.in',
      yoyo:true, repeat:3, repeatDelay:0.04 }
  );

  /* ── 3. KICKER + KINETIC TITLE ─────────────────────────── */
  const mainTl = gsap.timeline({
    scrollTrigger:{ trigger:'#brand-intro', start:'top 68%', once:true,
                    onUpdate: s => track(s.scrollTrigger) }
  });

  mainTl
    .fromTo('.brand-intro__kicker',
      { opacity:0, x:-40 },
      { opacity:1, x:0, duration:0.6, ease:'power3.out' })
    .fromTo('.bi-word',
      { y:'110%', rotationZ:6, opacity:0 },
      { y:'0%', rotationZ:0, opacity:1, duration:0.9, ease:'back.out(1.6)', stagger:0.12 },
      '-=0.3')
    .fromTo('.brand-intro__body',
      { opacity:0, y:30 },
      { opacity:1, y:0, duration:0.8, ease:'power3.out' },
      '-=0.5')
    .fromTo('.brand-intro__stat',
      { opacity:0, y:20, filter:'blur(12px)' },
      { opacity:1, y:0, filter:'blur(0px)', duration:0.7, ease:'power3.out', stagger:0.12 },
      '-=0.5');

  /* ── 4. NAVALHA CLIP-PATH REVEAL (Imagem) ──────────────── */
  gsap.set('.brand-intro__img', { clipPath:'polygon(0 48%, 100% 48%, 100% 52%, 0 52%)' });

  gsap.to('.brand-intro__img', {
    clipPath:'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
    duration:1.2, ease:'expo.inOut',
    scrollTrigger:{ trigger:'#brand-intro', start:'top 60%', once:true }
  });

  // Parallax zoom-out inside the clip
  gsap.fromTo('.brand-intro__img img',
    { scale:2.2, transformOrigin:'center center' },
    { scale:1, ease:'none',
      scrollTrigger:{ trigger:'#brand-intro', start:'top bottom', end:'bottom top', scrub:1 }
    }
  );

  /* ── 5. QUOTE SLIDE ────────────────────────────────────── */
  gsap.fromTo('.brand-intro__quote',
    { opacity:0, x:60, filter:'blur(8px)' },
    { opacity:1, x:0, filter:'blur(0px)', duration:1.1, ease:'expo.out',
      scrollTrigger:{ trigger:'#brand-intro', start:'top 55%', once:true } }
  );
};



/* ── GC.initFrameScrub (legado) removido ──────────────────────
   Esta função foi descontinuada. O engine de frame scrub agora
   é gerido exclusivamente por GC.sceneFrameScrub() +
   GC.FrameScrub (frame-scrub.js) usando o canvas #frameScrubCanvas.
   O vídeo barbers-reel.mp4 é controlado por GC.sceneBarberReel().
   ────────────────────────────────────────────────────────────── */



GC.sceneFooterMap = function() {
  const mapEl = document.querySelector('.footer__map');
  if (!mapEl) return;
  gsap.to(mapEl, {
    backgroundPosition: 'center 100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#footer',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true
    }
  });
};

