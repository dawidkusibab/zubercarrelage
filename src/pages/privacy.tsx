import React, { useState } from 'react';
import type { HeadFC } from 'gatsby';
import SideMenu from '../components/SideMenu';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .privacy-page {
          background: #faf9f7;
          min-height: 100vh;
          padding: 120px 24px 80px;
        }
        .privacy-container {
          max-width: 760px;
          margin: 0 auto;
        }
        .privacy-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8a7560;
          text-decoration: none;
          margin-bottom: 48px;
          transition: color 0.2s ease;
        }
        .privacy-back:hover {
          color: #5c4a32;
        }
        .privacy-back svg {
          transition: transform 0.2s ease;
        }
        .privacy-back:hover svg {
          transform: translateX(-3px);
        }
        .privacy-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          color: #2a2218;
          margin: 0 0 12px;
          line-height: 1.15;
        }
        .privacy-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #a0917e;
          letter-spacing: 0.04em;
          margin: 0 0 56px;
        }
        .privacy-divider {
          width: 48px;
          height: 2px;
          background: #c9a96e;
          border: none;
          margin: 0 0 48px;
        }
        .privacy-section {
          margin-bottom: 48px;
        }
        .privacy-section h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #2a2218;
          margin: 0 0 16px;
        }
        .privacy-section p,
        .privacy-section ul {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          line-height: 1.8;
          color: #5a4e42;
          margin: 0 0 12px;
        }
        .privacy-section ul {
          padding-left: 20px;
        }
        .privacy-section ul li {
          margin-bottom: 6px;
        }
        .privacy-section a {
          color: #8a7560;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .privacy-section a:hover {
          color: #5c4a32;
        }
        .privacy-note {
          background: #f0ebe3;
          border-left: 3px solid #c9a96e;
          border-radius: 0 4px 4px 0;
          padding: 16px 20px;
          margin-top: 16px;
        }
        .privacy-note p {
          margin: 0;
          font-size: 0.875rem;
        }
      `}</style>

      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Navbar onHamburgerClick={() => setMenuOpen(true)} />

      <main className="privacy-page">
        <div className="privacy-container">

          <a href="/" className="privacy-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour à l'accueil
          </a>

          <h1 className="privacy-title">Politique de confidentialité</h1>
          <p className="privacy-subtitle">Dernière mise à jour&nbsp;: mai 2025</p>
          <hr className="privacy-divider" />

          <section className="privacy-section">
            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est&nbsp;:
            </p>
            <p>
              <strong>Zuber &amp; Fils Carrelage</strong><br />
              Rue de l'Ile Falcon 29<br />
              3960 Sierre, Suisse<br />
              <a href="mailto:info@zubercarrelage.ch">info@zubercarrelage.ch</a><br />
              <a href="tel:+41787729150">078 772 91 50</a>
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Données collectées</h2>
            <p>
              Nous collectons uniquement les données que vous nous transmettez volontairement via le formulaire de contact&nbsp;:
            </p>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone (facultatif)</li>
              <li>Contenu de votre message</li>
            </ul>
            <p>
              Nous ne collectons pas de données de navigation, ne déposons pas de cookies et n'utilisons aucun outil d'analyse statistique (Google Analytics ou similaire).
            </p>
          </section>

          <section className="privacy-section">
            <h2>3. Finalité du traitement</h2>
            <p>
              Les données transmises via le formulaire de contact sont utilisées exclusivement pour répondre à votre demande de renseignements ou de devis. Elles ne sont pas utilisées à des fins commerciales, ni partagées à des tiers, sauf dans les cas décrits à l'article 5.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Intégration Instagram</h2>
            <p>
              Notre site affiche une sélection de nos propres publications Instagram dans la section «&nbsp;Réalisations&nbsp;». Cette intégration est réalisée via un service tiers qui récupère les images de notre compte professionnel.
            </p>
            <div className="privacy-note">
              <p>
                Aucune donnée vous concernant n'est transmise à Instagram lors de votre visite sur notre site. Vous n'avez pas besoin d'un compte Instagram pour consulter ces images.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>5. Tiers et sous-traitants</h2>
            <p>
              Pour le bon fonctionnement du site, nous faisons appel aux prestataires suivants&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Cloudinary</strong> — service d'hébergement et d'optimisation d'images (CDN).
                Les images du site sont servies via leurs infrastructures. Aucune donnée personnelle de visiteurs ne leur est transmise.
              </li>
              <li>
                <strong>Instagram / Meta</strong> — uniquement pour la récupération de nos propres publications publiques.
                Aucune donnée de navigation ou d'identification de visiteurs n'est partagée.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Cookies et traceurs</h2>
            <p>
              Ce site n'utilise <strong>aucun cookie</strong> de tracking, publicitaire ou analytique. Aucun profil de navigation n'est constitué. Aucun pixel de suivi n'est intégré.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Durée de conservation</h2>
            <p>
              Les données transmises via le formulaire de contact sont conservées uniquement le temps nécessaire au traitement de votre demande, puis supprimées. Aucune base de données d'utilisateurs n'est constituée.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Vos droits</h2>
            <p>
              Conformément à la Loi fédérale suisse sur la protection des données (LPD), vous disposez des droits suivants&nbsp;:
            </p>
            <ul>
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification en cas d'inexactitude</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à l'adresse&nbsp;: <a href="mailto:info@zubercarrelage.ch">info@zubercarrelage.ch</a>
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Droit applicable</h2>
            <p>
              La présente politique de confidentialité est régie par le droit suisse, en particulier la <strong>Loi fédérale sur la protection des données (LPD)</strong> et son ordonnance d'application (OLPD). En cas de litige, les tribunaux compétents sont ceux du canton du Valais, Suisse.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou au traitement de vos données personnelles, veuillez nous contacter&nbsp;:
            </p>
            <p>
              <a href="mailto:info@zubercarrelage.ch">info@zubercarrelage.ch</a><br />
              <a href="tel:+41787729150">078 772 91 50</a>
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default PrivacyPage;

export const Head: HeadFC = () => (
  <>
    <html lang="fr" />
    <title>Politique de confidentialité | Zuber &amp; Fils Carrelage</title>
    <meta
      name="description"
      content="Politique de confidentialité de Zuber & Fils Carrelage — comment nous traitons vos données personnelles, formulaire de contact, Instagram, LPD suisse."
    />
    <meta name="robots" content="noindex, follow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
      rel="stylesheet"
    />
  </>
);
