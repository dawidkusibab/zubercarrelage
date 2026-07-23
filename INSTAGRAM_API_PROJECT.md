# Instagram-to-Cloudinary API Service
## Technical Task Breakdown

> **Goal:** Self-hosted replacement for Behold.so — connects Instagram via OAuth, caches images through Cloudinary, exposes a JSON feed endpoint consumed by the Gatsby site.

---

## Architecture Overview

```
[Instagram Basic Display API]
         ↓ OAuth 2.0
[Express / Vercel Serverless]  ←→  [Supabase: tokens + feed cache]
         ↓ Cloudinary fetch URLs
[GET /api/feed]  →  [Gatsby InstagramCarousel.tsx]
         ↑
[Admin HTML page: /connect]
```

**Key constraint:** Instagram access tokens expire every 60 days. A cron job must refresh them before expiry.

---

## Phase 1 — Setup & Infrastructure

---

### IG-001 · Initialize project repository

**Complexity:** S
**Dependencies:** None

**Description:**
Create the Node.js project that will host all API routes, the OAuth flow, and the admin UI.

**Steps:**
1. `mkdir carousel-feed-api && cd carousel-feed-api && git init`
2. `npm init -y`
3. Install core dependencies:
   ```bash
   npm install express dotenv cloudinary @supabase/supabase-js node-cron axios
   npm install --save-dev nodemon typescript @types/node @types/express
   ```
4. Create folder structure:
   ```
   /src
     /routes       # Express route handlers
     /services     # Instagram, Cloudinary, Supabase logic
     /middleware   # Auth guards, error handling
   /public         # Static admin UI files
   /vercel.json    # Vercel config (if deploying there)
   .env.example
   .gitignore
   ```
5. Add `.env.example` with all required keys (see IG-002).
6. Set up `tsconfig.json` with `"module": "commonjs"`, `"outDir": "./dist"`.
7. Add `nodemon.json` pointing to `src/index.ts`.

---

### IG-002 · Configure environment variables

**Complexity:** S
**Dependencies:** IG-001

**Description:**
Define all secrets and config values. Never commit `.env` to git.

**Required variables:**
```env
# Instagram Basic Display API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/instagram/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# App
PORT=3000
FEED_CACHE_TTL_MINUTES=30
CRON_SECRET=                  # Random string to protect manual cron trigger
NODE_ENV=development
```

**Notes:**
- `INSTAGRAM_REDIRECT_URI` must exactly match the URI registered in the Meta app dashboard.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — keep it server-side only, never expose to the browser.
- `CRON_SECRET` is used to protect the `/api/cron/refresh-tokens` endpoint from unauthorized calls.

---

### IG-003 · Provision Supabase database

**Complexity:** S
**Dependencies:** IG-002

**Description:**
Create the two tables needed to store OAuth tokens and the cached feed.

**Table: `instagram_accounts`**
```sql
create table instagram_accounts (
  id               uuid primary key default gen_random_uuid(),
  instagram_user_id text unique not null,
  username          text,
  access_token      text not null,
  token_expires_at  timestamptz not null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
```

**Table: `feed_cache`**
```sql
create table feed_cache (
  id                  uuid primary key default gen_random_uuid(),
  instagram_user_id   text references instagram_accounts(instagram_user_id),
  feed_json           jsonb not null,
  fetched_at          timestamptz default now()
);
```

**Notes:**
- Enable Row Level Security on both tables in the Supabase dashboard — all access will go through the service role key from the server.
- Add an index on `feed_cache(instagram_user_id, fetched_at desc)` for fast latest-feed lookups.
- `token_expires_at` should be set to `now() + interval '60 days'` when a token is stored or refreshed.

---

### IG-004 · Register Meta developer app

**Complexity:** S
**Dependencies:** None

**Description:**
Create the Instagram Basic Display API app in Meta for Developers. This is a prerequisite for any OAuth flow.

