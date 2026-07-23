import React, { useState, useEffect, useCallback } from 'react';
import type { HeadFC } from 'gatsby';
import type { FeedPost } from '../../types/instagram';
import { getImageUrl } from '../../utils/instagramHelpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CardState {
  excluded: boolean;
  loading: boolean;
  error: string | null;
}

type CardStateMap = Record<string, CardState>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FEED_API =
  process.env.GATSBY_INSTAGRAM_FEED_URL ??
  'https://carousel-feed-api-production.up.railway.app/api/feed';

const STRAPI_URL =
  process.env.GATSBY_STRAPI_URL ??
  'https://zubercarrelage-backend-production.up.railway.app';

const STRAPI_TOKEN = process.env.GATSBY_STRAPI_TOKEN ?? '';

const SESSION_KEY = 'admin_auth';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PasswordGateProps {
  onAuth: (pwd: string) => Promise<void>;
  authError?: string | null;
  authLoading?: boolean;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onAuth, authError, authLoading }) => {
  const [value, setValue] = useState('');
  const [emptyError, setEmptyError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    await onAuth(value.trim());
  };

  const hasError = emptyError || !!authError;

  return (
    <div style={styles.gateWrap}>
      <div style={styles.gateCard}>
        <h1 style={styles.gateTitle}>Administration Instagram</h1>
        <p style={styles.gateSubtitle}>Zuber &amp; Fils Carrelage</p>
        <form onSubmit={handleSubmit} style={styles.gateForm}>
          <label htmlFor="admin-pwd" style={styles.gateLabel}>
            Mot de passe
          </label>
          <input
            id="admin-pwd"
            type="password"
            value={value}
            onChange={e => {
              setValue(e.target.value);
              setEmptyError(false);
            }}
            style={{
              ...styles.gateInput,
              ...(hasError ? styles.gateInputError : {}),
            }}
            placeholder="••••••••"
            autoFocus
            disabled={authLoading}
          />
          {emptyError && (
            <p style={styles.gateError}>Veuillez saisir un mot de passe.</p>
          )}
          {authError && !emptyError && (
            <p style={styles.gateError}>{authError}</p>
          )}
          <button type="submit" style={styles.gateBtn} disabled={authLoading}>
            {authLoading ? 'Vérification…' : 'Accéder'}
          </button>
        </form>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: FeedPost;
  state: CardState;
  onToggle: (post: FeedPost) => void;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ post, state, onToggle }) => {
  const { excluded, loading, error } = state;

  return (
    <div
      style={{
        ...styles.card,
        ...(excluded ? styles.cardExcluded : {}),
      }}
    >
      {/* Dimming overlay for excluded posts */}
      {excluded && <div style={styles.excludedOverlay} aria-hidden="true" />}

      <img
        src={getImageUrl(post)}
        alt={post.caption ? post.caption.slice(0, 60) : 'Photo Instagram'}
        style={styles.cardImg}
        loading="lazy"
      />

      <div style={styles.cardFooter}>
        {/* Status badge */}
        <span
          style={{
            ...styles.badge,
            ...(excluded ? styles.badgeExcluded : styles.badgeVisible),
          }}
        >
          {excluded ? '🚫 Masquée' : '✓ Visible'}
        </span>

        {/* Toggle button */}
        <button
          style={{
            ...styles.toggleBtn,
            ...(excluded ? styles.toggleBtnInclude : styles.toggleBtnExclude),
            ...(loading ? styles.toggleBtnLoading : {}),
          }}
          onClick={() => onToggle(post)}
          disabled={loading}
        >
          {loading ? 'Chargement…' : excluded ? 'Afficher' : 'Masquer'}
        </button>
      </div>

      {error && <p style={styles.cardError}>{error}</p>}
    </div>
  );
});

PostCard.displayName = 'PostCard';

// ---------------------------------------------------------------------------
// Main admin page
// ---------------------------------------------------------------------------

