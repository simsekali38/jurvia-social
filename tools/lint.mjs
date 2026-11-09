// Validates every queued post against content/kurallar.md. Exit code 1 on any error.
// Usage: node tools/lint.mjs [--images]   (--images also checks slide JPEG files)
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadPosts, loadState, availableTopics, slideFiles } from './lib.mjs';

const checkImages = process.argv.includes('--images');
const topics = availableTopics();
const posts = loadPosts();
const state = loadState();
const errors = [];
const err = (post, msg) => errors.push(`${post.folder ?? post.id}: ${msg}`);

// Case-insensitive patterns; Turkish İ/ı handled by normalising before matching.
const BANNED = [
  [/uyap\s*entegrasyon/, '"UYAP entegrasyonu" kullanılmaz'],
  [/\bresm[iî]\b|\bresm[iî]\s|onayl[iı]\b|adalet bakanl/, 'resmî/onaylı/Adalet Bakanlığı ifadesi'],
  [/kanun|kanunu|madde\s*\d|\bm\.\s*\d|yönetmelik|tebli[gğ]\s*edilmi[sş]\s*say|içtihat|yargıtay|danıştay|anayasa|\bhmk\b|\btbk\b|\bcmk\b|\biik\b|\btck\b|zamanaşım|hak\s*düşür|süre\s*(hesab|dol|kaçır|işle)|yasal\s*süre|mevzuat|hukuki\s*(tavsiye|görüş|danışman)/, 'hukuki terim/mevzuat'],
  [/en\s*iyi|\btek\s+(çözüm|program|uygulama)|%\s*\d|\d+\s*%|garanti/, 'abartı/istatistik'],
  [/ücretsiz|bedava|indirim|fiyat|₺|\btl\b|pilot|deneme\s*sürümü|kampanya/, 'fiyat/teklif ifadesi'],
  [/yapay\s*zek|\bai\b|chatgpt|otomatik\s*olarak\s*güncell/, 'üründe olmayan özellik'],
  [/müvekkil\s*portal|belge\s*talep|mali\s*hareket|tahsilat|masraf|avans/, 'yol haritasındaki özellik'],
];
const norm = (s) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

