import React, { useState, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { useScrollReveal } from '../hooks/useScrollReveal';
import useStrapiContact from '../hooks/useStrapiContact';

const SERVICE_ID  = 'service_tog9uv1';
const TEMPLATE_ID = 'template_pjts9mr';
const PUBLIC_KEY  = 'user_c2Pm1FXs32XHkdboahfVI';

interface FormState {
  from_name:  string;
  from_phone: string;
  from_email: string;
  message:    string;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

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

const toTelHref = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0041')) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith('41') && digits.length >= 11) return `tel:+${digits}`;
  if (digits.startsWith('0')) return `tel:+41${digits.slice(1)}`;
  return `tel:+41${digits}`;
};

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    from_name:  '',
    from_phone: '',
    from_email: '',
    message:    '',
  });
  const [status, setStatus] = useState<Status>('idle');

  const { ref, isVisible } = useScrollReveal(0.15);
  const { data, error } = useStrapiContact();

  if (process.env.NODE_ENV === 'development' && error) {
    console.error('[Contact] Strapi fetch failed:', error);
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name:  form.from_name,
          from_email: form.from_email,
          from_phone: form.from_phone,
          message:    form.message,
          to_name:    'Zuber & Fils Carrelage',
        },
        PUBLIC_KEY
      );

      setStatus('success');
      setForm({ from_name: '', from_phone: '', from_email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }, [form]);

  return (
    <section className="zf-contact" id="contact">
      <div ref={ref} className="zf-contact-inner">
        {/* Left info column */}
        <div className={`zf-contact-info reveal reveal-left${isVisible ? ' is-visible' : ''}`}>
          <span className="zf-section-tag">Travaillons Ensemble</span>
          <h2>Contactez-nous</h2>

          <div className="zf-contact-details">
            <div className={`zf-contact-item reveal reveal-up reveal-delay-1${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon"><MapPinIcon /></div>
              <div className="zf-contact-item-text">
                <span>Adresse</span>
                <p>{data?.address ?? "Rue de l'Ile Falcon 29, 3960 Sierre"}</p>
              </div>
            </div>

            <div className={`zf-contact-item reveal reveal-up reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon"><PhoneIcon /></div>
              <div className="zf-contact-item-text">
                <span>Téléphone</span>
                <p><a href={data?.phone ? toTelHref(data.phone) : 'tel:+41787729150'}>{data?.phone ?? '078 772 91 50'}</a></p>
              </div>
            </div>

            <div className={`zf-contact-item reveal reveal-up reveal-delay-3${isVisible ? ' is-visible' : ''}`}>
              <div className="zf-contact-item-icon"><MailIcon /></div>
              <div className="zf-contact-item-text">
                <span>Email</span>
                <p><a href={data?.email ? `mailto:${data.email}` : 'mailto:info@zubercarrelage.ch'}>{data?.email ?? 'info@zubercarrelage.ch'}</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right form column */}
        <div className={`zf-contact-form reveal reveal-right reveal-delay-2${isVisible ? ' is-visible' : ''}`}>
          <h3>Demandez un Devis Gratuit</h3>

          {status === 'success' && (
            <div className="zf-form-success">
              ✓ Merci ! Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.
            </div>
          )}

          {status === 'error' && (
            <div className="zf-form-error">
              Une erreur s&apos;est produite. Veuillez réessayer ou nous contacter par email.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="zf-form-group">
              <input
                type="text"
                name="from_name"
                placeholder="Votre nom"
                value={form.from_name}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
              />
            </div>
            <div className="zf-form-group">
              <input
                type="tel"
                name="from_phone"
                placeholder="Numéro de téléphone"
                value={form.from_phone}
                onChange={handleChange}
                disabled={status === 'sending'}
              />
            </div>
            <div className="zf-form-group">
              <input
                type="email"
                name="from_email"
                placeholder="Adresse email"
                value={form.from_email}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
              />
            </div>
            <div className="zf-form-group">
              <textarea
                name="message"
                placeholder="Décrivez votre projet (type de carrelage, surface, délai souhaité...)"
                value={form.message}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
