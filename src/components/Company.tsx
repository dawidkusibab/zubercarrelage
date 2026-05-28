import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';
import useStrapiHistory from '../hooks/useStrapiHistory';
import useStrapiStatistic from '../hooks/useStrapiStatistic';

const FALLBACK_STATS: Array<{ number: string; label: string }> = [
  { number: '35+', label: "Années d'expérience" },
  { number: '500+', label: 'Projets réalisés' },
  { number: '100%', label: 'Satisfaction client' },
];

const Company: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.15);
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal(0.2);
  const { data, error } = useStrapiHistory();
  const { data: statsData, error: statsError } = useStrapiStatistic();

  if (process.env.NODE_ENV === 'development' && error) {
    console.error('[Company] Strapi fetch failed:', error);
  }
  if (process.env.NODE_ENV === 'development' && statsError) {
    console.error('[Company] Strapi statistic fetch failed:', statsError);
  }

  const displayStats = statsData
    ? statsData.metrics.map((m) => ({
        key: String(m.id),
        number: m.value === 100 ? `${m.value}%` : `${m.value}+`,
        label: m.name,
      }))
    : FALLBACK_STATS.map((s) => ({ key: s.label, number: s.number, label: s.label }));

  return (
    <section id="company" className="zf-company">
      <div ref={ref} className="zf-company-container">
        {/* Left: Image */}
        <div className={`zf-company-img-wrap reveal reveal-left${isVisible ? ' is-visible' : ''}`}>
          <img
            src={data?.image?.url}
            alt={data?.image?.alternativeText ?? 'Zuber & Fils Carrelage — experts en pose de carrelage'}
            className="zf-company-img"
          />
        </div>

        {/* Right: Text */}
        <div className={`zf-company-text reveal reveal-right reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
          <span className="zf-section-tag">{data?.subtitle ?? 'Notre Histoire'}</span>
          <h2 className="zf-company-title">
            {data
              ? data.title
              : <>Une Entreprise Familiale<br />depuis 1988</>
            }
          </h2>
          {data
            ? (data.description ?? '')
                .split(/\r?\n\r?\n/)
                .map(p => p.trim())
                .filter(Boolean)
                .map((para) => (
                  <p key={para.slice(0, 40)} className="zf-company-desc">{para}</p>
                ))
            : (
              <>
                <p className="zf-company-desc">
                  Fini les carreaux démodés ou abîmés ! L&apos;association des bons matériaux permet aujourd'hui
                  de transformer vos intérieurs en espaces élégants et modernes. Chez Zuber &amp; Fils Carrelage,
                  nous donnons vie à vos envies grâce à des réalisations uniques, conçues sur mesure pour votre habitat.
                </p>
                <p className="zf-company-desc">
                  Fondée en 1988 par Christian Zuber et son frère Olivier, l'entreprise Zuber  &amp; 
                  Fils Carrelage perpétue une tradition familiale d'excellence. Après le départ à la retraite de Christian en 2017, 
                  puis celui d'Olivier en 2024, c'est aujourd'hui moi, David Zuber, qui assure seul la direction de la société. 
                  Fort de cet héritage et de l'expérience transmise par mon père, je poursuis l'engagement de qualité qui a forgé 
                  la réputation de l'entreprise depuis plus de 35 ans.
                </p>
                <p className="zf-company-desc">
                  Spécialisés dans la rénovation, nous mettons un point d'honneur à vous assurer un travail propre et soigné, dans les temps.
                </p>
              </>
            )
          }
          <a
            href="#contact"
            className="zf-company-cta"
            onClick={(e) => { e.preventDefault(); smoothScrollTo('#contact'); }}
          >
            Discuter de Votre Projet
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div ref={statsRef} className="zf-company-stats">
        {displayStats.map((stat, i) => (
          <div
            key={stat.key}
            className={`zf-company-stat reveal reveal-up reveal-delay-${i + 1}${statsVisible ? ' is-visible' : ''}`}
          >
            <span className="zf-stat-number">{stat.number}</span>
            <span className="zf-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Company;
