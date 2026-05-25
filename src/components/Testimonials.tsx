import React from 'react';
import client1Img from '../images/client-1.jpg';
import client2Img from '../images/client-2.png';

const Testimonials: React.FC = () => {
  return (
    <section className="zf-testimonials" id="testimonials">
      <div className="zf-testi-header">
        <span className="zf-section-tag">Témoignages Clients</span>
        <h2 className="zf-section-title">Ce que Disent Nos Clients</h2>
      </div>

      <div className="zf-testi-grid">
        {/* Testimonial 1 */}
        <div className="zf-testi-card">
          <div className="zf-testi-header-row">
            <img src={client1Img} alt="Marie-Claire D." className="zf-testi-avatar" />
            <div className="zf-testi-meta">
              <h5>Marie-Claire D.</h5>
              <span>Sierre</span>
            </div>
          </div>
          <div className="zf-stars">★★★★★</div>
          <p className="zf-testi-text">
            &ldquo;Travail impeccable et équipe très professionnelle. David a su nous conseiller sur le
            choix des matériaux et le résultat est exactement ce que nous espérions. Je recommande
            sans hésiter&nbsp;!&rdquo;
          </p>
          <div className="zf-testi-author">Marie-Claire D. — Sierre</div>
        </div>

        {/* Testimonial 2 */}
        <div className="zf-testi-card">
          <div className="zf-testi-header-row">
            <img src={client2Img} alt="Jean-Marc F." className="zf-testi-avatar" />
            <div className="zf-testi-meta">
              <h5>Jean-Marc F.</h5>
              <span>Sion</span>
            </div>
          </div>
          <div className="zf-stars">★★★★★</div>
          <p className="zf-testi-text">
            &ldquo;Zuber &amp; Fils a rénové notre salle de bain et notre cuisine. Travail soigné,
            délais respectés et chantier rendu propre. Une entreprise familiale de confiance que nous
            n&apos;hésiterons pas à faire appel à nouveau.&rdquo;
          </p>
          <div className="zf-testi-author">Jean-Marc F. — Sion</div>
        </div>

        {/* Testimonial 3 */}
        <div className="zf-testi-card">
          <div className="zf-testi-header-row">
            <div className="zf-testi-avatar-placeholder">S</div>
            <div className="zf-testi-meta">
              <h5>Sophie &amp; Luc R.</h5>
              <span>Crans-Montana</span>
            </div>
          </div>
          <div className="zf-stars">★★★★★</div>
          <p className="zf-testi-text">
            &ldquo;Nous avons fait appel à Zuber &amp; Fils pour notre terrasse et notre piscine.
            La pose est irréprochable et l&apos;équipe a été d&apos;un professionnalisme exemplaire
            du début à la fin des travaux.&rdquo;
          </p>
          <div className="zf-testi-author">Sophie &amp; Luc R. — Crans-Montana</div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
