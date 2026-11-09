// Renders queue/<id>/post.json slides to slide-N.jpg (1080x1350) with the Jurvia brand template.
// Usage: node tools/render.mjs <queue-folder> [...]   (no argument: every post missing images)
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, QUEUE, loadPosts, slideFiles } from './lib.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// *text* -> <em>text</em>, newline -> <br>
const rich = (s = '') => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

const MARK_DOT = '<span>.</span>';
const fontsCss = readFileSync(join(ROOT, 'tools', 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([\w.-]+\.woff2)\)/g, (_, f) => `url(${pathToFileURL(join(ROOT, 'tools', 'fonts', f)).href})`);

const CSS = `${fontsCss}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:Inter,sans-serif;background:#112b32;color:#f3f6f2;position:relative;-webkit-font-smoothing:antialiased}
body.light{background:#f8f9f5;color:#112b32}
em{font-family:Gelasio,Georgia,serif;font-style:italic;font-weight:500;color:#b9edce;letter-spacing:-.01em}
.light em{color:#175e57}
.noise{position:absolute;inset:0;background:radial-gradient(circle at 85% 10%,rgba(185,237,206,.12),transparent 45%),radial-gradient(circle at 0% 100%,rgba(23,94,87,.55),transparent 55%)}
.light .noise{background:radial-gradient(circle at 90% 0%,rgba(185,237,206,.55),transparent 45%)}
.eyebrow{position:absolute;left:80px;top:80px;font-size:22px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;color:#8fa99c}
.light .eyebrow{color:#51666b}
.num{left:auto;right:80px}
.content{position:absolute;left:80px;right:80px;top:150px;bottom:170px;display:flex;flex-direction:column;justify-content:center}
.h{font-weight:600;letter-spacing:-.035em;line-height:1.06}
.p{font-size:34px;line-height:1.45;opacity:.8;margin-top:44px}
.foot{position:absolute;left:80px;right:80px;bottom:70px;display:flex;justify-content:space-between;align-items:center;font-size:24px}
.word{font-weight:700;letter-spacing:-.04em;font-size:40px}.word span{color:#b9edce}.light .word span{color:#175e57}
.foot .url{opacity:.7}
.step{display:flex;gap:36px;padding:34px 0;border-top:2px solid rgba(185,237,206,.25)}
.light .step{border-color:rgba(23,94,87,.25)}
.step .n{font-family:Gelasio,Georgia,serif;font-style:italic;color:#b9edce;font-size:72px;line-height:1;width:76px;flex:none}
.light .step .n{color:#175e57}
.step .t{font-size:42px;font-weight:600;letter-spacing:-.02em}
.step .d{font-size:28px;line-height:1.45;opacity:.75;margin-top:10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:64px}
.card{background:rgba(185,237,206,.08);border:2px solid rgba(185,237,206,.22);border-radius:28px;padding:34px}
.light .card{background:#fff;border-color:rgba(23,94,87,.18)}
.card .t{font-size:24px;color:#b9edce;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
.light .card .t{color:#175e57}
.card .d{font-size:30px;margin-top:14px;line-height:1.35;opacity:.85}
.item{display:flex;gap:32px;margin-top:48px;align-items:flex-start}
.item .b{flex:none;width:92px;height:92px;border-radius:24px;background:#b9edce;color:#112b32;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:700}
.item .t{font-size:46px;font-weight:600;letter-spacing:-.02em;line-height:1.12}
.item .d{font-size:28px;line-height:1.45;opacity:.75;margin-top:12px}
`;

function headlineSize(text) {
  const n = text.replace(/\*/g, '').length;
  return n <= 28 ? 112 : n <= 44 ? 96 : n <= 60 ? 84 : 72;
}

function slideHtml(post, slide, index) {
  const total = post.slides.length;
  const light = (slide.theme ?? post.theme) === 'light';
  const h = `<div class="h" style="font-size:${slide.headline_size ?? headlineSize(slide.headline)}px">${rich(slide.headline)}</div>`;
  let inner = h;
  if (slide.layout === 'statement') {
    if (slide.body) inner += `<div class="p">${rich(slide.body)}</div>`;
  } else if (slide.layout === 'steps') {
    inner += '<div style="margin-top:56px">' + slide.steps.map((s, i) =>
      `<div class="step"><div class="n">${i + 1}</div><div><div class="t">${rich(s.title)}</div><div class="d">${rich(s.text)}</div></div></div>`).join('') + '</div>';
  } else if (slide.layout === 'grid') {
    inner += '<div class="grid">' + slide.cards.map((c) =>
      `<div class="card"><div class="t">${esc(c.title)}</div><div class="d">${rich(c.text)}</div></div>`).join('') + '</div>';
  } else if (slide.layout === 'list') {
    inner += slide.items.map((it) =>
      `<div class="item"><div class="b">${esc(it.mark ?? '✓')}</div><div><div class="t">${rich(it.title)}</div><div class="d">${rich(it.text)}</div></div></div>`).join('');
  } else {
    throw new Error(`${post.id}: unknown layout ${slide.layout}`);
  }
  const num = total > 1 ? `<div class="eyebrow num">${index + 1} / ${total}</div>` : '';
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${CSS}</style></head>
<body class="${light ? 'light' : ''}"><div class="noise"></div>
<div class="eyebrow">${esc(slide.eyebrow ?? '')}</div>${num}
<div class="content">${inner}</div>
<div class="foot"><div class="word">Jurvia${MARK_DOT}</div><div class="url">jurvia.com.tr</div></div>
</body></html>`;
}

const args = process.argv.slice(2);
const all = loadPosts();
const targets = args.length ? all.filter((p) => args.includes(p.folder) || args.includes(p.id))
  : all.filter((p) => slideFiles(p).some((f) => !existsSync(join(p.dir, f))));
if (args.length && targets.length !== args.length) throw new Error('Unknown post folder in arguments');

const browser = await chromium.launch();
try {
  for (const post of targets) {
    for (const [i, slide] of post.slides.entries()) {
      if (slide.layout === 'image') {
        if (!existsSync(join(post.dir, `slide-${i + 1}.jpg`))) throw new Error(`${post.id} slide ${i + 1}: image layout needs slide-${i + 1}.jpg`);
        continue;
      }
      const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
      await page.setContent(slideHtml(post, slide, i), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => {
        const c = document.querySelector('.content');
        return c.scrollHeight > c.clientHeight + 2;
      });
      if (overflow) throw new Error(`${post.id} slide ${i + 1}: text does not fit, shorten it`);
      await page.screenshot({ path: join(post.dir, `slide-${i + 1}.jpg`), type: 'jpeg', quality: 90 });
      await page.close();
    }
    console.log(`rendered ${post.folder} (${post.slides.length} slide)`);
  }
} finally {
  await browser.close();
}
