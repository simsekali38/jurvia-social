import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const QUEUE = join(ROOT, 'queue');
export const STATE_FILE = join(ROOT, 'state', 'published.json');

export function loadPosts() {
  if (!existsSync(QUEUE)) return [];
  return readdirSync(QUEUE, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = join(QUEUE, d.name);
      const post = JSON.parse(readFileSync(join(dir, 'post.json'), 'utf8'));
      return { ...post, dir, folder: d.name };
    })
    .sort((a, b) => a.publish_on.localeCompare(b.publish_on) || a.id.localeCompare(b.id));
}

export function loadState() {
  return existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : { posts: {} };
}

export function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

export function slideFiles(post) {
  return post.slides.map((_, i) => `slide-${i + 1}.jpg`);
}

/** Today's date in Europe/Istanbul as YYYY-MM-DD. */
export function todayIstanbul(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(now);
}

/** Topics with `status: mevcut` parsed from content/urun-bilgileri.md. */
export function availableTopics() {
  const md = readFileSync(join(ROOT, 'content', 'urun-bilgileri.md'), 'utf8');
  const topics = {};
  for (const m of md.matchAll(/^### ([a-z0-9-]+) — status: ([a-z-]+)(?: — sayfa: (\S+))?/gm)) {
    topics[m[1]] = { status: m[2], page: m[3] ?? '/' };
  }
  return topics;
}

export function buildLink(post, source) {
  const topics = availableTopics();
  const page = topics[post.topic]?.page ?? '/';
  const url = new URL(page, 'https://jurvia.com.tr');
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'organic_social');
  url.searchParams.set('utm_campaign', 'jurvia_auto');
  url.searchParams.set('utm_content', post.utm_content);
  return url.toString();
}

// LinkedIn "little text" format: escape reserved characters, keep hashtags clickable.
// URLs are left as-is (they only contain [A-Za-z0-9:/?&=._-]) so LinkedIn still detects them as links.
export function toLittleText(text) {
  return text.split(/(https?:\/\/\S+)/).map((part, i) => {
    if (i % 2) return part;
    const escaped = part.replace(/[\\|{}@\[\]()<>#*_~]/g, (c) => `\\${c}`);
    // LinkedIn shows the {hashtag|\#|tag} template literally; a bare #tag is linked by LinkedIn itself.
    return escaped.replace(/\\#(?=[\p{L}\p{N}])/gu, '#');
  }).join('');
}