**Steps:**
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Consumer type.
2. Add product: **Instagram Basic Display**.
3. In Instagram Basic Display settings:
   - Add OAuth Redirect URI: `https://your-domain.com/auth/instagram/callback`
   - Add Deauthorize Callback URL: `https://your-domain.com/auth/instagram/deauth`
4. Copy **Instagram App ID** and **Instagram App Secret** → paste into `.env`.
5. Add the client's Instagram account as a **Test User** (required while app is in Development mode).
6. To go live (remove the test user restriction): submit the app for review with the `instagram_graph_user_profile` and `instagram_graph_user_media` permissions.

**Notes:**
- While the app is in Development mode, only Instagram accounts explicitly added as Test Users can complete the OAuth flow.
- The app does **not** need to pass Meta's full review for personal/single-client use — keeping it in Development mode with one test user is sufficient.

---

## Phase 2 — Instagram OAuth Flow

---

### IG-005 · Build OAuth authorization redirect endpoint

**Complexity:** S
**Dependencies:** IG-001, IG-002, IG-004

**Description:**
`GET /auth/instagram` — redirects the browser to Instagram's OAuth consent screen.

**Implementation (`src/routes/auth.ts`):**
```typescript
import { Router } from 'express';
const router = Router();

router.get('/instagram', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: 'instagram_graph_user_profile,instagram_graph_user_media',
    response_type: 'code',
  });
  res.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
});

export default router;
```

**Notes:**
- Scopes required: `instagram_graph_user_profile` (for user ID/username) and `instagram_graph_user_media` (for posts).
- No CSRF state parameter is strictly required for a single-client tool, but adding one (`state` param + session check) is best practice.

---

### IG-006 · Build OAuth callback endpoint — exchange code for token

**Complexity:** M
**Dependencies:** IG-005, IG-003

**Description:**
`GET /auth/instagram/callback` — receives the `?code=` from Instagram, exchanges it for a short-lived token, upgrades to a long-lived token (60 days), then stores it in Supabase.

**Implementation outline:**
```typescript
router.get('/instagram/callback', async (req, res) => {
  const { code } = req.query;

  // Step 1: Exchange code for short-lived token (POST to Instagram)
  const shortLivedToken = await exchangeCodeForToken(code as string);

  // Step 2: Upgrade to long-lived token (GET to graph.instagram.com)
  const longLivedToken = await upgradToLongLivedToken(shortLivedToken.access_token);

  // Step 3: Fetch basic profile (user_id, username)
  const profile = await fetchInstagramProfile(longLivedToken.access_token);

  // Step 4: Upsert into Supabase instagram_accounts
  await supabase.from('instagram_accounts').upsert({
    instagram_user_id: profile.id,
    username: profile.username,
    access_token: longLivedToken.access_token,
    token_expires_at: new Date(Date.now() + longLivedToken.expires_in * 1000),
    updated_at: new Date(),
  }, { onConflict: 'instagram_user_id' });

  res.send('<h1>✅ Instagram connected successfully.</h1>');
});
```

**Short-lived token exchange (POST):**
```
POST https://api.instagram.com/oauth/access_token
Body (form-data): client_id, client_secret, grant_type=authorization_code, redirect_uri, code
```

**Long-lived token upgrade (GET):**
```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={secret}
  &access_token={short_lived_token}
```
Response includes `access_token` and `expires_in` (seconds, ~5,184,000 = 60 days).

**Notes:**
- Always use the long-lived token for storage. Short-lived tokens expire in 1 hour.
- Wrap all three steps in a try/catch and show a clear error page if any step fails.

---

### IG-007 · Build deauthorization webhook endpoint

**Complexity:** S
**Dependencies:** IG-006

**Description:**
`POST /auth/instagram/deauth` — Meta calls this URL when a user revokes app permissions. Required for Meta app compliance.