const AdminInstagramPage: React.FC = () => {
  const [password, setPassword] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cardStates, setCardStates] = useState<CardStateMap>({});
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Restore session on mount (SSR guard)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setPassword(stored);
  }, []);

  const handleAuth = useCallback(async (pwd: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/instagram-exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', postId: '_', password: pwd }),
      });

      if (res.status === 401) {
        setAuthError('Mot de passe incorrect.');
        return;
      }
      if (!res.ok) {
        setAuthError('Erreur serveur, veuillez réessayer.');
        return;
      }

      sessionStorage.setItem(SESSION_KEY, pwd);
      setPassword(pwd);
    } catch {
      setAuthError('Connexion impossible, veuillez réessayer.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Fetch posts + exclusions once authenticated
  useEffect(() => {
    if (!password) return;

    setPageLoading(true);
    setPageError(null);

    const feedPromise = fetch(FEED_API).then(res => {
      if (!res.ok) throw new Error('Impossible de charger le feed Instagram.');
      return res.json() as Promise<{ posts: FeedPost[] }>;
    });

    interface StrapiExclusionEntry {
      documentId: string;
      postId: string;
    }

    const exclusionsPromise = fetch(
      `${STRAPI_URL}/api/instagram-excluded-posts`,
      { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
    )
      .then(res => {
        if (!res.ok) throw new Error(`Strapi GET failed (${res.status})`);
        return res.json() as Promise<{ data: StrapiExclusionEntry[] }>;
      })
      .then(json => json.data ?? [])
      .catch(err => {
        console.warn('[Admin] Strapi exclusions fetch failed:', err);
        return [] as StrapiExclusionEntry[];
      });

    Promise.all([feedPromise, exclusionsPromise])
      .then(([feedData, exclusions]) => {
        const fetchedPosts = feedData.posts ?? [];

        // Build excluded set
        const excludedSet = new Set<string>();
        for (const entry of exclusions) {
          excludedSet.add(entry.postId);
        }

        setPosts(fetchedPosts);

        const initialStates: CardStateMap = {};
        for (const post of fetchedPosts) {
          initialStates[post.id] = {
            excluded: excludedSet.has(post.id),
            loading: false,
            error: null,
          };
        }
        setCardStates(initialStates);
        setPageLoading(false);
      })
      .catch(err => {
        setPageError(err instanceof Error ? err.message : 'Erreur inconnue.');
        setPageLoading(false);
      });
  }, [password]);

  const handleToggle = useCallback(
    async (post: FeedPost) => {
      if (!password) return;

      // Read current state directly before any async work
      const current = cardStates[post.id];
      if (!current || current.loading) return;

      const currentExcluded = current.excluded;
      const action: 'exclude' | 'include' = currentExcluded ? 'include' : 'exclude';

      setCardStates(prev => ({
        ...prev,
        [post.id]: { ...prev[post.id], loading: true, error: null },
      }));

      try {
        const res = await fetch('/api/admin/instagram-exclusions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, postId: post.id, password }),
        });

        const json = (await res.json()) as { success?: true; error?: string };

        if (!res.ok || json.error) {
          // Wrong password → clear session
          if (res.status === 401) {
            sessionStorage.removeItem(SESSION_KEY);
            setPassword(null);
            return;
          }
          throw new Error(json.error ?? 'Erreur serveur');
        }

        setCardStates(prev => ({
          ...prev,
          [post.id]: { excluded: action === 'exclude', loading: false, error: null },
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setCardStates(prev => ({
          ...prev,
          [post.id]: { ...prev[post.id], loading: false, error: message },
        }));
      }
    },
    [password, cardStates]
  );

  // --- Render: password gate ---
  if (!password) {
    return (
      <PasswordGate
        onAuth={handleAuth}
        authError={authError}
        authLoading={authLoading}
      />
    );
  }

  // --- Render: loading ---
  if (pageLoading) {
    return (
      <div style={styles.centerWrap}>
        <p style={styles.loadingText}>Chargement des photos…</p>
      </div>
    );
  }

  // --- Render: error ---
  if (pageError) {
    return (
      <div style={styles.centerWrap}>
        <p style={styles.errorText}>{pageError}</p>
        <button
          style={styles.retryBtn}
          onClick={() => {
            setPassword(null);
            sessionStorage.removeItem(SESSION_KEY);
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // --- Render: admin grid ---
  const excludedCount = Object.values(cardStates).filter(s => s.excluded).length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Gestion du feed Instagram</h1>
          <p style={styles.headerMeta}>
            {posts.length} photo{posts.length !== 1 ? 's' : ''} · {excludedCount} masquée
            {excludedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={() => {
            sessionStorage.removeItem(SESSION_KEY);
            setPassword(null);
          }}
        >
          Déconnexion
        </button>
      </header>

      <main style={styles.grid}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            state={cardStates[post.id] ?? { excluded: false, loading: false, error: null }}
            onToggle={handleToggle}
          />
        ))}
      </main>
    </div>
  );
};

export default AdminInstagramPage;

export const Head: HeadFC = () => (
  <>
    <title>Admin Instagram — Zuber Carrelage</title>
    <meta name="robots" content="noindex, nofollow" />
  </>
);

// ---------------------------------------------------------------------------
// Inline styles (no external file needed — admin page is internal-only)
// ---------------------------------------------------------------------------

const styles = {
  // Password gate
  gateWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f4f0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  gateCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '48px 40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: 380,
  } as React.CSSProperties,

  gateTitle: {
    margin: '0 0 4px',
    fontSize: 22,
    fontWeight: 600,
    color: '#1a1a1a',
  } as React.CSSProperties,

  gateSubtitle: {
    margin: '0 0 32px',
    fontSize: 13,
    color: '#888',
  } as React.CSSProperties,

  gateForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  } as React.CSSProperties,

  gateLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: '#444',
  } as React.CSSProperties,

  gateInput: {
    padding: '10px 14px',
    border: '1.5px solid #d0d0d0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color .15s',
  } as React.CSSProperties,

  gateInputError: {
    borderColor: '#e03d3d',
  } as React.CSSProperties,

  gateError: {
    margin: 0,
    fontSize: 12,
    color: '#e03d3d',
  } as React.CSSProperties,

  gateBtn: {
    marginTop: 8,
    padding: '11px 0',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,

  // Page layout
  page: {
    minHeight: '100vh',
    background: '#f4f4f0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
  } as React.CSSProperties,

  headerTitle: {
    margin: '0 0 2px',
    fontSize: 20,
    fontWeight: 600,
    color: '#1a1a1a',
  } as React.CSSProperties,

  headerMeta: {
    margin: 0,
    fontSize: 13,
    color: '#888',
  } as React.CSSProperties,

  logoutBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1.5px solid #d0d0d0',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    color: '#555',
  } as React.CSSProperties,

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    padding: 32,
  } as React.CSSProperties,

  // Cards
  card: {
    position: 'relative' as const,
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'box-shadow .2s',
  } as React.CSSProperties,

  cardExcluded: {
    opacity: 0.65,
  } as React.CSSProperties,

  excludedOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'rgba(220, 50, 50, 0.12)',
    zIndex: 1,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  cardImg: {
    display: 'block',
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover' as const,
  } as React.CSSProperties,

  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    gap: 8,
  } as React.CSSProperties,

  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  badgeVisible: {
    background: '#e8f5e9',
    color: '#2e7d32',
  } as React.CSSProperties,

  badgeExcluded: {
    background: '#ffebee',
    color: '#c62828',
  } as React.CSSProperties,

  toggleBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity .15s',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  toggleBtnExclude: {
    background: '#e03d3d',
    color: '#fff',
  } as React.CSSProperties,

  toggleBtnInclude: {
    background: '#2e7d32',
    color: '#fff',
  } as React.CSSProperties,

  toggleBtnLoading: {
    opacity: 0.6,
    cursor: 'not-allowed' as const,
  } as React.CSSProperties,

  cardError: {
    margin: '0 12px 10px',
    fontSize: 11,
    color: '#e03d3d',
  } as React.CSSProperties,

  // Utility
  centerWrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    gap: 16,
  } as React.CSSProperties,

  loadingText: {
    fontSize: 16,
    color: '#555',
  } as React.CSSProperties,

  errorText: {
    fontSize: 15,
    color: '#e03d3d',
    maxWidth: 400,
    textAlign: 'center' as const,
  } as React.CSSProperties,

  retryBtn: {
    padding: '10px 24px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  } as React.CSSProperties,
} as const;
