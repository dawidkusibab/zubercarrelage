import React, { useState } from 'react';
import type { HeadFC } from 'gatsby';
import Preloader from '../components/Preloader';
import SideMenu from '../components/SideMenu';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Company from '../components/Company';
import Services from '../components/Services';
import InstagramCarousel from '../components/InstagramCarousel';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';

const IndexPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Preloader />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Navbar onHamburgerClick={() => setMenuOpen(true)} />
      <main>
        <Hero />               {/* #home */}
        <Company />            {/* #company */}
        <Services />           {/* #services */}
        <InstagramCarousel />  {/* #portfolio */}
        <Contact />            {/* #contact */}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => (
  <>
    <html lang="fr" />
    <title>Zuber &amp; Fils Carrelage | Sierre</title>
    <meta
      name="description"
      content="Zuber & Fils Carrelage — Maîtrises fédérales, expert en cas de litige, formateur en entreprises et expert au CFC. Sierre, Valais."
    />
    <meta name="author" content="Zuber & Fils Carrelage" />
    <meta property="og:title" content="Zuber & Fils Carrelage | Sierre" />
    <meta
      property="og:description"
      content="Entreprise familiale de carrelage fondée en 1988 à Sierre, Valais. Rénovation, pose de carrelage, mosaïque, terrasse, piscine."
    />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/og-image.jpg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
      rel="stylesheet"
    />
  </>
);