**Implementation:**
```typescript
router.post('/instagram/deauth', async (req, res) => {
  // Meta sends a signed payload — verify signature before acting
  const signature = req.headers['x-hub-signature'] as string;
  const isValid = verifyMetaSignature(req.body, signature, process.env.INSTAGRAM_APP_SECRET!);

  if (!isValid) return res.status(403).send('Invalid signature');

  const userId = req.body.user_id;
  await supabase.from('instagram_accounts').delete().eq('instagram_user_id', userId);
  await supabase.from('feed_cache').delete().eq('instagram_user_id', userId);

  res.status(200).send('OK');
});
```

**Signature verification:**
```typescript
import crypto from 'crypto';
function verifyMetaSignature(body: object, signature: string, secret: string): boolean {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

**Notes:**
- Meta requires this endpoint to exist and return 200 before the app can go live.
- Use `crypto.timingSafeEqual` to prevent timing attacks.

---

## Phase 3 — Feed Fetching & Cloudinary Sync

---

### IG-008 · Instagram media fetching service

**Complexity:** M
**Dependencies:** IG-006

**Description:**
Create `src/services/instagram.ts` — a service that fetches the latest posts from the Instagram Graph API using the stored access token.

**Endpoint:**
```
GET https://graph.instagram.com/me/media
  ?fields=id,media_type,permalink,caption,timestamp,media_url,thumbnail_url
  &limit=12
  &access_token={token}
```

**Implementation outline:**
```typescript
export async function fetchInstagramMedia(accessToken: string): Promise<RawPost[]> {
  const url = new URL('https://graph.instagram.com/me/media');
  url.searchParams.set('fields', 'id,media_type,permalink,caption,timestamp,media_url,thumbnail_url');
  url.searchParams.set('limit', '12');
  url.searchParams.set('access_token', accessToken);

  const response = await axios.get(url.toString());
  return response.data.data; // Array of raw post objects
}
```

**Notes:**
- `thumbnail_url` is only returned for `VIDEO` type posts. Use it as the image source for videos.
- `CAROUSEL_ALBUM` only returns the cover image via `media_url`. Child media requires a separate call to `/media/{id}/children` — skip child fetching for now (out of scope for v1).
- Handle 400 errors (expired token) by logging and alerting — do not silently fail.

---

### IG-009 · Cloudinary image transformation service

**Complexity:** M
**Dependencies:** IG-001, IG-002

**Description:**
Create `src/services/cloudinary.ts` — generates Cloudinary fetch URLs that resize and cache the original Instagram image without uploading anything to Cloudinary's storage.

**How Cloudinary fetch mode works:**
Cloudinary can fetch and cache any public URL on the fly:
```
https://res.cloudinary.com/{cloud_name}/image/fetch/w_400,h_225,c_fill,f_auto,q_auto/{encoded_instagram_url}
```
No upload API call needed. The image is fetched from Instagram on first request, then cached by Cloudinary's CDN.

**Implementation:**
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SIZE_CONFIGS = {
  small:  { width: 400,  height: 225  },
  medium: { width: 700,  height: 394  },
  large:  { width: 1000, height: 563  },
};

export function buildCloudinaryFetchUrl(
  originalUrl: string,
  size: keyof typeof SIZE_CONFIGS
): string {
  const { width, height } = SIZE_CONFIGS[size];
  return cloudinary.url(originalUrl, {
    type: 'fetch',
    width,
    height,
    crop: 'fill',
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
  });
}
```

**Notes:**
- Cloudinary free tier allows 25 monthly credits. Each unique transformation URL costs one credit on first fetch. 12 posts × 3 sizes = 36 transformations max per sync — well within free tier if feed doesn't change daily.
- Enable "Fetch" delivery type in the Cloudinary dashboard under Settings → Security → Allowed fetch domains. Add `cdninstagram.com` and `scontent*.cdninstagram.com`.
- Instagram media URLs expire. Cloudinary caches the image permanently after first fetch, so expiry is not a problem once cached.

