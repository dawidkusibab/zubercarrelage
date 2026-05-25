import React from 'react';
import carrelageImg from '../images/carrelage.png';
import mosaicImg from '../images/mosaic.png';
import poolImg from '../images/swimming_pool.png';
import balconyImg from '../images/balcony.png';
import renovationImg from '../images/renovation.png';
import maconnerieImg from '../images/maconnerie.png';
import { useScrollReveal } from '../hooks/useScrollReveal';

const MAX_REVEAL_DELAY = 6; // must match the highest .reveal-delay-N class in _animations.scss

interface ServiceCard {
  img: string;
  alt: string;
  title: string;
  desc: string;
}

const serviceCards: ServiceCard[] = [
  {
    img: carrelageImg,
    alt: 'Pose de carrelage',
    title: 'Pose de Carrelage',
    desc: 'Carrelage et pierre naturelle, intérieur et extérieur, tous formats.',
  },
  {
    img: mosaicImg,
    alt: 'Mosaïque & Grand Format',
    title: 'Mosaïque & Grand Format',
    desc: 'Pose de mosaïque artistique et carrelage de grand format.',
  },
  {
    img: poolImg,
    alt: 'Piscine & Wellness',
    title: 'Piscine & Wellness',
    desc: 'Piscines, spas, hammams et espaces bien-être.',
  },
  {
    img: balconyImg,
    alt: 'Balcon & Terrasse',
    title: 'Balcon & Terrasse',
    desc: 'Pose extérieure résistante aux intempéries et au gel.',
  },
  {
    img: renovationImg,
    alt: 'Rénovation',
    title: 'Rénovation',
    desc: 'Rénovation complète et nouvelles constructions.',
  },
  {
    img: maconnerieImg,
    alt: 'Petite Maçonnerie',
    title: 'Petite Maçonnerie',
    desc: 'Travaux de maçonnerie complémentaires à la pose.',
  },
];

const Services: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.2);
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.1);

  return (
    <section className="zf-services" id="services">
      <div
        ref={headerRef}
        className={`zf-section-header reveal reveal-up${headerVisible ? ' is-visible' : ''}`}
      >
        <span className="zf-section-tag">Ce que nous faisons</span>
        <h2 className="zf-section-title">Nos Services</h2>
      </div>

      <div ref={gridRef} className="zf-services-cards">
        {serviceCards.map((card, i) => (
          <div
            key={card.title}
            className={`zf-cat-card zf-icon-card zf-service-card reveal reveal-up reveal-delay-${Math.min(i + 1, MAX_REVEAL_DELAY)}${gridVisible ? ' is-visible' : ''}`}
          >
            <div className="zf-cat-img-circle-wrap">
              <img src={card.img} alt={card.alt} className="zf-cat-img-circle" />
            </div>
            <div className="zf-cat-body">
              <h3 className="zf-cat-name">{card.title}</h3>
              <p className="zf-cat-desc">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
