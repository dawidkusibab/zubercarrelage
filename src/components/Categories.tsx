import React from 'react';
import carrelageImg from '../images/carrelage.png';
import mosaicImg from '../images/mosaic.png';
import poolImg from '../images/swimming_pool.png';
import balconyImg from '../images/balcony.png';
import renovationImg from '../images/renovation.png';
import maconnerieImg from '../images/maconnerie.png';
import smartphoneImg from '../images/smartphone.png';
import suiviImg from '../images/suivi.png';
import hammerImg from '../images/hammer.png';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface PrestaItem {
  img: string;
  alt: string;
  name: string;
}

const prestations: PrestaItem[] = [
  { img: carrelageImg, alt: 'Pose de carrelage', name: 'Pose de carrelage et pierre naturelle' },
  { img: mosaicImg, alt: 'Mosaïque', name: 'Pose de mosaïque et carrelage de grand format' },
  { img: poolImg, alt: 'Piscine', name: 'Piscine, wellness et espace bien être' },
  { img: balconyImg, alt: 'Balcon & Terrasse', name: 'Pose de balcon et terrasse' },
  { img: renovationImg, alt: 'Rénovation', name: 'Rénovation et nouvelle construction' },
  { img: maconnerieImg, alt: 'Petite maçonnerie', name: 'Petite maçonnerie' },
];

const services: PrestaItem[] = [
  { img: smartphoneImg, alt: 'Conseils', name: 'Conseils à la clientèle' },
  { img: suiviImg, alt: 'Suivi de chantier', name: 'Suivi de chantier et direction de travaux' },
  { img: hammerImg, alt: 'Réparation', name: 'Réparation et entretien' },
];

const Categories: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.2);
  const { ref: prestaGridRef, isVisible: prestaVisible } = useScrollReveal(0.1);
  const { ref: servicesHeaderRef, isVisible: servicesHeaderVisible } = useScrollReveal(0.2);
  const { ref: servicesGridRef, isVisible: servicesVisible } = useScrollReveal(0.1);

  return (
    <section className="zf-categories" id="categories">
      <div
        ref={headerRef}
        className={`zf-section-header reveal reveal-up${headerVisible ? ' is-visible' : ''}`}
      >
        <span className="zf-section-tag">Prestations &amp; Services</span>
        <h2 className="zf-section-title">PRESTATIONS</h2>
      </div>

      <div ref={prestaGridRef} className="zf-categories-grid zf-prestations-grid">
        {prestations.map((item, i) => (
          <div
            key={item.name}
            className={`zf-cat-card zf-icon-card reveal reveal-up reveal-delay-${Math.min(i + 1, 6)}${prestaVisible ? ' is-visible' : ''}`}
          >
            <div className="zf-cat-img-circle-wrap">
              <img src={item.img} alt={item.alt} className="zf-cat-img-circle" />
            </div>
            <div className="zf-cat-body">
              <h3 className="zf-cat-name">{item.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <div
        ref={servicesHeaderRef}
        className={`zf-section-header reveal reveal-up${servicesHeaderVisible ? ' is-visible' : ''}`}
        style={{ marginTop: '60px' }}
      >
        <h2 className="zf-section-title">SERVICES</h2>
      </div>

      <div ref={servicesGridRef} className="zf-categories-grid zf-services-grid">
        {services.map((item, i) => (
          <div
            key={item.name}
            className={`zf-cat-card zf-icon-card reveal reveal-up reveal-delay-${Math.min(i + 1, 6)}${servicesVisible ? ' is-visible' : ''}`}
          >
            <div className="zf-cat-img-circle-wrap">
              <img src={item.img} alt={item.alt} className="zf-cat-img-circle" />
            </div>
            <div className="zf-cat-body">
              <h3 className="zf-cat-name">{item.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