---

### IG-010 · Feed transformation — map raw posts to feed JSON schema

**Complexity:** S
**Dependencies:** IG-008, IG-009

**Description:**
Create `src/services/feedTransformer.ts` — maps raw Instagram API posts to the JSON structure expected by `InstagramCarousel.tsx`.

**Target schema (per post):**
```typescript
interface FeedPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  caption: string;
  timestamp: string;
  sizes: {
    small:  { mediaUrl: string; width: 400;  height: 225 };
    medium: { mediaUrl: string; width: 700;  height: 394 };
    large:  { mediaUrl: string; width: 1000; height: 563 };
  };
}
```

**Implementation:**
```typescript
export function transformPosts(rawPosts: RawPost[]): FeedPost[] {
  return rawPosts
    .filter(post => post.media_type !== 'VIDEO' || post.thumbnail_url) // skip videos without thumbnail
    .map(post => {
      const sourceUrl = post.media_type === 'VIDEO'
        ? post.thumbnail_url
        : post.media_url;

      return {
        id: post.id,
        mediaType: post.media_type,
        permalink: post.permalink,
        caption: post.caption ?? '',
        timestamp: post.timestamp,
        sizes: {
          small:  { mediaUrl: buildCloudinaryFetchUrl(sourceUrl, 'small'),  width: 400,  height: 225 },
          medium: { mediaUrl: buildCloudinaryFetchUrl(sourceUrl, 'medium'), width: 700,  height: 394 },
          large:  { mediaUrl: buildCloudinaryFetchUrl(sourceUrl, 'large'),  width: 1000, height: 563 },
        },
      };
    });
}
```

**Notes:**
- `caption` can be `undefined` if the post has no caption — always default to empty string.
- Filter out posts where source URL is missing to avoid broken Cloudinary URLs.

---

### IG-011 · Feed sync service — fetch, transform, and cache to Supabase

**Complexity:** M
**Dependencies:** IG-008, IG-010, IG-003

**Description:**
Create `src/services/feedSync.ts` — orchestrates fetching from Instagram, transforming, and writing the result to `feed_cache` in Supabase. This is called by the feed endpoint when the cache is stale, and by the cron job.

**Implementation outline:**
```typescript
export async function syncFeed(instagramUserId: string): Promise<FeedPayload> {
  // 1. Load access token from Supabase
  const { data: account } = await supabase
    .from('instagram_accounts')
    .select('access_token')
    .eq('instagram_user_id', instagramUserId)
    .single();

  if (!account) throw new Error(`No account found for user ${instagramUserId}`);

  // 2. Fetch raw posts from Instagram
  const rawPosts = await fetchInstagramMedia(account.access_token);

  // 3. Transform to feed schema
  const posts = transformPosts(rawPosts);
  const feedPayload = { posts };

  // 4. Upsert into feed_cache
  await supabase.from('feed_cache').upsert({
    instagram_user_id: instagramUserId,
    feed_json: feedPayload,
    fetched_at: new Date(),
  }, { onConflict: 'instagram_user_id' });

  return feedPayload;
}
```

**Notes:**
- Use `upsert` with `onConflict: 'instagram_user_id'` so there's always exactly one cache row per account.
- The sync is intentionally lazy (called on request when stale) + proactive (called by cron daily).

---

## Phase 4 — Feed API Endpoint

---

### IG-012 · Build GET /api/feed endpoint

**Complexity:** M
**Dependencies:** IG-011

**Description:**
`GET /api/feed` — the endpoint the Gatsby site calls. Returns cached feed JSON, refreshing from Instagram if the cache is older than `FEED_CACHE_TTL_MINUTES`.

