import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface BenefitItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const benefits: BenefitItem[] = [
  {
    title: 'Maîtrises Fédérales',
    description: 'Certifications suisses officielles garantissant la qualité et la conformité de chaque pose.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Expert & Formateur',
    description: 'Expert en cas de litige et formateur en entreprises — expert au CFC.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Délais Respectés',
    description: 'Chantiers rendus propres et dans les temps, du début à la réception.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Conseils à la Clientèle',
    description: "Accompagnement personnalisé du choix des matériaux jusqu'à la réalisation finale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: 'Suivi de Chantier',
    description: 'Direction de travaux et suivi rigoureux à chaque étape de votre projet.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Réputation de 30 ans',
    description: 'Entreprise familiale fondée en 1988 — une solide réputation construite dans la durée.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const Benefits: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.2);
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.1);

  return (
    <section className="zf-benefits" id="benefits">
      <div ref={headerRef}>
        <span className={`zf-benefits-subtitle reveal reveal-up${headerVisible ? ' is-visible' : ''}`}>
          Nos Avantages
        </span>
        <h2 className={`zf-benefits-title reveal reveal-up reveal-delay-1${headerVisible ? ' is-visible' : ''}`}>
          Un Service Rapide, Soigné et Professionnel
        </h2>
      </div>

      <div ref={gridRef} className="zf-benefits-grid">
        {benefits.map((benefit, i) => (
          <div
            key={benefit.title}
            className={`zf-benefit-card reveal reveal-up reveal-delay-${Math.min(i + 1, 6)}${gridVisible ? ' is-visible' : ''}`}
          >
            <div className="zf-benefit-icon">{benefit.icon}</div>
            <div className="zf-benefit-text">
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
