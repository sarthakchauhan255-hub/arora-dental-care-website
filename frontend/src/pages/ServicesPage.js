import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Image mapping
const serviceImages = {
  'dental-implants': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&h=400&fit=crop',
  'wisdom-teeth-removal': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop',
  'teeth-in-a-day': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=400&fit=crop',
  'bone-grafting': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
};

// Icons
const serviceIcons = {
  'dental-implants': '🦷',
  'wisdom-teeth-removal': '😬',
  'teeth-in-a-day': '✨',
  'bone-grafting': '🔬',
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/services')
      .then((res) => setServices(res.data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    window.scrollTo(0, 0);
  }, []);

  // fallback data (if backend fails)
  const fallback = [
    {
      id: 1,
      slug: 'dental-implants',
      name: 'Dental Implants',
      description:
        'Permanent tooth replacement with titanium implants for a natural look and function.',
      price_range: '$1,500 – $4,000',
      duration_minutes: 120,
    },
    {
      id: 2,
      slug: 'wisdom-teeth-removal',
      name: 'Wisdom Teeth Removal',
      description:
        'Safe extraction with minimal discomfort using advanced techniques.',
      price_range: '$300 – $800',
      duration_minutes: 90,
    },
    {
      id: 3,
      slug: 'teeth-in-a-day',
      name: 'Teeth-in-a-Day',
      description:
        'Full smile restoration in a single appointment using advanced implants.',
      price_range: '$15,000 – $25,000',
      duration_minutes: 240,
    },
    {
      id: 4,
      slug: 'bone-grafting',
      name: 'Bone Grafting',
      description:
        'Restore jawbone density for implants and long-term oral health.',
      price_range: '$500 – $2,500',
      duration_minutes: 90,
    },
  ];

  const list = services.length > 0 ? services : fallback;

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
          padding: '64px 0 48px',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <div className="section-tag">What We Offer</div>
          <h1
            className="section-title"
            style={{
              fontSize: 'clamp(32px,5vw,52px)',
              marginBottom: 16,
            }}
          >
            Our Specialist Services
          </h1>
        </div>
      </div>

      {/* Services */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              Loading...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              {list.map((svc, i) => {
                console.log(svc.slug, svc.name); // debug

                // normalize slug
                const slug =
                  svc.slug ||
                  svc.name?.toLowerCase().replace(/\s+/g, '-');

                const image =
                  serviceImages[slug] ||
                  'https://via.placeholder.com/600x400?text=Dental+Service';

                return (
                  <div
                    key={svc.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
                      gap: 56,
                      alignItems: 'center',
                      direction: i % 2 === 0 ? 'ltr' : 'rtl',
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        aspectRatio: '3/2',
                      }}
                    >
                      <img
                        src={image}
                        alt={svc.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) =>
                          (e.target.src =
                            'https://via.placeholder.com/600x400?text=Service')
                        }
                      />
                    </div>

                    {/* Content */}
                    <div style={{ direction: 'ltr' }}>
                      <div style={{ fontSize: 40 }}>
                        {serviceIcons[slug] || '🦷'}
                      </div>
                      <h2>{svc.name}</h2>
                      <p>{svc.description}</p>

                      <Link
                        to={`/booking?service=${svc.id}`}
                        className="btn btn-primary"
                      >
                        Book Service →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;