**Implementation (`src/routes/feed.ts`):**
```typescript
router.get('/', async (req, res) => {
  try {
    // For single-client setup: load the one account from Supabase
    const { data: account } = await supabase
      .from('instagram_accounts')
      .select('instagram_user_id')
      .limit(1)
      .single();

    if (!account) {
      return res.status(503).json({ error: 'No Instagram account connected.' });
    }

    const userId = account.instagram_user_id;
    const ttlMs = parseInt(process.env.FEED_CACHE_TTL_MINUTES ?? '30') * 60 * 1000;

    // Check cache freshness
    const { data: cache } = await supabase
      .from('feed_cache')
      .select('feed_json, fetched_at')
      .eq('instagram_user_id', userId)
      .single();

    const isFresh = cache && (Date.now() - new Date(cache.fetched_at).getTime() < ttlMs);

    const feed = isFresh ? cache.feed_json : await syncFeed(userId);

    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min browser cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(feed);
  } catch (err) {
    console.error('[/api/feed]', err);
    res.status(500).json({ error: 'Failed to load feed.' });
  }
});
```

**Notes:**
- `Cache-Control: public, max-age=1800` lets Vercel's edge cache serve the response for 30 minutes without hitting the serverless function.
- Always return the last known cached feed on Instagram API errors rather than a 500 — add a fallback path: if `syncFeed` throws, serve stale cache and log the error.
- Add a `?force=true` query param (protected by `CRON_SECRET`) to bypass TTL for manual refreshes.

---

### IG-013 · Add CORS and request validation middleware

**Complexity:** S
**Dependencies:** IG-001

**Description:**
Restrict feed endpoint access to known origins and add basic request validation.

**Implementation (`src/middleware/cors.ts`):**
```typescript
import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://zubercarrelage.com',
  'https://www.zubercarrelage.com',
  'http://localhost:8000',  // Gatsby dev
  'http://localhost:9000',  // Gatsby build preview
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET'],
});
```

**Notes:**
- Gatsby static builds make requests from the browser, so `origin` will be set — allowlist the production domain.
- During `gatsby develop`, origin is `localhost:8000` — include it in dev.
- Apply `corsMiddleware` only to `/api/feed`, not to the auth routes.

---

## Phase 5 — Token Auto-Refresh

---

### IG-014 · Token refresh service

**Complexity:** S
**Dependencies:** IG-006

**Description:**
Create `src/services/tokenRefresh.ts` — refreshes a long-lived Instagram token before it expires.

**Instagram refresh endpoint:**
```
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token={current_long_lived_token}
```
Returns a new `access_token` and `expires_in`.

**Implementation:**
```typescript
export async function refreshInstagramToken(currentToken: string): Promise<RefreshedToken> {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', currentToken);

  const { data } = await axios.get(url.toString());
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

export async function refreshAllTokens(): Promise<void> {
  const { data: accounts } = await supabase
    .from('instagram_accounts')
    .select('instagram_user_id, access_token, token_expires_at');

  for (const account of accounts ?? []) {
    const expiresAt = new Date(account.token_expires_at);
    const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry <= 10) { // Refresh when ≤ 10 days remain
      const refreshed = await refreshInstagramToken(account.access_token);
      await supabase.from('instagram_accounts').update({
        access_token: refreshed.access_token,
        token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000),
        updated_at: new Date(),
      }).eq('instagram_user_id', account.instagram_user_id);

      console.log(`[TokenRefresh] Refreshed token for ${account.instagram_user_id}`);
    }
  }
}
```

**Notes:**
- Refresh when ≤ 10 days remain (not on expiry day) to give a safety buffer.
- A token can only be refreshed if it hasn't already expired. If expired, the client must re-authorize via the admin UI.

---

### IG-015 · Cron job — scheduled token refresh + feed sync

**Complexity:** M
**Dependencies:** IG-014, IG-011

**Description:**
Set up automated daily execution of token refresh and feed sync. Two approaches depending on hosting:

