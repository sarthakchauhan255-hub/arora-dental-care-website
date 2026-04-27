import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AboutPage = () => {
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    api.get('/doctors').then(r=>setDoctors(r.data.doctors)).catch(()=>{});
    window.scrollTo(0,0);
  }, []);

  const fallbackDoctors = [
    { id:1, name:'Dr. Sarah Mitchell', specialty:'Implantologist & Oral Surgeon', experience_years:15, bio:'Dr. Mitchell completed her fellowship at Harvard School of Dental Medicine and has placed over 2,000 implants with a 98.5% success rate.', image_url:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop' },
    { id:2, name:'Dr. James Chen', specialty:'Cosmetic & Restorative Dentist', experience_years:12, bio:'Certified by the American Academy of Cosmetic Dentistry, Dr. Chen has transformed over 3,000 smiles and is known for his meticulous artistry.', image_url:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop' },
    { id:3, name:'Dr. Priya Sharma', specialty:'Periodontist & Bone Specialist', experience_years:10, bio:'Dr. Sharma pioneered minimally invasive bone grafting and lectures internationally on advanced implant techniques.', image_url:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop' },
  ];

  const list = doctors.length > 0 ? doctors : fallbackDoctors;

  return (
    <div style={{ paddingTop:72 }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(160deg,#f0f9ff,#bae6fd)', padding:'72px 0 56px', textAlign:'center' }}>
        <div className="container">
          <div className="section-tag">Our Story</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,5vw,52px)', marginBottom:16 }}>About Aurora Dental Care</h1>
          <p style={{ color:'var(--slate-500)', fontSize:18, maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>A legacy of excellence, compassion, and world-class dental care since 2009.</p>
        </div>
      </div>

      {/* Mission */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
         <div
           style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',
              gap:64,
              alignItems:'center'
            }}
          >
            <div>
              <div className="section-tag">Our Mission</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, marginBottom:20 }}>Transforming Lives Through Beautiful Smiles</h2>
              <p style={{ color:'var(--slate-600)', lineHeight:1.9, marginBottom:16 }}>Founded in 2009 by Dr. Sarah Mitchell, Aurora Dental Care began with a simple mission: to provide world-class dental care in a warm, welcoming environment where every patient feels truly cared for.</p>
              <p style={{ color:'var(--slate-600)', lineHeight:1.9, marginBottom:24 }}>Today, our team of board-certified specialists uses cutting-edge 3D imaging, guided implant surgery, and the latest materials to deliver results that go beyond aesthetics — they restore confidence and quality of life.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {['State-of-the-art facility','Board-certified specialists','3D CT imaging','IV sedation available','Lifetime implant warranty','Flexible financing'].map(f=>(
                  <div key={f} style={{ display:'flex', gap:8, alignItems:'center', fontSize:14, color:'var(--slate-700)' }}>
                    <span style={{ color:'var(--sky-500)', fontWeight:700, fontSize:16 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-xl)' }}>
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=560&h=480&fit=crop" alt="Clinic interior" style={{ width:'100%', height:480, objectFit:'cover' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section" style={{ background:'var(--slate-50)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">The Team</div>
            <h2 className="section-title">Meet Our Specialists</h2>
            <p className="section-subtitle">Passionate experts dedicated to your smile and wellbeing.</p>
          </div>
          <div className="grid-3">
            {list.map(doc => (
              <div key={doc.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                <img src={doc.image_url} alt={doc.name} style={{ width:'100%', height:280, objectFit:'cover' }}/>
                <div style={{ padding:'24px 28px 32px' }}>
                  <h3 style={{ fontSize:20, marginBottom:4, fontFamily:'var(--font-display)' }}>{doc.name}</h3>
                  <div style={{ color:'var(--sky-600)', fontWeight:600, fontSize:13, marginBottom:4 }}>{doc.specialty}</div>
                  <div style={{ color:'var(--slate-400)', fontSize:12, marginBottom:16 }}>{doc.experience_years}+ years experience</div>
                  <p style={{ color:'var(--slate-500)', fontSize:14, lineHeight:1.7 }}>{doc.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Find Us</div>
            <h2 className="section-title">Location & Contact</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48 }}>
            {/* Map placeholder */}
            <div style={{ background:'var(--slate-100)', borderRadius:'var(--radius-xl)', height:380, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, border:'2px dashed var(--slate-200)', overflow:'hidden', position:'relative' }}>
              <div style={{ fontSize:56 }}>🗺️</div>
              <div style={{ fontWeight:600, color:'var(--slate-600)' }}>123 Smile Avenue, Suite 200</div>
              <div style={{ color:'var(--slate-400)', fontSize:14 }}>San Francisco, CA 94102</div>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginTop:8 }}>Open in Google Maps</a>
            </div>
            {/* Contact details */}
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:24, marginBottom:24 }}>Get in Touch</h3>
              {[
                { icon:'📍', title:'Address', value:'123 Smile Avenue, Suite 200\nSan Francisco, CA 94102' },
                { icon:'📞', title:'Phone', value:'+1 (415) 555-0123' },
                { icon:'✉️', title:'Email', value:'hello@auroradental.com' },
                { icon:'🕒', title:'Hours', value:'Monday – Friday: 9:00 AM – 6:00 PM\nSaturday & Sunday: Closed' },
              ].map(({ icon, title, value }) => (
                <div key={title} style={{ display:'flex', gap:16, marginBottom:24 }}>
                  <div style={{ width:44, height:44, background:'var(--sky-50)', border:'1px solid var(--sky-100)', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--slate-800)', marginBottom:4 }}>{title}</div>
                    <div style={{ color:'var(--slate-500)', fontSize:14, lineHeight:1.6, whiteSpace:'pre-line' }}>{value}</div>
                  </div>
                </div>
              ))}
              <Link to="/booking" className="btn btn-primary" style={{ marginTop:8 }}>Book an Appointment →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
