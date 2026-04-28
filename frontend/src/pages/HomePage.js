import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

/* ── Reveal hook (inline) ─────────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* ── Star helper ──────────────────────────────────────────────── */
const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={i <= rating ? 'star' : 'star star-empty'}>★</span>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [reviews, setReviews] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [reviewForm, setReviewForm] = useState({ patient_name:'', rating:5, comment:'' });
  const [reviewMsg, setReviewMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const heroRef     = useRef(null);
  const aboutRef    = useReveal();
  const servicesRef = useReveal();
  const doctorsRef  = useReveal();
  const statsRef    = useReveal();
  const reviewsRef  = useReveal();
  const formRef     = useReveal();

  useEffect(() => {
    api.get('/reviews').then(r => setReviews(r.data.reviews)).catch(() => {});
    api.get('/doctors').then(r => setDoctors(r.data.doctors)).catch(() => {});
    api.get('/services').then(r => setServices(r.data.services)).catch(() => {});

    // Hero entrance
    setTimeout(() => { if (heroRef.current) heroRef.current.style.opacity = 1; }, 100);
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewMsg(null);
    try {
      const res = await api.post('/reviews', reviewForm);
      setReviewMsg({ type: 'success', text: res.data.message });
      setReviewForm({ patient_name:'', rating:5, comment:'' });
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
    } finally { setSubmitting(false); }
  };

  const serviceIcons = { 'dental-implants':'🦷','wisdom-teeth-removal':'😬','teeth-in-a-day':'✨','bone-grafting':'🔬' };

  return (
    <div>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 100%)',
        overflow: 'hidden',
      }}>
        {/* Background circles */}
        {[
          { w:600, h:600, top:'-200px', right:'-200px', opacity:0.15 },
          { w:400, h:400, bottom:'-100px', left:'-150px', opacity:0.10 },
          { w:250, h:250, top:'30%', right:'15%', opacity:0.08 },
        ].map((c, i) => (
          <div key={i} style={{
            position:'absolute', width:c.w, height:c.h, top:c.top, bottom:c.bottom,
            left:c.left, right:c.right, borderRadius:'50%',
            background:'linear-gradient(135deg,#0ea5e9,#0284c7)', opacity:c.opacity,
            pointerEvents:'none',
          }}/>
        ))}

        <div ref={heroRef} className="container" style={{ opacity:0, transition:'opacity 0.8s ease, transform 0.8s ease', transform:'translateY(0)', paddingTop: isMobile ? 150 : 100, paddingBottom:60 }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:isMobile ? 34 : 64, alignItems:'center' }}>
            {/* Text */}
            <div>
              <div className="section-tag" style={{marginTop:isMobile ? 90 : 0, marginBottom:20,display:'inline-flex' }}>🏆 Solan's #1 Implant Clinic</div>
              <h1 style={{
               fontSize:isMobile ? '54px' : 'clamp(36px,5vw,60px)',
               lineHeight:isMobile ? '.95' : '1.1',
               marginTop:isMobile ? 10 : 0,
               marginBottom:20,
               maxWidth:isMobile ? 300 : 'none',
               color:'var(--slate-900)'
               }}>
               Your Perfect<br/>
               Smile<br/>
               <span style={{color:'var(--sky-600)'}}>
               Starts Here
               </span>
              </h1>
              <p style={{ fontSize:18, color:'var(--slate-600)', lineHeight:1.8, marginBottom:36, maxWidth:480 }}>
                Healthy Smile, Brighter Tomorrow. World-class dental implants, cosmetic dentistry, and complete smile restoration — all under one roof.
              </p>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                <Link to="/booking" className="btn btn-primary btn-lg">
                  📅 Book Appointment
                </Link>
                <a href="tel:+14155550123" className="btn btn-white btn-lg">
                  📞 Call Now
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display:'flex', gap:24, marginTop:40, flexWrap:'wrap' }}>
                {[['15+','Years Experience'],['3,000+','Smiles Restored'],['4.9★','Google Rating']].map(([num, label]) => (
                  <div key={label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:22, fontWeight:700, color:'var(--sky-700)', fontFamily:'var(--font-display)' }}>{num}</div>
                    <div style={{ fontSize:12, color:'var(--slate-500)', fontWeight:500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image card */}
            <div style={{ position:'relative' }}>
              <div style={{
                borderRadius:'var(--radius-xl)', overflow:'hidden',
                boxShadow:'0 32px 80px rgba(2,132,199,0.20)',
                aspectRatio:'4/5', maxHeight:560,
              }}>
                <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=700&fit=crop" alt="Dental clinic" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              {/* Floating card */}
              <div style={{
                position:'absolute', bottom:24, left:12,
                background:'white', borderRadius:'var(--radius-lg)',
                padding:'16px 20px', boxShadow:'var(--shadow-xl)',
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{ width:48, height:48, background:'var(--sky-100)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🦷</div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--slate-900)', fontSize:15 }}>Teeth-in-a-Day</div>
                  <div style={{ fontSize:12, color:'var(--slate-500)' }}>Full arch in 1 visit</div>
                </div>
              </div>
              <div style={{
                position:'absolute', top:24, right:0,
                background:'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius:'var(--radius-lg)',
                padding:'12px 16px', boxShadow:'var(--shadow-blue)', color:'white',
              }}>
                <div style={{ fontSize:22, fontWeight:700 }}>98%</div>
                <div style={{ fontSize:11, opacity:0.9 }}>Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:768px){ .hero-grid{grid-template-columns:1fr!important;} .hero-img-col{display:none;} }`}</style>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────── */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
          <div ref={aboutRef} className="reveal" style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:isMobile ? 34 : 64, alignItems:'center' }}>
            <div style={{ position:'relative' }}>
              <div style={{ borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-xl)' }}>
                <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=560&h=480&fit=crop" alt="Our clinic" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ position:'absolute', top:24, right:0, background:'var(--sky-600)', color:'white', borderRadius:'var(--radius-lg)', padding:'20px', boxShadow:'var(--shadow-blue)', textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, fontFamily:'var(--font-display)' }}>15+</div>
                <div style={{ fontSize:12, opacity:0.9 }}>Years of<br/>Excellence</div>
              </div>
            </div>
            <div>
              <div className="section-tag">About Aurora Dental</div>
              <h2 className="section-title" style={{ textAlign:'left', marginBottom:16 }}>A Clinic Built on Trust & Excellence</h2>
              <p style={{ color:'var(--slate-600)', lineHeight:1.8, marginBottom:16 }}>
                Founded in 2009, Aurora Dental Care has grown into San Francisco's premier destination for advanced dental implants and cosmetic dentistry. Our state-of-the-art facility combines cutting-edge technology with genuine, compassionate care.
              </p>
              <p style={{ color:'var(--slate-600)', lineHeight:1.8, marginBottom:28 }}>
                We believe everyone deserves a smile that transforms their life. Our board-certified specialists use the latest 3D imaging, guided implant surgery, and minimally invasive techniques to deliver exceptional, lasting results.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
                {['3D CT Imaging','Same-Day Consultations','IV Sedation Available','Lifetime Implant Warranty'].map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'var(--slate-700)' }}>
                    <span style={{ color:'var(--sky-500)', fontWeight:700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary">Learn Our Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <section className="section" style={{ background:'var(--slate-50)' }}>
        <div className="container">
          <div ref={servicesRef} className="reveal section-header">
            <div className="section-tag">What We Offer</div>
            <h2 className="section-title">Specialist Services</h2>
            <p className="section-subtitle">From single tooth replacement to full-arch restoration, we offer everything you need for your perfect smile.</p>
          </div>
          <div className="grid-2" style={{ gap:28 }}>
            {(services.length > 0 ? services : [
              { id:1, slug:'dental-implants', name:'Dental Implants', short_description:'Permanent tooth replacement with titanium implants for a natural look and feel.', price_range:'$1,500–$4,000' },
              { id:2, slug:'wisdom-teeth-removal', name:'Wisdom Teeth Removal', short_description:'Comfortable extraction with minimal recovery time using advanced techniques.', price_range:'$300–$800' },
              { id:3, slug:'teeth-in-a-day', name:'Teeth-in-a-Day', short_description:'Complete smile restoration in one single appointment.', price_range:'$15,000–$25,000' },
              { id:4, slug:'bone-grafting', name:'Bone Grafting', short_description:'Jawbone rebuilding to prepare for implants or preserve structure.', price_range:'$500–$2,500' },
            ]).map((svc, i) => (
              <div key={svc.id} className="card reveal" ref={useReveal()} style={{ display:'flex', flexDirection:'column', padding:0 }}>
                <div style={{ height:180, background:`linear-gradient(135deg, var(--sky-${400+i*100>700?600:400+i*100}), var(--sky-700))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56 }}>
                  {serviceIcons[svc.slug] || '🦷'}
                </div>
                <div style={{ padding:'24px 28px 28px', flex:1, display:'flex', flexDirection:'column' }}>
                  <h3 style={{ fontSize:20, marginBottom:10, fontFamily:'var(--font-display)' }}>{svc.name}</h3>
                  <p style={{ color:'var(--slate-500)', fontSize:14, lineHeight:1.7, flex:1, marginBottom:20 }}>{svc.short_description}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, color:'var(--sky-600)', fontWeight:600 }}>{svc.price_range}</span>
                    <Link to="/booking" className="btn btn-primary btn-sm">Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:40 }}>
            <Link to="/services" className="btn btn-outline btn-lg">View All Services →</Link>
          </div>
        </div>
      </section>

      {/* ── DOCTORS ───────────────────────────────────────────── */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
          <div ref={doctorsRef} className="reveal section-header">
            <div className="section-tag">Our Specialists</div>
            <h2 className="section-title">Meet Our Doctors</h2>
            <p className="section-subtitle">Board-certified specialists with decades of combined experience transforming smiles.</p>
          </div>
          <div className="grid-3">
            {(doctors.length > 0 ? doctors : [
              { id:1, name:'Dr. Sarah Mitchell', specialty:'Implantologist & Oral Surgeon', experience_years:15, image_url:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop' },
              { id:2, name:'Dr. James Chen', specialty:'Cosmetic & Restorative Dentist', experience_years:12, image_url:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop' },
              { id:3, name:'Dr. Priya Sharma', specialty:'Periodontist & Bone Specialist', experience_years:10, image_url:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop' },
            ]).map(doc => (
              <div key={doc.id} className="card" style={{ textAlign:'center', padding:0 }}>
                <div style={{ position:'relative', overflow:'hidden' }}>
                  <img src={doc.image_url} alt={doc.name} style={{ width:'100%', height:260, objectFit:'cover', transition:'transform 0.4s' }}
                    onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                  <div style={{ position:'absolute', bottom:12, right:12, background:'var(--sky-600)', color:'white', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600 }}>
                    {doc.experience_years}+ yrs
                  </div>
                </div>
                <div style={{ padding:'20px 24px 28px' }}>
                  <h3 style={{ fontSize:18, marginBottom:4 }}>{doc.name}</h3>
                  <p style={{ color:'var(--sky-600)', fontSize:13, fontWeight:600, marginBottom:12 }}>{doc.specialty}</p>
                  <Link to="/booking" className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center' }}>Book Consultation</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE/AFTER ──────────────────────────────────────── */}
      <section className="section" style={{ background:'var(--slate-50)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Real Results</div>
            <h2 className="section-title">Before & After Gallery</h2>
            <p className="section-subtitle">See the life-changing transformations our patients experience.</p>
          </div>
          <div className="grid-3">
            {[
              { before:'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80', after:'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80', label:'Full Arch Implants' },
              { before:'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80', after:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80', label:'Smile Makeover' },
              { before:'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80', after:'https://images.unsplash.com/photo-1588776814546-ec7e6d6f7f1f?auto=format&fit=crop&w=900&q=80', label:'Teeth Whitening' },
            ].map(({ before, after, label }, i) => (
              <div key={i} className="card" style={{ overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                  <div style={{ position:'relative' }}>
                    <img
                      src={before}
                      alt="Before"
                      style={{ width:'100%', height:160, objectFit:'cover' }}
                      onError={(e)=>{
                       e.target.src="https://via.placeholder.com/600x400?text=Before+Treatment";
                      }}
                    />
                    <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.6)', color:'white', borderRadius:4, padding:'3px 8px', fontSize:11, fontWeight:600 }}>BEFORE</div>
                  </div>
                  <div style={{ position:'relative' }}>
                    <img
                     src={after}
                     alt="After"
                     style={{ width:'100%', height:160, objectFit:'cover' }}
                     onError={(e)=>{
                       e.target.src="https://via.placeholder.com/600x400?text=After+Treatment";
                      }}
                    />
                    <div style={{ position:'absolute', top:8, right:8, background:'var(--sky-600)', color:'white', borderRadius:4, padding:'3px 8px', fontSize:11, fontWeight:600 }}>AFTER</div>
                  </div>
                </div>
                <div style={{ padding:'16px 20px', textAlign:'center', fontWeight:600, fontSize:14, color:'var(--slate-700)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0284c7,#0369a1)', padding:'72px 0' }}>
        <div className="container">
          <div ref={statsRef} className="reveal grid-4" style={{ textAlign:'center' }}>
            {[
              { n:'15+', label:'Years of Excellence', icon:'🏆' },
              { n:'3,000+', label:'Implants Placed', icon:'🦷' },
              { n:'12,000+', label:'Happy Patients', icon:'😊' },
              { n:'98%', label:'Success Rate', icon:'⭐' },
            ].map(({ n, label, icon }) => (
              <div key={label} style={{ color:'white' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:'clamp(32px,4vw,48px)', fontWeight:700, fontFamily:'var(--font-display)', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:14, opacity:0.85, marginTop:8 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────────────── */}
      <section className="section" style={{ background:'white' }}>
        <div className="container">
          <div ref={reviewsRef} className="reveal section-header">
            <div className="section-tag">Patient Stories</div>
            <h2 className="section-title">What Our Patients Say</h2>
          </div>
          <div className="grid-2" style={{ marginBottom:64 }}>
            {(reviews.length > 0 ? reviews : [
              { id:1, patient_name:'Margaret Thompson', rating:5, comment:'Dr. Mitchell performed my full-arch implants and I cannot believe the transformation. I went from hiding my smile for 10 years to smiling in every photo.' },
              { id:2, patient_name:'Robert Kim', rating:5, comment:'Had my wisdom teeth removed here and was terrified. The team made me feel so comfortable and the procedure was painless. Highly recommend!' },
              { id:3, patient_name:'Linda Vasquez', rating:5, comment:'The Teeth-in-a-Day procedure changed my life. I walked in with dentures and left with a permanent, beautiful smile in one day. Worth every penny.' },
              { id:4, patient_name:'David Okafor', rating:4, comment:'Professional, clean, and caring staff. My bone graft procedure went smoothly. Dr. Sharma explained everything thoroughly. Excellent experience.' },
            ]).slice(0,4).map(rev => (
              <div key={rev.id} className="card" style={{ padding:'28px 32px' }}>
                <Stars rating={rev.rating}/>
                <p style={{ color:'var(--slate-600)', lineHeight:1.8, margin:'16px 0 20px', fontSize:15, fontStyle:'italic' }}>"{rev.comment}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16 }}>
                    {rev.patient_name[0]}
                  </div>
                  <div style={{ fontWeight:600, color:'var(--slate-800)' }}>{rev.patient_name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <div ref={formRef} className="reveal" style={{ background:'var(--sky-50)', border:'1px solid var(--sky-100)', borderRadius:'var(--radius-xl)', padding:'48px', maxWidth:640, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:8 }}>Share Your Experience</h3>
              <p style={{ color:'var(--slate-500)' }}>Your feedback helps us serve you better.</p>
            </div>
            {reviewMsg && (
              <div style={{ background: reviewMsg.type==='success'?'#d1fae5':'#fee2e2', color: reviewMsg.type==='success'?'#065f46':'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>
                {reviewMsg.text}
              </div>
            )}
            <form onSubmit={handleReviewSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" value={reviewForm.patient_name} onChange={e=>setReviewForm(p=>({...p,patient_name:e.target.value}))} placeholder="Jane Smith" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <select className="form-input" value={reviewForm.rating} onChange={e=>setReviewForm(p=>({...p,rating:parseInt(e.target.value)}))}>
                    {[5,4,3,2,1].map(n=><option key={n} value={n}>{'★'.repeat(n)} — {['','Poor','Fair','Good','Great','Excellent'][n]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom:20 }}>
                <label className="form-label">Your Review *</label>
                <textarea className="form-input" value={reviewForm.comment} onChange={e=>setReviewForm(p=>({...p,comment:e.target.value}))} placeholder="Tell us about your experience..." rows={4} required/>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={submitting}>
                {submitting ? <><span className="spinner"/>Submitting…</> : '✉️ Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg,#0c4a6e,#0284c7)', padding:'80px 0', textAlign:'center' }}>
        <div className="container">
          <h2 style={{ color:'white', fontSize:'clamp(28px,4vw,44px)', marginBottom:16, fontFamily:'var(--font-display)' }}>Ready to Transform Your Smile?</h2>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:18, marginBottom:36 }}>Book your free consultation today and take the first step toward your dream smile.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/booking" className="btn btn-white btn-lg">📅 Book Free Consultation</Link>
            <a href="tel:+14155550123" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 36px', borderRadius:'var(--radius-full)', border:'2px solid rgba(255,255,255,0.4)', color:'white', fontSize:17, fontWeight:600, transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,255,255,0.4)';}}>
              📞 +1 (415) 555-0123
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
