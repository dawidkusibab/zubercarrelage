import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface FormState {
  userName: string;
  userPhone: string;
  userEmail: string;
  userMessage: string;
}

const MapPinIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.29h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    userName: '',
    userPhone: '',
    userEmail: '',
    userMessage: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { ref, isVisible } = useScrollReveal(0.15);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { userName, userEmail, userMessage } = form;
    const subject = encodeURIComponent('Demande de devis — Zuber & Fils Carrelage');
    const body = encodeURIComponent(
      `Nom: ${userName}\nEmail: ${userEmail}\nTéléphone: ${form.userPhone}\n\nMessage:\n${userMessage}`
    );
    window.location.href = `mailto:info@zubercarrelage.ch?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section className="zf-contact" id="contact">
      <div ref={ref} className="zf-contact-inner">
        {/* Left info column */}
        <div className={`zf-contact-info reveal reveal-left${isVisible ? ' is-visible' : ''}`}>
          <span className="zf-section-tag">Travaillons Ensemble</span>
          <h2>Contactez-nous</h2>

          <div className="zf-contact-details">
            <div className={`zf-contact-item reveal reveal-up reveal-delay-1${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon">
                <MapPinIcon />
              </div>
              <div className="zf-contact-item-text">
                <span>Adresse</span>
                <p>Rue de l&apos;Ile Falcon 29, 3960 Sierre</p>
              </div>
            </div>

            <div className={`zf-contact-item reveal reveal-up reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon">
                <PhoneIcon />
              </div>
              <div className="zf-contact-item-text">
                <span>Téléphone</span>
                <p>
                  <a href="tel:+41787729150">078 772 91 50</a>
                </p>
              </div>
            </div>

            <div className={`zf-contact-item reveal reveal-up reveal-delay-3${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon">
                <MailIcon />
              </div>
              <div className="zf-contact-item-text">
                <span>Email</span>
                <p>
                  <a href="mailto:info@zubercarrelage.ch">
                    info@zubercarrelage.ch
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps embed */}
          <iframe
            title="Localisation Zuber Carrelage"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2737.5!2d7.5284!3d46.2924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478ee40e1a3ef895%3A0x1234!2sSierre%2C+Valais!5e0!3m2!1sfr!2sch!4v1234567890"
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: '12px', marginTop: '24px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Right form column */}
        <div className={`zf-contact-form reveal reveal-right reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
          <h3>Demandez un Devis Gratuit</h3>
          {submitted && (
            <div className="zf-form-success">
              Merci ! Votre client de messagerie va s&apos;ouvrir pour envoyer votre demande.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="zf-form-group">
              <input
                type="text"
                name="userName"
                placeholder="Votre nom"
                value={form.userName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="zf-form-group">
              <input
                type="tel"
                name="userPhone"
                placeholder="Numéro de téléphone"
                value={form.userPhone}
                onChange={handleChange}
              />
            </div>
            <div className="zf-form-group">
              <input
                type="email"
                name="userEmail"
                placeholder="Adresse email"
                value={form.userEmail}
                onChange={handleChange}
                required
              />
            </div>
            <div className="zf-form-group">
              <textarea
                name="userMessage"
                placeholder="Décrivez votre projet (type de carrelage, surface, délai souhaité...)"
                value={form.userMessage}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn-submit">Envoyer le Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
