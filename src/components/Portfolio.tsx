import React, { useState } from 'react';
import work1 from '../images/work1.jpg';
import work2 from '../images/work2.jpg';
import work3 from '../images/work3.jpg';
import work4 from '../images/work4.jpg';
import { useScrollReveal } from '../hooks/useScrollReveal';

type FilterKey = '*' | 'interieur' | 'salle-de-bain' | 'sur-mesure' | 'exterieur';

interface PortfolioItem {
  id: number;
  img: string;
  alt: string;
  title: string;
  description: string;
  filters: FilterKey[];
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    img: work1,
    alt: 'Salon Moderne',
    title: 'Salon Moderne',
    description: 'Carrelage grand format',
    filters: ['interieur', 'salle-de-bain'],
  },
  {
    id: 2,
    img: work2,
    alt: 'Salle de bain',
    title: 'Salle de bain',
    description: 'Mosaïque & carrelage blanc',
    filters: ['sur-mesure', 'interieur'],
  },
  {
    id: 3,
    img: work3,
    alt: 'Design Sur-Mesure',
    title: 'Design Sur-Mesure',
    description: 'Motifs personnalisés',
    filters: ['salle-de-bain', 'exterieur', 'interieur', 'sur-mesure'],
  },
  {
    id: 4,
    img: work4,
    alt: 'Terrasse Extérieure',
    title: 'Terrasse Extérieure',
    description: 'Grès antidérapant',
    filters: ['salle-de-bain', 'exterieur'],
  },
];

interface FilterButton {
  key: FilterKey;
  label: string;
}

const filterButtons: FilterButton[] = [
  { key: '*', label: 'Tout' },
  { key: 'interieur', label: 'Intérieur' },
  { key: 'salle-de-bain', label: 'Salle de bain' },
  { key: 'sur-mesure', label: 'Sur-mesure' },
  { key: 'exterieur', label: 'Extérieur' },
];

const MAX_STAGGER_DELAY = 6;

const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('*');

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.2);
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.1);

  const isItemVisible = (item: PortfolioItem): boolean => {
    if (activeFilter === '*') return true;
    return item.filters.includes(activeFilter);
  };

  return (
    <section className="zf-portfolio" id="portfolio">
      <div ref={headerRef} className="zf-portfolio-header">
        <div>
          <span className={`zf-section-tag reveal reveal-up${headerVisible ? ' is-visible' : ''}`}>
            Nos Réalisations
          </span>
          <h2 className={`zf-section-title reveal reveal-up reveal-delay-1${headerVisible ? ' is-visible' : ''}`}>
            Quelques-uns de Nos Travaux
          </h2>
        </div>
        <div className={`zf-portfolio-filters reveal reveal-fade reveal-delay-2${headerVisible ? ' is-visible' : ''}`}>
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              className={`zf-filter-btn${activeFilter === btn.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(btn.key)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="zf-portfolio-grid">
        {portfolioItems.map((item, i) => (
          <div
            key={item.id}
            className={[
              'zf-portfolio-item',
              `reveal reveal-scale reveal-delay-${Math.min(i + 1, MAX_STAGGER_DELAY)}`,
              gridVisible ? 'is-visible' : '',
              !isItemVisible(item) ? 'hidden' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <img src={item.img} alt={item.alt} />
            <div className="zf-portfolio-overlay">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="zf-portfolio-cta">
        <a href="#contact" className="btn-accent">Voir Toutes les Réalisations</a>
      </div>
    </section>
  );
};

export default Portfolio;