**Option A — Vercel (serverless):**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 6 * * *"
    }
  ]
}
```
Create `/api/cron/daily.ts`:
```typescript
export default async function handler(req, res) {
  const secret = req.headers['authorization']?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) return res.status(401).end();

  await refreshAllTokens();
  // Optionally: sync feed for all accounts
  const { data: accounts } = await supabase.from('instagram_accounts').select('instagram_user_id');
  for (const account of accounts ?? []) {
    await syncFeed(account.instagram_user_id);
  }

  res.json({ ok: true, ran_at: new Date().toISOString() });
}
```

**Option B — Render or self-hosted (node-cron):**
```typescript
import cron from 'node-cron';
cron.schedule('0 6 * * *', async () => {
  console.log('[Cron] Running daily refresh...');
  await refreshAllTokens();
});
```

**Notes:**
- Vercel's built-in cron (Pro plan required for custom schedules — free plan supports daily via external ping).
- Free alternative: use [cron-job.org](https://cron-job.org) to ping `/api/cron/daily` daily with a Bearer token.
- Always log cron execution results to identify silent failures.

---

## Phase 6 — Admin UI

---

### IG-016 · Build static admin connect page

**Complexity:** S
**Dependencies:** IG-005, IG-006

**Description:**
Create `public/index.html` — a minimal page the client opens once to connect their Instagram account. No framework needed.

**Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Instagram Feed — Connect Account</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 60px auto; padding: 0 20px; }
    .btn { background: #E1306C; color: white; padding: 12px 24px; border: none;
           border-radius: 6px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block; }
    .status { margin-top: 24px; padding: 12px; border-radius: 6px; }
    .connected { background: #d4edda; color: #155724; }
    .disconnected { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>Instagram Feed Setup</h1>
  <p>Connect the Instagram account whose posts will appear on the website.</p>

  <div id="status" class="status disconnected">Checking connection status...</div>

  <br><br>
  <a href="/auth/instagram" class="btn">Connect Instagram Account</a>

  <script>
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById('status');
        if (data.connected) {
          el.className = 'status connected';
          el.textContent = `✅ Connected as @${data.username} — Token expires ${data.tokenExpiresAt}`;
        } else {
          el.className = 'status disconnected';
          el.textContent = '❌ No Instagram account connected.';
        }
      });
  </script>
</body>
</html>
```

**Notes:**
- This page should be protected by basic HTTP auth in production (add via Vercel or Nginx config) — it's an admin tool, not public-facing.
- The `/api/status` endpoint (see IG-017) powers the connection status display.

---

### IG-017 · Build GET /api/status endpoint

**Complexity:** S
**Dependencies:** IG-003

**Description:**
`GET /api/status` — returns the current connection state for the admin UI.

**Implementation:**
```typescript
router.get('/status', async (req, res) => {
  const { data: account } = await supabase
    .from('instagram_accounts')
    .select('username, token_expires_at')
    .limit(1)
    .single();

  if (!account) {
    return res.json({ connected: false });
  }

  res.json({
    connected: true,
    username: account.username,
    tokenExpiresAt: new Date(account.token_expires_at).toLocaleDateString('fr-FR'),
  });
});
```

**Notes:**
- No sensitive data (access token) is returned to the browser.
- If multiple accounts are ever supported, this endpoint will need to list all accounts.

---

## Phase 7 — Gatsby Integration

---

### IG-018 · Update feed URL in InstagramCarousel.tsx

**Complexity:** S
**Dependencies:** IG-012

**Description:**
Replace the Behold.so feed URL constant with the new API endpoint URL.

**Location:** Find the current feed URL constant in `InstagramCarousel.tsx` (or its associated hook/data file).

**Change:**
```typescript
// Before:
const FEED_URL = 'https://feeds.behold.so/YOUR_BEHOLD_KEY';

// After:
const FEED_URL = process.env.GATSBY_INSTAGRAM_FEED_URL
  ?? 'https://your-api-domain.com/api/feed';
```

