import React, { useState, useEffect } from 'react';
import api from '../utils/api';

/* ════════════════════════════════════════
   REVIEWS PAGE
════════════════════════════════════════ */
export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/reviews'); setReviews(r.data.reviews); }
    catch { setMsg({ type:'error', text:'Failed to load.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id) => {
    try { await api.put(`/admin/reviews/${id}/approve`); fetch(); setMsg({ type:'success', text:'Approved.' }); setTimeout(()=>setMsg(null),3000); }
    catch { setMsg({ type:'error', text:'Failed.' }); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/admin/reviews/${id}`); fetch(); setMsg({ type:'success', text:'Deleted.' }); setTimeout(()=>setMsg(null),3000); }
    catch { setMsg({ type:'error', text:'Failed.' }); }
  };

  const Stars = ({ n }) => <span style={{ color:'#fbbf24' }}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</span>;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Reviews</h1>
        <p style={{ color:'var(--slate-500)', fontSize:14 }}>Approve or remove patient reviews</p>
      </div>
      {msg && <div style={{ background:msg.type==='success'?'#d1fae5':'#fee2e2', color:msg.type==='success'?'#065f46':'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>{msg.text}</div>}
      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-blue" style={{ width:36,height:36,borderWidth:3 }}/></div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--slate-400)' }}>No reviews yet.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {reviews.map(rev=>(
            <div key={rev.id} style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'20px 24px', boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)', display:'flex', gap:20, alignItems:'flex-start' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:18, flexShrink:0 }}>
                {rev.patient_name[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                  <strong style={{ fontSize:15 }}>{rev.patient_name}</strong>
                  <Stars n={rev.rating}/>
                  <span className={`badge ${rev.is_approved?'badge-green':'badge-yellow'}`}>{rev.is_approved?'Approved':'Pending'}</span>
                </div>
                <p style={{ color:'var(--slate-600)', fontSize:14, lineHeight:1.7, marginBottom:4 }}>{rev.comment}</p>
                <div style={{ fontSize:12, color:'var(--slate-400)' }}>{new Date(rev.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                {!rev.is_approved && <button className="btn btn-sm" style={{ background:'#d1fae5', color:'#065f46', border:'none' }} onClick={()=>approve(rev.id)}>✓ Approve</button>}
                <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#991b1b', border:'none' }} onClick={()=>remove(rev.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   SETTINGS PAGE
════════════════════════════════════════ */
export const AdminSettings = () => {
  const [form, setForm] = useState({ newEmail:'', newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMsg({ type:'error', text:'Passwords do not match.' }); return;
    }
    setLoading(true); setMsg(null);
    try {
      const payload = {};
      if (form.newEmail) payload.newEmail = form.newEmail;
      if (form.newPassword) payload.newPassword = form.newPassword;
      await api.put('/auth/credentials', payload);
      setMsg({ type:'success', text:'Credentials updated successfully.' });
      setForm({ newEmail:'', newPassword:'', confirmPassword:'' });
    } catch(err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Update failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Settings</h1>
        <p style={{ color:'var(--slate-500)', fontSize:14 }}>Update your admin credentials</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
        {/* Credentials form */}
        <div style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'32px', boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:24 }}>🔐 Update Credentials</h3>
          {msg && <div style={{ background:msg.type==='success'?'#d1fae5':'#fee2e2', color:msg.type==='success'?'#065f46':'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>{msg.type==='success'?'✓':' ⚠️'} {msg.text}</div>}
          <form onSubmit={handleUpdate}>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">New Email Address</label>
              <input className="form-input" type="email" value={form.newEmail} onChange={set('newEmail')} placeholder="Leave blank to keep current"/>
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="Leave blank to keep current"/>
              <span style={{ fontSize:12, color:'var(--slate-400)' }}>Min 8 chars: uppercase, lowercase, number, symbol</span>
            </div>
            <div className="form-group" style={{ marginBottom:28 }}>
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat new password"/>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
              {loading?<><span className="spinner"/>Saving…</>:'Save Changes'}
            </button>
          </form>
        </div>

        {/* Info card */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ background:'var(--sky-50)', border:'1px solid var(--sky-100)', borderRadius:'var(--radius-lg)', padding:'28px' }}>
            <h4 style={{ color:'var(--sky-800)', marginBottom:12, fontFamily:'var(--font-display)', fontSize:18 }}>🛡️ Security Notes</h4>
            {['Use a strong, unique password','Enable 2FA via OTP on every login','OTP expires after 5 minutes','Rate limiting protects your account','JWT sessions expire after 8 hours'].map(t=>(
              <div key={t} style={{ fontSize:13, color:'var(--sky-700)', marginBottom:8, display:'flex', gap:8 }}><span style={{ flexShrink:0 }}>•</span>{t}</div>
            ))}
          </div>
          <div style={{ background:'white', border:'1px solid var(--slate-100)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-sm)' }}>
            <h4 style={{ fontFamily:'var(--font-display)', fontSize:18, marginBottom:16 }}>ℹ️ System Info</h4>
            <div style={{ fontSize:13, color:'var(--slate-500)', lineHeight:2 }}>
              <div>🔧 Version: 1.0.0</div>
              <div>🛠️ Stack: React + Node.js + MySQL</div>
              <div>🔒 Auth: JWT + OTP (email)</div>
              <div>📧 Email: Nodemailer / Gmail SMTP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
