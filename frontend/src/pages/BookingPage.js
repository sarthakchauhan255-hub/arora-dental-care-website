import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient_name:'', patient_email:'', patient_phone:'',
    service_id: searchParams.get('service') || '',
    doctor_id:'', appointment_date:'', appointment_time:'', message:''
  });

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.services)).catch(()=>{});
    api.get('/doctors').then(r => setDoctors(r.data.doctors)).catch(()=>{});
    window.scrollTo(0,0);
  }, []);

  useEffect(() => {
    if (!form.appointment_date) { setSlots([]); return; }
    setLoadingSlots(true);
    const params = { date: form.appointment_date };
    if (form.doctor_id) params.doctor_id = form.doctor_id;
    api.get('/appointments/slots', { params })
      .then(r => setSlots(r.data.slots || []))
      .catch(()=>setSlots([]))
      .finally(()=>setLoadingSlots(false));
  }, [form.appointment_date, form.doctor_id]);

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.appointment_time) { setError('Please select an appointment time.'); return; }
    setSubmitting(true);
    try {
      await api.post('/appointments', form);
      setSuccess(true);
      window.scrollTo(0,0);
    } catch(err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const set = (field) => (e) => setForm(p=>({...p,[field]:e.target.value}));

  if (success) return (
    <div style={{ paddingTop:72, minHeight:'100vh', display:'flex', alignItems:'center', background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)' }}>
      <div className="container" style={{ textAlign:'center', maxWidth:560, margin:'0 auto' }}>
        <div style={{ fontSize:80, marginBottom:24 }}>🎉</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:38, marginBottom:16 }}>Appointment Booked!</h1>
        <p style={{ color:'var(--slate-500)', fontSize:17, marginBottom:12, lineHeight:1.8 }}>Your appointment has been confirmed. A confirmation email has been sent to <strong>{form.patient_email}</strong>.</p>
        <p style={{ color:'var(--slate-400)', fontSize:14, marginBottom:36 }}>📍 123 Smile Avenue, Suite 200, San Francisco, CA 94102<br/>📞 +1 (415) 555-0123</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button className="btn btn-primary" onClick={()=>{setSuccess(false);setForm({patient_name:'',patient_email:'',patient_phone:'',service_id:'',doctor_id:'',appointment_date:'',appointment_time:'',message:''});}}>Book Another</button>
          <a href="/" className="btn btn-outline">Go Home</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:72, background:'var(--slate-50)', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', padding:'56px 0 40px', textAlign:'center' }}>
        <div className="container">
          <div className="section-tag">Easy & Convenient</div>
          <h1 style={{ fontSize:'clamp(28px,4vw,48px)', marginBottom:12, fontFamily:'var(--font-display)' }}>Book Your Appointment</h1>
          <p style={{ color:'var(--slate-500)', fontSize:16 }}>Monday – Friday · 9:00 AM – 6:00 PM</p>
        </div>
      </div>

      <div className="container" style={{ padding:'48px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:40, maxWidth:1000, margin:'0 auto' }}>
          {/* Form */}
          <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:'40px', boxShadow:'var(--shadow-md)' }}>
            {error && (
              <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:24, fontSize:14 }}>
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:24, paddingBottom:16, borderBottom:'1px solid var(--slate-100)' }}>Patient Information</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.patient_name} onChange={set('patient_name')} placeholder="John Smith" required minLength={2}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" type="tel" value={form.patient_phone} onChange={set('patient_phone')} placeholder="+1 (415) 000-0000" required/>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom:24 }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.patient_email} onChange={set('patient_email')} placeholder="john@example.com" required/>
              </div>

              <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:24, paddingBottom:16, borderBottom:'1px solid var(--slate-100)' }}>Appointment Details</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Service</label>
                  <select className="form-input" value={form.service_id} onChange={set('service_id')}>
                    <option value="">— Select Service —</option>
                    {services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor</label>
                  <select className="form-input" value={form.doctor_id} onChange={set('doctor_id')}>
                    <option value="">— Any Doctor —</option>
                    {doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom:24 }}>
                <label className="form-label">Preferred Date *</label>
                <input className="form-input" type="date" value={form.appointment_date} onChange={set('appointment_date')} min={minDate} max={maxDate} required/>
                <span style={{ fontSize:12, color:'var(--slate-400)', marginTop:4 }}>Monday – Friday only</span>
              </div>

              {/* Time slots */}
              {form.appointment_date && (
                <div style={{ marginBottom:24 }}>
                  <label className="form-label" style={{ marginBottom:12 }}>Select Time *</label>
                  {loadingSlots ? (
                    <div style={{ textAlign:'center', padding:24 }}><div className="spinner spinner-blue"/></div>
                  ) : slots.length === 0 ? (
                    <div style={{ padding:16, background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'var(--radius-md)', color:'#c2410c', fontSize:14 }}>
                      No slots available for this date. Please choose another day.
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
                      {slots.map(slot=>(
                        <button key={slot.time} type="button"
                          onClick={()=>slot.available && setForm(p=>({...p,appointment_time:slot.time}))}
                          style={{
                            padding:'10px 8px', borderRadius:'var(--radius-md)', fontSize:13, fontWeight:500, border:'1.5px solid',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            background: !slot.available ? 'var(--slate-50)' : form.appointment_time===slot.time ? 'var(--sky-600)' : 'white',
                            borderColor: !slot.available ? 'var(--slate-200)' : form.appointment_time===slot.time ? 'var(--sky-600)' : 'var(--slate-200)',
                            color: !slot.available ? 'var(--slate-300)' : form.appointment_time===slot.time ? 'white' : 'var(--slate-700)',
                            transition:'all 0.2s',
                            textDecoration: !slot.available ? 'line-through' : 'none',
                          }}>
                          {slot.display}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group" style={{ marginBottom:32 }}>
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" value={form.message} onChange={set('message')} placeholder="Any concerns, previous dental history, or special requests…" rows={3}/>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={submitting}>
                {submitting ? <><span className="spinner"/>Booking…</> : '📅 Confirm Appointment'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Hours */}
            <div style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-md)' }}>
              <h4 style={{ fontFamily:'var(--font-display)', marginBottom:16, fontSize:18 }}>🕒 Clinic Hours</h4>
              {[['Mon – Fri','9:00 AM – 6:00 PM','open'],['Saturday','Closed','closed'],['Sunday','Closed','closed']].map(([d,h,s])=>(
                <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--slate-50)', fontSize:14 }}>
                  <span style={{ color:'var(--slate-600)' }}>{d}</span>
                  <span style={{ fontWeight:600, color:s==='open'?'var(--sky-600)':'var(--slate-400)' }}>{h}</span>
                </div>
              ))}
            </div>
            {/* Contact */}
            <div style={{ background:'linear-gradient(135deg,#0284c7,#0369a1)', borderRadius:'var(--radius-lg)', padding:'28px', color:'white' }}>
              <h4 style={{ fontFamily:'var(--font-display)', marginBottom:16, fontSize:18 }}>📞 Quick Contact</h4>
              <p style={{ fontSize:14, opacity:0.9, marginBottom:16, lineHeight:1.7 }}>Prefer to call? We're happy to help book your appointment over the phone.</p>
              <a href="tel:+14155550123" style={{ display:'block', fontWeight:700, fontSize:18, color:'white', marginBottom:8 }}>+1 (415) 555-0123</a>
              <a href="mailto:hello@auroradental.com" style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>hello@auroradental.com</a>
            </div>
            {/* Tips */}
            <div style={{ background:'var(--sky-50)', border:'1px solid var(--sky-100)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h4 style={{ fontFamily:'var(--font-display)', marginBottom:12, fontSize:16, color:'var(--sky-800)' }}>💡 Good to Know</h4>
              {['Arrive 10 minutes early','Bring a photo ID','Mention any medications','24hr cancellation notice required'].map(t=>(
                <div key={t} style={{ fontSize:13, color:'var(--sky-700)', marginBottom:8, display:'flex', gap:8 }}>
                  <span>•</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
