import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;

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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding:isMobile ? '0 16px' : '0 24px', height: 72,overflow:'hidden' }}>
        {/* Logo */}
        <Link to="/"
        style={{ display: 'flex', alignItems: 'center', gap: 10,minWidth:0,flex:'1',maxWidth:'70%' }}>
          <div style={{
            width: isMobile ? 42 : 40, height: isMobile ? 42 : 40,flexShrink:0,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: 'var(--shadow-blue)',
          }}>🦷</div>
          <div style={{overflow:'hidden',minWidth:0}}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: isMobile ? 16 : 18, whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis', color: scrolled ? 'var(--slate-900)' : 'var(--slate-900)',
              letterSpacing: '-0.3px',
            }}>Aurora Dental</div>
            <div style={{ fontSize: 10, color: 'var(--slate-400)', letterSpacing: '0.5px', fontWeight: 500 }}>CARE</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 15,
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--slate-600)',
                background: isActive ? 'var(--sky-50)' : 'transparent',
                transition: 'all 0.2s',
              })}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA + Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          <Link to="/admin/login" className="btn btn-ghost btn-sm" style={{ color: 'var(--slate-500)' }}>
            Admin Panel
          </Link>
          <Link to="/booking" className="btn btn-primary btn-sm">
            Book Now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', padding: 10, marginLeft:'auto',marginTop:0,position:'static',flexShrink:0, color: 'var(--slate-700)' }}
          className="hamburger"
          aria-label="Menu">
          <div style={{ width: 24, height: 2, background: 'currentColor', marginBottom: 5, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 24, height: 2, background: 'currentColor', marginBottom: 5, opacity: menuOpen ? 0 : 1 }} />
          <div style={{ width: 24, height: 2, background: 'currentColor', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'all 0.3s' }} />
        </button>
      </div>

      {/* Mobile menu */}
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
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
