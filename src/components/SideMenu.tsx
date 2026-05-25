import React, { useEffect } from 'react';
import { NAV_LINKS } from '../data/navLinks';
import { smoothScrollTo } from '../utils/smoothScroll';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    smoothScrollTo(href);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="side-menu-overlay"
          onClick={onClose}
          role="presentation"
        />
      )}
      <div
        className={`side-menu${isOpen ? ' side-menu-active' : ''}`}
        id="sideMenu"
        aria-hidden={!isOpen}
      >
        <div className="inner-wrapper">
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Fermer le menu"
          />
          <nav className="zf-side-nav">
            <ul className="zf-side-nav-list">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href} className="zf-side-nav-item">
                  <a
                    className="zf-side-nav-link"
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
