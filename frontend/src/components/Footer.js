import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--slate-900)', color: 'var(--slate-300)', paddingTop: 64 }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, paddingBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🦷</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', fontWeight: 700 }}>Aurora Dental Care</div>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--slate-400)', marginBottom: 20 }}>
            Healthy Smile, Brighter Tomorrow.<br />World-class dental care with a gentle touch.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['facebook','twitter','instagram','youtube'].map(s => (
              <a key={s} href={`#${s}`} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--slate-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--sky-600)'}
                onMouseLeave={e => e.currentTarget.style.background='var(--slate-800)'}>
                {s === 'facebook' ? '🌐' : s === 'twitter' ? '🐦' : s === 'instagram' ? '📸' : '▶️'}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: 18 }}>Quick Links</h4>
          {[['/', 'Home'], ['/services', 'Services'], ['/booking', 'Book Appointment'], ['/about', 'About Us'], ['/admin/login', 'Admin Panel']].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', color: 'var(--slate-400)', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--slate-400)'}>
              → {label}
            </Link>
          ))}
        </div>

        {/* Services */}
        <div>
          <h4 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: 18 }}>Our Services</h4>
          {['Dental Implants', 'Wisdom Teeth Removal', 'Teeth-in-a-Day', 'Bone Grafting', 'Smile Makeover', 'General Dentistry'].map(s => (
            <Link key={s} to="/services" style={{ display: 'block', color: 'var(--slate-400)', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--slate-400)'}>
              → {s}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: 18 }}>Contact Us</h4>
          {[
            { icon: '📍', text: '123 Smile Avenue, Suite 200\nSan Francisco, CA 94102' },
            { icon: '📞', text: '+1 (415) 555-0123' },
            { icon: '✉️', text: 'hello@auroradental.com' },
            { icon: '🕒', text: 'Mon–Fri: 9AM – 6PM\nSat–Sun: Closed' },
          ].map(({ icon, text }) => (
            <div key={icon} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 16, marginTop: 2, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 14, color: 'var(--slate-400)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--slate-800)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--slate-500)' }}>© {new Date().getFullYear()} Aurora Dental Care. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'var(--slate-500)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--slate-500)'}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
