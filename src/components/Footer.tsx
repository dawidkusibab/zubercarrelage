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

        {/* Services */}
        <div className={`zf-footer-col reveal reveal-up reveal-delay-3${isVisible ? ' is-visible' : ''}`}>
          <h4>Nos Services</h4>
          <ul className="zf-footer-links">
            {[
              'Pose de carrelage',
              'Mosaïque & grand format',
              'Piscine & wellness',
              'Balcon & terrasse',
              'Petite maçonnerie',
              'Réparation & entretien',
            ].map((service) => (
              <li key={service}>
                <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>{service}</a>
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
        <p>&copy; 2020 par Zuber &amp; Fils Carrelage.</p>
        <a href="/privacy" style={{ color: 'inherit', fontSize: '0.75rem', opacity: 0.6 }}>
          Politique de confidentialité
        </a>
        <div className="zf-footer-socials">
          <a href="#" className="zf-social-link" aria-label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>
          <a href="#" className="zf-social-link" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" className="zf-social-link" aria-label="LinkedIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href="#" className="zf-social-link" aria-label="Pinterest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
