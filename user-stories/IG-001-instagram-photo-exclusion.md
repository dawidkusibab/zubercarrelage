# IG-001 — Instagram Feed Photo Exclusion Management

---

**ID:** IG-001
**Project:** Zuber Carrelage — Gatsby + Supabase
**Created:** 2026-06-02
**Status:** Draft

---

## User Story

As a **shop owner (admin)**, I want to **mark specific Instagram photos as excluded from the carousel** so that **only curated, relevant images are displayed to visitors on the website**.

---

## Acceptance Criteria

- [ ] 1. A Supabase table `instagram_excluded_posts` exists with columns: `id` (uuid, PK), `post_id` (text, unique, not null), `created_at` (timestamptz, default now()), `reason` (text, nullable).
- [ ] 2. Navigating to `/admin/instagram` shows a password gate before any content is rendered.
- [ ] 3. Entering the correct admin password grants access to the admin page; entering an incorrect password shows an error message and does not reveal any content.
- [ ] 4. The admin page displays all Instagram posts fetched from the Railway API in a responsive photo grid.
- [ ] 5. Each photo in the grid shows a clear visual indicator (e.g. overlay, badge, or dimmed state) when it is currently excluded.
- [ ] 6. Clicking a non-excluded photo marks it as excluded: a record is inserted into `instagram_excluded_posts` and the photo immediately updates its visual state.
- [ ] 7. Clicking an excluded photo marks it as included: the corresponding record is deleted from `instagram_excluded_posts` and the photo immediately updates its visual state.
- [ ] 8. Toggle operations (exclude/include) give the user immediate visual feedback (loading state during async operation, success/error indication after).
- [ ] 9. On page load, the admin grid correctly reflects the current exclusion state of all posts (excluded posts are visually marked on initial render).
- [ ] 10. The `InstagramCarousel` component on the public site filters out any post whose `id` appears in `instagram_excluded_posts` before rendering slides.
- [ ] 11. If the Supabase exclusion query fails on the public carousel, the component degrades gracefully: it renders the full unfiltered feed rather than showing an error or empty state.
- [ ] 12. If zero posts remain after filtering, the carousel component hides itself entirely (no empty carousel shell is shown to visitors).
- [ ] 13. The admin page is not linked from any public navigation — it is accessible only by direct URL.
- [ ] 14. The admin password is stored as a server-side environment variable (`ADMIN_PASSWORD`) and is never exposed in source code or committed to version control. The `GATSBY_` prefix is intentionally omitted — variables prefixed `GATSBY_` are bundled into the browser JS by Gatsby's build process; `ADMIN_PASSWORD` remains server-side only, read exclusively inside the Gatsby API route (`/api/admin/instagram-exclusions`) and never sent to the client.

---

## Technical Notes

### 1. Supabase Table

```sql
create table instagram_excluded_posts (
  id          uuid primary key default gen_random_uuid(),
  post_id     text not null unique,
  created_at  timestamptz not null default now(),
  reason      text
);
```

- Enable Row Level Security (RLS) on the table.
- Add a policy allowing `SELECT` for the **anon** role (needed by the public carousel to read exclusions).
- Add policies allowing `INSERT` and `DELETE` for the **anon** role, scoped only to the admin flow (or use a service role key exclusively on the admin page — preferred for security).
- Consider using the Supabase **service role key** on the admin page (server-side or via a thin API route) to avoid exposing write permissions to the anon key.

### 2. Admin Page — `/admin/instagram`

- Create `src/pages/admin/instagram.tsx` in the Gatsby project.
- Password gate: validate the password server-side via a `verify` API call; only store in `sessionStorage` and load content on success. Never compare client-side using an env var.
- Fetch all posts from the same Railway API endpoint used by `InstagramCarousel`.
- Fetch all excluded `post_id` values from `instagram_excluded_posts` via Supabase client.
- Render a CSS Grid of post thumbnails (use `mediaUrl` for `<img>` src).
- On toggle, call `supabase.from('instagram_excluded_posts').insert(...)` or `.delete().eq('post_id', ...)`.
- This page should be excluded from Gatsby's sitemap and any SEO indexing (`<meta name="robots" content="noindex" />`).

### 3. InstagramCarousel Filtering

- After fetching posts via `useEffect`, perform a secondary async call:
  ```ts
  const { data } = await supabase
    .from('instagram_excluded_posts')
    .select('post_id');
  const excludedIds = new Set(data?.map(r => r.post_id) ?? []);
  const filtered = posts.filter(p => !excludedIds.has(p.id));
  ```
- Both fetches can run in parallel (`Promise.all`) to minimise render delay.
- On Supabase error, log to console and fall back to the unfiltered `posts` array.

### 4. Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `ADMIN_PASSWORD` | API route (server-side only) | Password validated server-side — never bundled into browser JS |
| `GATSBY_SUPABASE_URL` | Frontend + Admin | Supabase project URL |
| `GATSBY_SUPABASE_ANON_KEY` | Public carousel | Read-only anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin page (if SSR/API) | Write access key — never expose publicly |

> **Security note:** If the admin page is purely client-side (Gatsby static), avoid embedding the service role key in `GATSBY_*` vars (they are bundled into the client). Prefer a lightweight Gatsby API route (`/api/admin/exclude`) or a separate Railway endpoint that validates the password server-side before executing write operations.

### 5. Dependencies

- `@supabase/supabase-js` — already in project
- No new npm packages required
- Railway API — no changes needed (admin page reads from same endpoint)

---

## Out of Scope

- Authentication via a proper auth system (OAuth, Supabase Auth, JWT) — a simple password gate is sufficient for v1.
- Audit log of who excluded a post or when (the `created_at` column captures timing but no user identity).
- Bulk exclude/include actions.
- Exclusion of Instagram Reels or video posts (carousel may already skip `VIDEO` mediaType — verify separately).
- Syncing exclusion state back to the Railway/Supabase cache layer.
- Any mobile-specific admin UI — desktop browser usage assumed.
- Automated tests for the admin page.

---

## Definition of Done

- [ ] `instagram_excluded_posts` table created in Supabase with RLS policies applied.
- [ ] `/admin/instagram` page implemented, password-gated, and inaccessible without correct credentials.
- [ ] Admin grid correctly reads and displays live exclusion state from Supabase.
- [ ] Toggle (exclude/include) operations persist correctly to Supabase and reflect instantly in the UI.
- [ ] `InstagramCarousel` filters excluded posts before render; falls back gracefully on error.
- [ ] `ADMIN_PASSWORD` and any sensitive keys are in `.env.local` / Railway env vars — not committed to git.
- [ ] `.env.local` is listed in `.gitignore`.
- [ ] Admin page has `noindex` meta tag.
- [ ] Manual end-to-end test: exclude a post via admin → verify it disappears from the public carousel → re-include it → verify it reappears.

---

## Approvals

| Reviewer | Status | Date | Notes |
|----------|--------|------|-------|
| Bob (grumpy-bob-reviewer) | Pending | — | — |
| Olek (olek-architect) | Pending | — | — |
