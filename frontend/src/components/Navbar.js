import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/booking', label: 'Booking' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--slate-100)' : 'none',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          padding: '0 16px',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: 'var(--shadow-blue)',
          }}>
            🦷
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--slate-900)',
              whiteSpace: 'nowrap',
            }}>
              Aurora Dental
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: 'var(--slate-400)',
              marginTop: '2px',
            }}>
              CARE
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                padding: '8px 16px',
                borderRadius: '999px',
                fontWeight: isActive ? 600 : 400,
                fontSize: 15,
                color: isActive ? 'var(--primary)' : 'var(--slate-600)',
                background: isActive ? 'var(--sky-50)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ display: 'flex', gap: 10, marginLeft: 8 }}>
            <Link to="/admin/login" className="btn btn-outline btn-sm">Admin</Link>
            <Link to="/booking" className="btn btn-primary btn-sm">Book Now</Link>
          </div>
        </div>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
          aria-label="Menu"
          style={{
            display: 'none', // shown via CSS on mobile
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1100,
          }}
        >
          <div style={{ width: 28, height: 2.5, background: '#475569', marginBottom: 5, borderRadius: 3 }} />
          <div style={{ width: 28, height: 2.5, background: '#475569', marginBottom: 5, borderRadius: 3 }} />
          <div style={{ width: 28, height: 2.5, background: '#475569', borderRadius: 3 }} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--slate-100)',
          padding: '16px 24px 24px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 0',
                color: isActive ? 'var(--primary)' : 'var(--slate-700)',
                fontWeight: isActive ? 600 : 400, fontSize: 16,
                borderBottom: '1px solid var(--slate-50)',
                textDecoration: 'none',
              })}>
              {label}
            </NavLink>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link to="/admin/login" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Admin</Link>
            <Link to="/booking" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Book Now</Link>
          </div>
        </div>
      )}

      <style>{`
        /* Desktop: show nav links, hide hamburger */
        .desktop-nav {
          display: flex !important;
        }
        .hamburger {
          display: none !important;
        }

        /* Mobile: hide nav links, show hamburger */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger {
            display: flex !important;
            position: absolute !important;
            right: 16px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            z-index: 1100 !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;