function textOf(post) {
  const parts = [];
  for (const s of post.slides ?? []) {
    parts.push(s.eyebrow, s.headline, s.body);
    for (const x of [...(s.steps ?? []), ...(s.cards ?? []), ...(s.items ?? [])]) parts.push(x.title, x.text);
  }
  parts.push(post.instagram?.caption, post.linkedin?.text);
  return parts.filter(Boolean).join('\n');
}
const hashtags = (s = '') => s.match(/#[\p{L}\p{N}_]+/gu) ?? [];
const len = (s = '') => [...s].length;

const seenHeadlines = new Map();
for (const [i, post] of posts.entries()) {
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(post.id ?? '') || post.id !== post.folder) err(post, 'id must equal folder name, format YYYY-MM-DD-slug');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publish_on ?? '') || !post.id?.startsWith(post.publish_on)) err(post, 'publish_on must be YYYY-MM-DD and match id prefix');
  else if (![2, 5].includes(new Date(post.publish_on + 'T12:00:00Z').getUTCDay())) err(post, 'publish_on must be a Tuesday or Friday');
  if (topics[post.topic]?.status !== 'mevcut') err(post, `topic "${post.topic}" is not a "mevcut" topic in urun-bilgileri.md`);
  if (!/^[a-z0-9_]{3,40}$/.test(post.utm_content ?? '')) err(post, 'utm_content must be 3-40 chars [a-z0-9_]');
  if (!Array.isArray(post.slides) || post.slides.length < 1 || post.slides.length > 6) err(post, 'slides: 1-6 required');

  for (const [n, s] of (post.slides ?? []).entries()) {
    const at = `slide ${n + 1}`;
    if (!s.headline || len(s.headline.replace(/\*/g, '')) > 70) err(post, `${at}: headline required, max 70 chars`);
    if (s.eyebrow && len(s.eyebrow) > 32) err(post, `${at}: eyebrow max 32 chars`);
    if (s.layout === 'statement') { if (s.body && len(s.body) > 260) err(post, `${at}: body max 260 chars`); }
    else if (s.layout === 'steps') { if (s.steps?.length !== 3) err(post, `${at}: steps needs exactly 3`); }
    else if (s.layout === 'grid') { if (s.cards?.length !== 4) err(post, `${at}: grid needs exactly 4 cards`); }
    else if (s.layout === 'list') { if (!(s.items?.length >= 2 && s.items.length <= 3)) err(post, `${at}: list needs 2-3 items`); }
    else if (s.layout === 'image') { /* pre-rendered slide-N.jpg; headline is its text for checks */ }
    else err(post, `${at}: unknown layout "${s.layout}"`);
    for (const x of [...(s.steps ?? []), ...(s.cards ?? []), ...(s.items ?? [])]) {
      if (!x.title || len(x.title) > 34 || !x.text || len(x.text) > 90) err(post, `${at}: item title max 34, text max 90 chars`);
    }
    const key = norm(s.headline ?? '');
    if (n === 0) {
      if (seenHeadlines.has(key)) err(post, `headline already used by ${seenHeadlines.get(key)}`);
      seenHeadlines.set(key, post.id);
    }
  }

  const ig = post.instagram?.caption ?? '';
  if (len(ig) < 300 || len(ig) > 900) err(post, `instagram.caption 300-900 chars (now ${len(ig)})`);
  if (/https?:\/\/|www\.|\{link\}/i.test(ig)) err(post, 'instagram.caption must not contain links');
  if (!/link profilde/i.test(ig)) err(post, 'instagram.caption must say "Link profilde."');
  const igTags = hashtags(ig).length;
  if (igTags < 3 || igTags > 5) err(post, `instagram.caption needs 3-5 hashtags (now ${igTags})`);

  const li = post.linkedin?.text ?? '';
  if (len(li) < 300 || len(li) > 1300) err(post, `linkedin.text 300-1300 chars (now ${len(li)})`);
  if ((li.match(/\{link\}/g) ?? []).length !== 1) err(post, 'linkedin.text must contain {link} exactly once');
  if (/https?:\/\//i.test(li)) err(post, 'linkedin.text: use {link}, no raw URLs');
  if (hashtags(li).length > 3) err(post, 'linkedin.text max 3 hashtags');

  const all = textOf(post);
  const mentions = (all.match(/@[\w.]+/g) ?? []).filter((m) => m !== '@jurvia.app');
  if (mentions.length) err(post, `no mentions allowed: ${mentions.join(', ')}`);
  for (const [re, why] of BANNED) {
    const m = norm(all).match(re);
    if (m) err(post, `${why}: "${m[0]}"`);
  }

  // No repeat of the topic used by either of the two previous posts.
  const prev = posts.slice(Math.max(0, i - 2), i).map((p) => p.topic);
  if (prev.includes(post.topic)) err(post, `topic "${post.topic}" repeats one of the previous two posts`);

  if (checkImages) {
    for (const f of slideFiles(post)) {
      const p = join(post.dir, f);
      if (!existsSync(p)) { err(post, `missing ${f} (run node tools/render.mjs ${post.folder})`); continue; }
      const b = readFileSync(p);
      if (b[0] !== 0xff || b[1] !== 0xd8) err(post, `${f} is not a JPEG`);
      if (statSync(p).size > 8 * 1024 * 1024) err(post, `${f} larger than 8 MB`);
    }
  }
}

// Posts already published must never be edited away.
for (const id of Object.keys(state.posts)) {
  if (!posts.some((p) => p.id === id)) errors.push(`state: published post ${id} is missing from queue/`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${posts.length} post(s) passed`);
