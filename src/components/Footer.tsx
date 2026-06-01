import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';

const Footer: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.1);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    smoothScrollTo(href);
  };

  return (
    <footer className="zf-footer">
      <div ref={ref} className="zf-footer-inner">
        {/* Brand */}
        <div className={`zf-footer-brand reveal reveal-up reveal-delay-1${isVisible ? ' is-visible' : ''}`}>
          <span className="zf-logo">
            Zuber<span>&amp;Fils</span>
          </span>
          <p className="zf-footer-desc">
            Entreprise familiale fondée en 1988 à Sierre (Valais). Maîtrises fédérales, rénovation,
            nouvelle construction, expertise en litige et formation.
          </p>
          <div className="zf-footer-phone">
            <span>Appelez-nous</span>
            <a href="tel:+41787729150" style={{ color: 'inherit' }}>078 772 91 50</a>
          </div>
        </div>

        {/* Empty column */}
        <div />

        {/* Navigation */}
        <div className={`zf-footer-col reveal reveal-up reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
          <h4>Navigation</h4>
          <ul className="zf-footer-links">
            {[
              { href: '#home',      label: 'Accueil' },
              { href: '#company',   label: 'Histoire' },
              { href: '#services',  label: 'Services' },
              { href: '#portfolio', label: 'Réalisations' },
              { href: '#contact',   label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a href={href} onClick={(e) => handleNavClick(e, href)}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={`zf-footer-col reveal reveal-up reveal-delay-4${isVisible ? ' is-visible' : ''}`}>
          <h4>Contact</h4>
          <ul className="zf-footer-links">
            <li><a href="#">Rue de l&apos;Ile Falcon 29</a></li>
            <li><a href="#">3960 Sierre</a></li>
            <li><a href="tel:+41787729150">078 772 91 50</a></li>
            <li><a href="mailto:info@zubercarrelage.ch">info@zubercarrelage.ch</a></li>
          </ul>
        </div>
      </div>

      <div className="zf-footer-bottom">
        <p>&copy; {new Date().getFullYear()} par Zuber &amp; Fils Carrelage.</p>
        <a href="/privacy" style={{ color: 'inherit', fontSize: '0.75rem', opacity: 0.6 }}>
          Politique de confidentialité
        </a>
        <div className="zf-footer-socials">
          <a href="https://www.instagram.com/zubercarrelage/" target="_blank" rel="noopener noreferrer" className="zf-social-link" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