**Add to `.env.development` and `.env.production` in the Gatsby project:**
```
GATSBY_INSTAGRAM_FEED_URL=https://your-api-domain.com/api/feed
```

**Notes:**
- Gatsby environment variables exposed to the browser must be prefixed with `GATSBY_`.
- If the current component fetches at build time (via `gatsby-node.ts` or `gatsby-config.ts`), the fetch happens server-side during `gatsby build` — no prefix needed in that case.
- Verify the existing component handles the new JSON structure. The schema defined in this project matches what Behold returns, but confirm field names match exactly (e.g. `mediaType` vs `media_type`).

---

### IG-019 · Verify component compatibility with new feed schema

**Complexity:** S
**Dependencies:** IG-018, IG-012

**Description:**
Audit `InstagramCarousel.tsx` to confirm it handles the new JSON shape without modification.

**Checklist:**
- [ ] Component reads `response.posts` (array) — ✅ matches our schema
- [ ] Accesses `post.sizes.medium.mediaUrl` — ✅ matches our schema
- [ ] Handles `mediaType === 'VIDEO'` (thumbnail displayed, not video player) — verify
- [ ] Handles missing `caption` gracefully (empty string fallback) — verify
- [ ] No field names differ between Behold output and our output

**How to test locally:**
1. Run the API locally on port 3000.
2. Point `GATSBY_INSTAGRAM_FEED_URL` to `http://localhost:3000/api/feed`.
3. Run `gatsby develop` and verify the carousel renders correctly.

**Notes:**
- If field names differ, fix them in `feedTransformer.ts` (IG-010) — not in the Gatsby component.
- Keep the Gatsby component unchanged if possible to minimize risk.

---

## Phase 8 — Testing & Deployment

---

### IG-020 · Write integration tests for OAuth flow

**Complexity:** M
**Dependencies:** IG-005, IG-006, IG-007

**Description:**
Test the OAuth callback with mocked Instagram responses to verify token exchange and Supabase writes without hitting real APIs.

**Tools:** Jest + `nock` (HTTP mocking) or `msw` (Mock Service Worker).

**Test cases:**
- [ ] `GET /auth/instagram` returns 302 redirect to `api.instagram.com/oauth/authorize` with correct params
- [ ] `GET /auth/instagram/callback?code=valid` completes token exchange and returns success page
- [ ] `GET /auth/instagram/callback?code=invalid` handles Instagram 400 error gracefully
- [ ] `POST /auth/instagram/deauth` with valid signature deletes account from Supabase
- [ ] `POST /auth/instagram/deauth` with invalid signature returns 403

---

### IG-021 · Write integration tests for feed endpoint

**Complexity:** M
**Dependencies:** IG-012, IG-011

**Test cases:**
- [ ] `GET /api/feed` returns cached feed when cache is fresh (no Instagram API call made)
- [ ] `GET /api/feed` calls `syncFeed` when cache is stale
- [ ] `GET /api/feed` returns stale cache (not 500) when Instagram API is unreachable
- [ ] `GET /api/feed` returns 503 when no account is connected
- [ ] Response includes `posts` array with correct field structure
- [ ] Response includes `Cache-Control` header
- [ ] `GET /api/feed` from disallowed CORS origin returns 403

---

### IG-022 · Deploy API to Vercel

**Complexity:** M
**Dependencies:** All Phase 1–6 tasks

