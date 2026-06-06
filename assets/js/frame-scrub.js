/* ============================================================
   FRAME SCRUB ENGINE — 300-frame image sequence playback
   Syncs to scroll progress with lerp + canvas rendering
   ============================================================ */

window.GC = window.GC || {};

GC.FrameScrub = function(opts){
  this.total = opts.total || 300;
  this.dir = opts.dir || 'assets/frames/';
  this.ext = opts.ext || 'jpg';
  this.canvas = opts.canvas || document.getElementById('frameScrubCanvas');
  this.textPanel = opts.textPanel || document.getElementById('frameScrubText');
  this.frameData = opts.frameData || [];

  if(!this.canvas) return;
  this.ctx = this.canvas.getContext('2d');
  this.loaded = 0;
  this.frames = [];
  this.currentFrame = 0;
  this.lerpFactor = 0.08;
  this.displayedFrame = 0;

  // Resize canvas to container
  this.resize();
  window.addEventListener('resize', ()=>this.resize());

  // Preload all frames
  this.preload();
};

GC.FrameScrub.prototype.resize = function(){
  const rect = this.canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;
  // Ensure CSS sizing matches logical size
  this.canvas.style.width = rect.width + 'px';
  this.canvas.style.height = rect.height + 'px';
  
  if(this.frames && this.frames.length > 0){
    this.render(this.currentFrame);
  }
};

GC.FrameScrub.prototype.preload = function(){
  let loaded = 0;
  for(let i = 1; i <= this.total; i++){
    const num = String(i).padStart(3, '0');
    const src = this.dir + 'frame-' + num + '.' + this.ext;
    const img = new Image();
    img.onload = ()=>{
      loaded++;
      if(loaded === this.total){
        // All frames loaded
        this.frames.sort((a,b) => a.idx - b.idx);
        this.render(0);
      }
    };
    img.onerror = ()=>{ loaded++; };
    img.src = src;
    this.frames.push({ img, idx:i-1, src });
  }
};

GC.FrameScrub.prototype.scrubTo = function(progress){
  // progress: 0 to 1 representing scroll position within this section
  const targetFrame = Math.floor(progress * (this.total - 1));
  this.currentFrame = targetFrame;
  this.render(targetFrame);
};

GC.FrameScrub.prototype.render = function(idx){
  if(!this.frames[idx] || !this.frames[idx].img) return;
  const img = this.frames[idx].img;

  // Clear canvas
  this.ctx.fillStyle = '#000';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Fit image to canvas (cover/contain logic)
  const scale = Math.max(
    this.canvas.width / img.width,
    this.canvas.height / img.height
  );
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (this.canvas.width - w) / 2;
  const y = (this.canvas.height - h) / 2;

  // Draw frame
  this.ctx.drawImage(img, x, y, w, h);

  // Update text panel if provided
  if(this.frameData && this.frameData[idx]){
    const text = this.frameData[idx];
    this.updateTextPanel(text, idx);
  }
};

GC.FrameScrub.prototype.updateTextPanel = function(text, frameIdx){
  const titleEl = document.getElementById('floatingTextTitle');
  const descEl = document.getElementById('floatingTextDesc');
  
  if(titleEl && text.title) titleEl.innerHTML = text.title;
  if(descEl && text.desc) descEl.innerHTML = text.desc;
};

// Init on page load
document.addEventListener('DOMContentLoaded', ()=>{
  if(GC.initFrameScrub) GC.initFrameScrub();
});
