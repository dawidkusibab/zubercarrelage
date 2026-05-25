import React, { useState, useEffect } from 'react';
import logoImg from '../images/Fichier_1.avif';
import { NAV_LINKS } from '../data/navLinks';
import { smoothScrollTo } from '../utils/smoothScroll';

interface NavbarProps {
  onHamburgerClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHamburgerClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.scrollY + 100;
      sections.forEach((section) => {
        const el = section as HTMLElement;
        const sTop = el.offsetTop;
        const sHeight = el.offsetHeight;
        const sId = el.getAttribute('id') ?? '';
        if (scrollY >= sTop && scrollY < sTop + sHeight) {
          setActiveSection(sId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    smoothScrollTo(href);
  };

  return (
    <nav className={`zf-navbar navbar-enter${scrolled ? ' scrolled' : ''}`} id="mainNav">
      <div className="container-fluid">
        <a href="#home" className="zf-logo" onClick={(e) => handleNavClick(e, '#home')}>
          <img src={logoImg} alt="Zuber & Fils Carrelage" />
        </a>

        <div className="zf-nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={activeSection === href.slice(1) ? 'active' : ''}
              onClick={(e) => handleNavClick(e, href)}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="zf-nav-cta">
          <a href="#contact" className="btn-consultation" onClick={(e) => handleNavClick(e, '#contact')}>
            Devis Gratuit
          </a>
          <a href="tel:+41787729150" className="zf-phone">078 772 91 50</a>
          <button
            className="zf-hamburger"
            id="hamburgerBtn"
            onClick={onHamburgerClick}
            aria-label="Ouvrir le menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
