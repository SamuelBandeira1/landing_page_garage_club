const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'screenshots_scrub');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5050 ...');
  await page.goto('http://localhost:5050', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for preloader to finish (~4s buffer)
  console.log('Waiting for preloader to finish...');
  await page.waitForTimeout(5000);

  // Try to dismiss preloader if it has a skip/done state
  // Check if there's a preloader element still visible
  const preloaderVisible = await page.evaluate(() => {
    const el = document.querySelector('#preloader, .preloader, [data-preloader]');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  });
  console.log('Preloader still visible:', preloaderVisible);
  if (preloaderVisible) {
    await page.waitForTimeout(3000);
  }

  // Screenshot of initial page state (hero section)
  const s0 = path.join(OUT_DIR, '00_hero.png');
  await page.screenshot({ path: s0, fullPage: false });
  console.log('Saved:', s0);

  // Find the barber-reel section
  const reelInfo = await page.evaluate(() => {
    const candidates = [
      document.querySelector('#barber-reel'),
      document.querySelector('.barber-reel'),
      document.querySelector('[data-section="barber-reel"]'),
      [...document.querySelectorAll('section')].find(s => s.textContent.toLowerCase().includes('reel')),
      [...document.querySelectorAll('section, div')].find(s => s.id && s.id.toLowerCase().includes('reel')),
    ].filter(Boolean);
    if (candidates.length === 0) return null;
    const el = candidates[0];
    const rect = el.getBoundingClientRect();
    return { id: el.id, className: el.className, offsetTop: el.offsetTop, height: el.offsetHeight, top: rect.top };
  });
  console.log('Barber reel info:', JSON.stringify(reelInfo));

  // Find the frame-scrub section
  const scrubInfo = await page.evaluate(() => {
    const candidates = [
      document.querySelector('#frame-scrub'),
      document.querySelector('.frame-scrub'),
      document.querySelector('[data-section="frame-scrub"]'),
      document.querySelector('#scrubCanvas'),
      document.querySelector('canvas'),
      [...document.querySelectorAll('section, div')].find(s => s.id && (s.id.toLowerCase().includes('scrub') || s.id.toLowerCase().includes('barbeiro'))),
      [...document.querySelectorAll('section')].find(s => s.textContent.includes('BARBEIRO EM AÇÃO') || s.textContent.includes('ARTE NA PONTA')),
    ].filter(Boolean);
    if (candidates.length === 0) return null;
    const el = candidates[0];
    const rect = el.getBoundingClientRect();
    return { id: el.id, className: el.className, offsetTop: el.offsetTop, height: el.offsetHeight, scrollHeight: document.body.scrollHeight };
  });
  console.log('Frame scrub info:', JSON.stringify(scrubInfo));

  // Scroll to barber-reel section if found
  if (reelInfo) {
    await page.evaluate((top) => window.scrollTo({ top: top - 50, behavior: 'instant' }), reelInfo.offsetTop);
    await page.waitForTimeout(1000);
    const s1 = path.join(OUT_DIR, '01_barber_reel.png');
    await page.screenshot({ path: s1, fullPage: false });
    console.log('Saved:', s1);
  } else {
    console.log('Barber reel section not found by ID, trying scroll-based search...');
    // Try scrolling midway
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.floor(scrollHeight * 0.3));
    await page.waitForTimeout(800);
    const s1 = path.join(OUT_DIR, '01_scroll_30pct.png');
    await page.screenshot({ path: s1, fullPage: false });
    console.log('Saved:', s1);
  }

  // Scroll to frame-scrub section
  let scrubTop = 0;
  let scrubHeight = 0;
  if (scrubInfo) {
    scrubTop = scrubInfo.offsetTop;
    scrubHeight = scrubInfo.height;
    console.log(`Frame scrub at offsetTop=${scrubTop}, height=${scrubHeight}`);
  } else {
    // Fall back: search all sections by text
    const found = await page.evaluate(() => {
      const all = document.querySelectorAll('section, div[id], div[class]');
      for (const el of all) {
        const txt = el.textContent || '';
        if (txt.includes('BARBEIRO EM AÇÃO') || txt.includes('ARTE NA PONTA') || txt.includes('scrub')) {
          return { id: el.id, className: el.className, offsetTop: el.offsetTop, height: el.offsetHeight };
        }
      }
      // If still not found, look for canvas
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const parent = canvas.closest('section') || canvas.parentElement;
        if (parent) return { id: parent.id, className: parent.className, offsetTop: parent.offsetTop, height: parent.offsetHeight };
      }
      return null;
    });
    console.log('Fallback scrub search:', JSON.stringify(found));
    if (found) {
      scrubTop = found.offsetTop;
      scrubHeight = found.height;
    }
  }

  if (scrubTop > 0) {
    // Screenshot at start of scrub
    await page.evaluate((top) => window.scrollTo({ top: top, behavior: 'instant' }), scrubTop);
    await page.waitForTimeout(800);
    const s2 = path.join(OUT_DIR, '02_scrub_start.png');
    await page.screenshot({ path: s2, fullPage: false });
    console.log('Saved:', s2);

    // Screenshot at middle of scrub
    await page.evaluate((top) => window.scrollTo({ top: top, behavior: 'instant' }), scrubTop + Math.floor(scrubHeight * 0.4));
    await page.waitForTimeout(800);
    const s3 = path.join(OUT_DIR, '03_scrub_mid.png');
    await page.screenshot({ path: s3, fullPage: false });
    console.log('Saved:', s3);

    // Screenshot at end of scrub
    await page.evaluate((top) => window.scrollTo({ top: top, behavior: 'instant' }), scrubTop + Math.floor(scrubHeight * 0.8));
    await page.waitForTimeout(800);
    const s4 = path.join(OUT_DIR, '04_scrub_end.png');
    await page.screenshot({ path: s4, fullPage: false });
    console.log('Saved:', s4);
  } else {
    // Full page approach: take screenshots at various scroll positions
    console.log('Could not find scrub section, taking scroll-based screenshots...');
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let pct of [0.4, 0.55, 0.7]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.floor(scrollHeight * pct));
      await page.waitForTimeout(800);
      const fn = path.join(OUT_DIR, `0x_scroll_${Math.floor(pct*100)}pct.png`);
      await page.screenshot({ path: fn, fullPage: false });
      console.log('Saved:', fn);
    }
  }

  // Also capture section HTML structure for analysis
  const htmlInfo = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('section, [id]').forEach(el => {
      result.push({
        tag: el.tagName,
        id: el.id,
        classes: el.className,
        offsetTop: el.offsetTop,
        height: el.offsetHeight,
        textSnippet: (el.textContent || '').trim().substring(0, 100)
      });
    });
    return result;
  });
  const infoPath = path.join(OUT_DIR, 'page_elements.json');
  fs.writeFileSync(infoPath, JSON.stringify(htmlInfo, null, 2));
  console.log('Saved element map:', infoPath);

  // Also get all IDs that contain "scrub" or "barbeiro"
  const scrubElements = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('[id*="scrub"], [id*="barbeiro"], [id*="Barbeiro"], [class*="scrub"]').forEach(el => {
      const style = window.getComputedStyle(el);
      result.push({
        tag: el.tagName,
        id: el.id,
        classes: el.className,
        offsetTop: el.offsetTop,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        color: style.color,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        textContent: (el.textContent || '').trim().substring(0, 200)
      });
    });
    return result;
  });
  const scrubPath = path.join(OUT_DIR, 'scrub_elements.json');
  fs.writeFileSync(scrubPath, JSON.stringify(scrubElements, null, 2));
  console.log('Saved scrub elements:', scrubPath);

  // Capture scrubPhrase elements specifically
  const phraseInfo = await page.evaluate(() => {
    const result = [];
    for (let i = 0; i <= 5; i++) {
      const el = document.querySelector(`#scrubPhrase-${i}`);
      if (el) {
        const style = window.getComputedStyle(el);
        result.push({
          id: `scrubPhrase-${i}`,
          tag: el.tagName,
          classes: el.className,
          offsetTop: el.offsetTop,
          offsetLeft: el.offsetLeft,
          width: el.offsetWidth,
          height: el.offsetHeight,
          display: style.display,
          position: style.position,
          color: style.color,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          letterSpacing: style.letterSpacing,
          opacity: style.opacity,
          textContent: (el.textContent || '').trim().substring(0, 300),
          innerHTML: el.innerHTML.substring(0, 500)
        });
      } else {
        result.push({ id: `scrubPhrase-${i}`, found: false });
      }
    }
    return result;
  });
  const phrasePath = path.join(OUT_DIR, 'phrase_elements.json');
  fs.writeFileSync(phrasePath, JSON.stringify(phraseInfo, null, 2));
  console.log('Saved phrase elements:', phrasePath);

  await browser.close();
  console.log('DONE. Screenshots saved in:', OUT_DIR);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
