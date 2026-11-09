// Publishes the oldest due post (publish_on <= today, Europe/Istanbul) to Instagram and LinkedIn.
// One post per run. Platforms without credentials are skipped and reported.
// Usage: node tools/publish.mjs [--dry-run | --check] [--id <post-id>]
//   --check verifies the configured credentials with read-only calls and publishes nothing.
//
// Env: PUBLIC_BASE_URL (raw URL of this repo's default branch, e.g. https://raw.githubusercontent.com/owner/jurvia-social/main)
//      IG_USER_ID, IG_ACCESS_TOKEN, IG_API_BASE (default https://graph.instagram.com/v23.0)
//      LINKEDIN_ORG_ID, LINKEDIN_ACCESS_TOKEN, LINKEDIN_VERSION (default: two months ago, YYYYMM)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPosts, loadState, saveState, slideFiles, todayIstanbul, buildLink, toLittleText } from './lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const checkOnly = process.argv.includes('--check');
const idArg = process.argv.includes('--id') ? process.argv[process.argv.indexOf('--id') + 1] : null;
const env = process.env;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const platforms = {
  instagram: Boolean(env.IG_USER_ID && env.IG_ACCESS_TOKEN),
  linkedin: Boolean(env.LINKEDIN_ORG_ID && env.LINKEDIN_ACCESS_TOKEN),
};

async function call(url, init = {}, what = url) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(60_000) });
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    // Never echo tokens: report status and the API's error object only.
    throw new Error(`${what} failed: HTTP ${res.status} ${JSON.stringify(body.error ?? body.message ?? body).slice(0, 500)}`);
  }
  return { body, headers: res.headers };
}

// ---------- Instagram (Instagram API with Instagram Login, content publishing) ----------
async function publishInstagram(post, imageUrls) {
  const base = (env.IG_API_BASE ?? 'https://graph.instagram.com/v23.0').replace(/\/$/, '');
  const ig = env.IG_USER_ID;
  const form = (o) => new URLSearchParams({ ...o, access_token: env.IG_ACCESS_TOKEN });
  const create = async (params) => (await call(`${base}/${ig}/media`, { method: 'POST', body: form(params) }, 'instagram create container')).body.id;
  const waitReady = async (id) => {
    for (let i = 0; i < 30; i++) {
      const { body } = await call(`${base}/${id}?${form({ fields: 'status_code' })}`, {}, 'instagram container status');
      if (body.status_code === 'FINISHED') return;
      if (body.status_code === 'ERROR' || body.status_code === 'EXPIRED') throw new Error(`instagram container ${id}: ${body.status_code}`);
      await sleep(5_000);
    }
    throw new Error(`instagram container ${id}: timed out`);
  };
  let creation;
  if (imageUrls.length === 1) {
    creation = await create({ image_url: imageUrls[0], caption: post.instagram.caption });
  } else {
    const children = [];
    for (const url of imageUrls) children.push(await create({ image_url: url, is_carousel_item: 'true' }));
    for (const c of children) await waitReady(c);
    creation = await create({ media_type: 'CAROUSEL', children: children.join(','), caption: post.instagram.caption });
  }
  await waitReady(creation);
  const { body } = await call(`${base}/${ig}/media_publish`, { method: 'POST', body: form({ creation_id: creation }) }, 'instagram publish');
  return { media_id: body.id };
}

// ---------- LinkedIn (Posts API as organization) ----------
function linkedinVersion() {
  if (env.LINKEDIN_VERSION) return env.LINKEDIN_VERSION;
  const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 2);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
const LI_BASE = (env.LINKEDIN_API_BASE ?? 'https://api.linkedin.com/rest').replace(/\/$/, '');
async function publishLinkedIn(post, imagePaths, link) {
  const owner = `urn:li:organization:${env.LINKEDIN_ORG_ID}`;
  const headers = {
    Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
    'LinkedIn-Version': linkedinVersion(),
    'X-Restli-Protocol-Version': '2.0.0',
  };
  const images = [];
  for (const p of imagePaths) {
    const { body } = await call(`${LI_BASE}/images?action=initializeUpload`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ initializeUploadRequest: { owner } }),
    }, 'linkedin image init');
    const up = await fetch(body.value.uploadUrl, {
      method: 'PUT', headers: { Authorization: headers.Authorization, 'Content-Type': 'image/jpeg' },
      body: readFileSync(p), signal: AbortSignal.timeout(120_000),
    });
    if (!up.ok) throw new Error(`linkedin image upload failed: HTTP ${up.status}`);
    images.push(body.value.image);
  }
  const content = images.length === 1
    ? { media: { id: images[0] } }
    : { multiImage: { images: images.map((id) => ({ id })) } };
  const { headers: h } = await call(`${LI_BASE}/posts`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: owner,
      commentary: toLittleText(post.linkedin.text.replace('{link}', link)),
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content,
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  }, 'linkedin create post');
  return { post_urn: h.get('x-restli-id') };
}

