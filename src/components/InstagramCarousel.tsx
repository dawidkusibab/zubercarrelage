import React, { useState, useEffect, useCallback } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const INSTAGRAM_URL = 'https://www.instagram.com/zubercarrelage/';
const BEHOLD_API = 'https://feeds.behold.so/kJjXg30b90IsyawsTcc3';

interface BeholdPostSize {
  mediaUrl: string;
  height: number;
  width: number;
}

interface BeholdPost {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  caption: string | null;
  timestamp: string;
  permalink: string;
  thumbnailUrl?: string;
  sizes?: {
    small?: BeholdPostSize;
    medium?: BeholdPostSize;
    large?: BeholdPostSize;
  };
}

interface BeholdFeed {
  posts: BeholdPost[];
  username: string;
}

const getVisibleCount = (): number => {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const getImageUrl = (post: BeholdPost): string => {
  // Use Behold's CDN (medium size) — Instagram direct URLs have hotlink protection
  if (post.sizes?.medium?.mediaUrl) return post.sizes.medium.mediaUrl;
  if (post.sizes?.large?.mediaUrl) return post.sizes.large.mediaUrl;
  if (post.sizes?.small?.mediaUrl) return post.sizes.small.mediaUrl;
  // Fallback: video thumbnail or direct mediaUrl
  return post.mediaType === 'VIDEO' && post.thumbnailUrl ? post.thumbnailUrl : post.mediaUrl;
};

const getCaption = (post: BeholdPost): string =>
  post.caption ? post.caption.slice(0, 80) + (post.caption.length > 80 ? '…' : '') : '';

const InstagramCarousel: React.FC = () => {
  const [posts, setPosts] = useState<BeholdPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.1);

  // Fetch posts at runtime
  useEffect(() => {
    fetch(BEHOLD_API)
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json() as Promise<BeholdFeed>;
      })
      .then(data => {
        setPosts(data.posts ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Responsive visibleCount
  useEffect(() => {
    setVisibleCount(getVisibleCount());
    const handleResize = () => {
      const next = getVisibleCount();
      setVisibleCount(next);
      setCurrentIndex(prev => Math.max(0, Math.min(prev, Math.max(0, posts.length - next))));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [posts.length]);

  const maxIndex = Math.max(0, posts.length - (visibleCount ?? 4));

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - (visibleCount ?? 4)));
  }, [visibleCount]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + (visibleCount ?? 4)));
  }, [maxIndex, visibleCount]);

  const totalDots = Math.ceil(posts.length / (visibleCount ?? 4));
  const activeDot = Math.floor(currentIndex / (visibleCount ?? 4));

  return (
    <section id="portfolio" className="zf-instagram">
      <div className="zf-instagram-container">

        {/* HEADER ROW */}
        <div
          ref={headerRef}
          className={`zf-ig-header reveal reveal-up${headerVisible ? ' is-visible' : ''}`}
        >
          <div className="zf-ig-header-left">
            <div className="zf-ig-icon-wrap">
              <svg
                className="zf-ig-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div>
              <p className="zf-ig-follow-label">SUIVEZ-NOUS SUR INSTAGRAM</p>
              <p className="zf-ig-handle">@zubercarrelage</p>
            </div>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="zf-ig-cta-btn"
          >
            Voir sur Instagram
          </a>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="zf-ig-loading">
            <div className="zf-ig-loading-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="zf-ig-error">
            Impossible de charger le feed Instagram.{' '}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Voir sur Instagram →
            </a>
          </div>
        )}

        {/* CAROUSEL */}
        {!loading && !error && visibleCount !== null && posts.length > 0 && (
          <div
            className="zf-ig-carousel"
          >
            {/* PREV ARROW */}
            <button
              className="zf-ig-arrow zf-ig-arrow--prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Précédent"
            >
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </button>

            {/* TRACK */}
            <div className="zf-ig-viewport">
              <div
                className="zf-ig-track"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
              >
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="zf-ig-item"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zf-ig-card"
                      aria-label={`Voir la publication Instagram: ${getCaption(post) || 'Photo'}`}
                    >
                      <img
                        src={getImageUrl(post)}
                        alt={getCaption(post) || 'Zuber Carrelage Instagram'}
                        className="zf-ig-card-img"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="zf-ig-card-overlay" aria-hidden="true">
                        {post.mediaType === 'VIDEO' && (
                          <div className="zf-ig-video-badge">▶</div>
                        )}
                        {post.mediaType === 'CAROUSEL_ALBUM' && (
                          <div className="zf-ig-album-badge">⊞</div>
                        )}
                        <p className="zf-ig-card-caption">{getCaption(post)}</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* NEXT ARROW */}
            <button
              className="zf-ig-arrow zf-ig-arrow--next"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Suivant"
            >
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* DOTS */}
        {!loading && !error && totalDots > 1 && (
          <div className="zf-ig-footer">
            <div className="zf-ig-dots">
              {Array.from({ length: totalDots }).map((_, i) => (
                <button
                  key={i}
                  className={`zf-ig-dot${activeDot === i ? ' active' : ''}`}
                  onClick={() => setCurrentIndex(i * (visibleCount ?? 4))}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default InstagramCarousel;
