import React from 'react';
import aboutImg from '../images/0d170b_daa4936210b84230aa6ae8669f2b0b4e~mv2.avif';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';

const Company: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.15);
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal(0.2);

  return (
    <section id="company" className="zf-company">
      <div ref={ref} className="zf-company-container">
        {/* Left: Image */}
        <div className={`zf-company-img-wrap reveal reveal-left${isVisible ? ' is-visible' : ''}`}>
          <img
            src={aboutImg}
            alt="Zuber & Fils Carrelage — experts en pose de carrelage"
            className="zf-company-img"
          />
        </div>

        {/* Right: Text */}
        <div className={`zf-company-text reveal reveal-right reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
          <span className="zf-section-tag">Notre Histoire</span>
          <h2 className="zf-company-title">
            Une Entreprise Familiale<br />depuis 1988
          </h2>
          <p className="zf-company-desc">
            Zuber &amp; Fils Carrelage est une entreprise familiale fondée en 1988 par Christian et
            Olivier Zuber. Depuis 2017, suite au départ à la retraite de Christian, c&apos;est David
            qui a repris les rênes de la société, toujours secondé par son père Olivier.
          </p>
          <p className="zf-company-desc">
            Principalement actif dans la rénovation, nous nous sommes forgés, depuis plus de 35 ans,
            une solide réputation dans tout le Valais. Titulaires de maîtrises fédérales, experts en
            cas de litige, formateurs en entreprise et experts au CFC.
          </p>
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
        {[
          { number: '35+', label: "Années d'expérience" },
          { number: '500+', label: 'Projets réalisés' },
          { number: '100%', label: 'Satisfaction client' },
        ].map((stat, i) => (
          <div
            key={stat.label}
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