// ---------- credential check (read-only) ----------
async function checkCredentials() {
  let ok = true;
  if (platforms.instagram) {
    const base = (env.IG_API_BASE ?? 'https://graph.instagram.com/v23.0').replace(/\/$/, '');
    try {
      const q = new URLSearchParams({ fields: 'user_id,username', access_token: env.IG_ACCESS_TOKEN });
      const { body } = await call(`${base}/me?${q}`, {}, 'instagram /me');
      const match = String(body.user_id ?? body.id) === String(env.IG_USER_ID);
      console.log(`${match ? '✓' : '✗'} instagram: @${body.username} (user_id ${body.user_id ?? body.id}${match ? '' : `, IG_USER_ID is ${env.IG_USER_ID}`})`);
      if (!match) ok = false;
    } catch (e) { ok = false; console.error(`✗ instagram: ${e.message}`); }
  } else console.log('- instagram: no credentials');
  if (platforms.linkedin) {
    try {
      const { body } = await call(`${LI_BASE.replace(/\/rest$/, '')}/v2/userinfo`, {
        headers: { Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}` } }, 'linkedin token');
      console.log(`✓ linkedin: token valid (${body.name ?? 'member'}), organization ${env.LINKEDIN_ORG_ID}`);
    } catch (e) { ok = false; console.error(`✗ linkedin: ${e.message}`); }
  } else console.log('- linkedin: no credentials');
  return ok;
}

// ---------- main ----------
if (checkOnly) process.exit((await checkCredentials()) ? 0 : 1);

const state = loadState();
const today = todayIstanbul();
const posts = loadPosts();
const MAX_ATTEMPTS = 3; // after this a platform is given up for that post so the queue keeps moving
const pending = (p) => Object.entries(platforms)
  .filter(([k, on]) => on && !state.posts[p.id]?.[k] && (state.posts[p.id]?.[`${k}_attempts`] ?? 0) < MAX_ATTEMPTS)
  .map(([k]) => k);
const due = idArg ? posts.filter((p) => p.id === idArg)
  : posts.filter((p) => p.publish_on <= today && (dryRun ? !state.posts[p.id] : pending(p).length));
const post = due[0];
const queued = posts.filter((p) => p.publish_on > today).length;

if (!Object.values(platforms).some(Boolean) && !dryRun) {
  // Not set up yet: warn instead of failing so scheduled runs do not send error e-mails.
  console.log('::warning::No platform credentials configured (IG_* or LINKEDIN_*). Nothing published.');
  process.exit(0);
}
if (!post) {
  console.log(`Nothing due on ${today}. ${queued} post(s) waiting in queue.`);
  if (queued < 2) console.log('::warning::Queue has fewer than 2 future posts.');
  process.exit(0);
}

const files = slideFiles(post);
const base = (env.PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
const imageUrls = files.map((f) => `${base}/queue/${post.folder}/${f}`);
const imagePaths = files.map((f) => join(post.dir, f));
const liLink = buildLink(post, 'linkedin');

if (dryRun) {
  console.log(JSON.stringify({ today, post: post.id, platforms, imageUrls, linkedinLink: liLink,
    instagramCaption: post.instagram.caption, linkedinCommentary: toLittleText(post.linkedin.text.replace('{link}', liLink)) }, null, 2));
  process.exit(0);
}
if (platforms.instagram && !base) throw new Error('PUBLIC_BASE_URL is required for Instagram');

const record = (state.posts[post.id] ??= {});
let failed = false;
for (const name of pending(post)) {
  try {
    const result = name === 'instagram' ? await publishInstagram(post, imageUrls) : await publishLinkedIn(post, imagePaths, liLink);
    record[name] = { ...result, published_at: new Date().toISOString() };
    console.log(`✓ ${name}: ${post.id} ${JSON.stringify(result)}`);
  } catch (e) {
    failed = true;
    record[`${name}_attempts`] = (record[`${name}_attempts`] ?? 0) + 1;
    record[`${name}_last_error`] = { at: new Date().toISOString(), message: e.message };
    console.error(`✗ ${name}: ${e.message}`);
  }
  saveState(state); // persist after each platform so a retry never double-posts
}
for (const name of Object.keys(platforms).filter((k) => !platforms[k])) console.log(`- ${name}: skipped (no credentials)`);
process.exit(failed ? 1 : 0);
