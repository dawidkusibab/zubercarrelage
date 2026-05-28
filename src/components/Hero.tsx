import React from 'react';
import { smoothScrollTo } from '../utils/smoothScroll';
import useStrapiHome from '../hooks/useStrapiHome';

const FALLBACK_TITLE = 'Zuber & Fils Carrelage';
const FALLBACK_SUBTITLE =
  'Maîtrises fédérales, expert en cas de litige, formateur en entreprises et expert au CFC';
const FALLBACK_DESCRIPTION =
  "Depuis 1988, nous posons le carrelage avec la précision d'un maître fédéral et la passion d'une famille. Rénovation, nouvelle construction ou projet sur mesure — chaque détail est soigné, chaque réalisation est unique.";
const FALLBACK_ALT1 = 'Pose de carrelage';
const FALLBACK_ALT2 = 'Réalisation carrelage';

const Hero: React.FC = () => {
  const { data, error } = useStrapiHome();

  if (process.env.NODE_ENV === 'development' && error) {
    console.error('[Hero] Strapi fetch failed:', error);
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    smoothScrollTo(href);
  };

  const title = data?.title ?? FALLBACK_TITLE;
  const subtitle = data?.subtitle ?? FALLBACK_SUBTITLE;
  const description = data?.description ?? FALLBACK_DESCRIPTION;

  const img1Src = data?.image1?.url ?? null;
  const img1Alt = data?.image1?.alternativeText ?? FALLBACK_ALT1;
  const img2Src = data?.image2?.url ?? null;
  const img2Alt = data?.image2?.alternativeText ?? FALLBACK_ALT2;

  return (
    <section className="zf-hero" id="home">
      {/* Topographic SVG pattern */}
      <svg
        className="zf-topo-bg"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <style>{'.topo{fill:none;stroke:#C8602A;stroke-width:1.5;}'}</style>
        </defs>
        <ellipse className="topo" cx="720" cy="450" rx="600" ry="380" />
        <ellipse className="topo" cx="720" cy="450" rx="530" ry="330" />
        <ellipse className="topo" cx="720" cy="450" rx="460" ry="280" />
        <ellipse className="topo" cx="720" cy="450" rx="390" ry="230" />
        <ellipse className="topo" cx="720" cy="450" rx="320" ry="180" />
        <ellipse className="topo" cx="720" cy="450" rx="250" ry="130" />
        <ellipse className="topo" cx="720" cy="450" rx="180" ry="85" />
        <ellipse className="topo" cx="720" cy="450" rx="110" ry="50" />
        <ellipse className="topo" cx="200" cy="150" rx="280" ry="200" />
        <ellipse className="topo" cx="200" cy="150" rx="220" ry="150" />
        <ellipse className="topo" cx="200" cy="150" rx="160" ry="100" />
        <ellipse className="topo" cx="1300" cy="750" rx="250" ry="180" />
        <ellipse className="topo" cx="1300" cy="750" rx="190" ry="130" />
        <ellipse className="topo" cx="1300" cy="750" rx="130" ry="80" />
      </svg>

      <div className="zf-hero-container">
        <div className="zf-hero-text">
          <span className="zf-hero-tagline hero-tagline-anim">{subtitle}</span>
          <h1 className="zf-hero-title hero-title-anim">{title}</h1>
          <p className="zf-hero-sub hero-sub-anim">{description}</p>
          {/* Desktop button */}
          <a
            href="#portfolio"
            className="btn-gallery hero-btn-anim zf-hero-btn-desktop"
            onClick={(e) => handleNavClick(e, '#portfolio')}
          >
            Voir Notre Galerie
          </a>
        </div>

        <div className="zf-hero-images">
          {img1Src !== null && (
            <img
              src={img1Src}
              alt={img1Alt}
              className="zf-hero-img-main hero-img-main-anim"
            />
          )}
          {img2Src !== null && (
            <img
              src={img2Src}
              alt={img2Alt}
              className="zf-hero-img-small hero-img-small-anim"
            />
          )}
        </div>

        {/* Mobile button — shown below image on mobile only */}
        <a
          href="#portfolio"
          className="btn-gallery hero-btn-anim zf-hero-btn-mobile"
          onClick={(e) => handleNavClick(e, '#portfolio')}
          aria-hidden="true"
        >
          Voir Notre Galerie
        </a>
      </div>
    </section>
  );
};

export default Hero;