**Description:**
Deploy the Express API to Vercel as a serverless Node.js app.

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "src/index.ts", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "src/index.ts" }]
   }
   ```
3. Run `vercel` → follow prompts to link project.
4. Set all environment variables via `vercel env add` or the Vercel dashboard.
5. Set `INSTAGRAM_REDIRECT_URI` to the production Vercel URL.
6. Update the Meta app dashboard OAuth redirect URI to match.
7. Run `vercel --prod` to deploy to production.

**Checklist:**
- [ ] All env vars set in Vercel dashboard
- [ ] `INSTAGRAM_REDIRECT_URI` updated to production URL in both `.env` and Meta app dashboard
- [ ] `/api/feed` responds with valid JSON
- [ ] `/connect` page loads and shows correct connection status
- [ ] Cron job scheduled (via `vercel.json` or cron-job.org)

---

### IG-023 · End-to-end smoke test

**Complexity:** S
**Dependencies:** IG-022, IG-018

**Description:**
Manual verification checklist after full deployment.

**Steps:**
1. Open `https://your-api-domain.com/connect`.
2. Click "Connect Instagram Account" → complete OAuth flow.
3. Verify status page shows `✅ Connected as @username`.
4. Open `https://your-api-domain.com/api/feed` → confirm valid JSON with 12 posts.
5. Check each post has `sizes.small.mediaUrl`, `sizes.medium.mediaUrl`, `sizes.large.mediaUrl`.
6. Open Cloudinary dashboard → confirm fetch transformations are cached.
7. Open Gatsby site (production) → confirm carousel renders Instagram images.
8. Trigger manual cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-api-domain.com/api/cron/daily`.
9. Verify `token_expires_at` is updated in Supabase if token was near expiry.

---

## Task Summary

| ID | Title | Phase | Complexity | Depends On |
|----|-------|-------|------------|------------|
| IG-001 | Initialize project repository | 1 | S | — |
| IG-002 | Configure environment variables | 1 | S | IG-001 |
| IG-003 | Provision Supabase database | 1 | S | IG-002 |
| IG-004 | Register Meta developer app | 1 | S | — |
| IG-005 | OAuth authorization redirect endpoint | 2 | S | IG-001, IG-002, IG-004 |
| IG-006 | OAuth callback — exchange code for token | 2 | M | IG-005, IG-003 |
| IG-007 | Deauthorization webhook endpoint | 2 | S | IG-006 |
| IG-008 | Instagram media fetching service | 3 | M | IG-006 |
| IG-009 | Cloudinary image transformation service | 3 | M | IG-001, IG-002 |
| IG-010 | Feed transformation — map posts to schema | 3 | S | IG-008, IG-009 |
| IG-011 | Feed sync service — fetch, transform, cache | 3 | M | IG-008, IG-010, IG-003 |
| IG-012 | GET /api/feed endpoint | 4 | M | IG-011 |
| IG-013 | CORS and request validation middleware | 4 | S | IG-001 |
| IG-014 | Token refresh service | 5 | S | IG-006 |
| IG-015 | Cron job — token refresh + feed sync | 5 | M | IG-014, IG-011 |
| IG-016 | Static admin connect page | 6 | S | IG-005, IG-006 |
| IG-017 | GET /api/status endpoint | 6 | S | IG-003 |
| IG-018 | Update feed URL in InstagramCarousel.tsx | 7 | S | IG-012 |
| IG-019 | Verify component compatibility | 7 | S | IG-018, IG-012 |
| IG-020 | Integration tests — OAuth flow | 8 | M | IG-005, IG-006, IG-007 |
| IG-021 | Integration tests — feed endpoint | 8 | M | IG-012, IG-011 |
| IG-022 | Deploy API to Vercel | 8 | M | All Phase 1–6 |
| IG-023 | End-to-end smoke test | 8 | S | IG-022, IG-018 |

---

## Suggested Build Order

```
IG-001 → IG-002 → IG-003
IG-004 (parallel with above)
         ↓
       IG-005 → IG-006 → IG-007
                  ↓
       IG-008 + IG-009 (parallel)
                  ↓
               IG-010 → IG-011 → IG-012 + IG-013
                           ↓
                      IG-014 → IG-015
                           ↓
                  IG-016 + IG-017 (parallel)
                           ↓
                  IG-018 → IG-019
                           ↓
             IG-020 + IG-021 (parallel)
                           ↓
                        IG-022 → IG-023
```

---

*Last updated: May 2026*
