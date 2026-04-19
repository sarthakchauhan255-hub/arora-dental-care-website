import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminLoginPage = () => {
  const { loginSuccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=credentials, 2=OTP
  const [adminId, setAdminId] = useState(null);
  const [form, setForm] = useState({ email:'', password:'' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => { if (isAuthenticated) navigate('/admin/dashboard'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c=>c-1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      setAdminId(res.data.adminId);
      setStep(2);
      setResendCooldown(60);
    } catch(err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { adminId, otp });
      loginSuccess(res.data.token, res.data.admin);
      navigate('/admin/dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post('/auth/resend-otp', { adminId });
      setResendCooldown(60);
      setError('');
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#f0f9ff,#bae6fd)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{ width:52, height:52, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'var(--shadow-blue)' }}>🦷</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--slate-900)' }}>Aurora Dental Care</div>
              <div style={{ fontSize:12, color:'var(--slate-400)' }}>Admin Portal</div>
            </div>
          </Link>
        </div>

        <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:'40px', boxShadow:'var(--shadow-xl)', animation:'scaleIn 0.3s ease' }}>
          {/* Step indicator */}
          <div style={{ display:'flex', gap:8, marginBottom:32 }}>
            {['Credentials','Verify OTP'].map((s, i) => (
              <div key={s} style={{ flex:1, height:4, borderRadius:2, background: step > i ? 'var(--sky-500)' : step === i+1 ? 'var(--sky-300)' : 'var(--slate-100)', transition:'background 0.3s' }}/>
            ))}
          </div>

          {error && (
            <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14, display:'flex', gap:8 }}>
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:8 }}>Admin Sign In</h2>
              <p style={{ color:'var(--slate-500)', fontSize:14, marginBottom:28 }}>Enter your credentials to receive an OTP.</p>
              <form onSubmit={handleLogin}>
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="admin@auroradental.com" required autoFocus/>
                </div>
                <div className="form-group" style={{ marginBottom:28 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <label className="form-label" style={{ margin:0 }}>Password</label>
                    <Link to="/admin/forgot-password" style={{ fontSize:13, color:'var(--sky-600)' }}>Forgot password?</Link>
                  </div>
                  <input className="form-input" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required/>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                  {loading ? <><span className="spinner"/>Verifying…</> : '→ Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:8 }}>Enter OTP</h2>
              <p style={{ color:'var(--slate-500)', fontSize:14, marginBottom:28 }}>A 6-digit code was sent to your email. It expires in 5 minutes.</p>
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group" style={{ marginBottom:28 }}>
                  <label className="form-label">One-Time Password</label>
                  <input className="form-input" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} style={{ letterSpacing:8, fontSize:24, textAlign:'center', fontWeight:700 }} required autoFocus/>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginBottom:16 }} disabled={loading || otp.length < 6}>
                  {loading ? <><span className="spinner"/>Verifying…</> : '✓ Verify & Sign In'}
                </button>
                <div style={{ textAlign:'center', fontSize:13, color:'var(--slate-500)' }}>
                  Didn't receive it?{' '}
                  <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                    style={{ background:'none', border:'none', color: resendCooldown>0?'var(--slate-400)':'var(--sky-600)', fontWeight:600, cursor: resendCooldown>0?'default':'pointer', fontSize:13 }}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
              <button onClick={()=>{setStep(1);setOtp('');setError('');}} style={{ marginTop:16, background:'none', border:'none', color:'var(--slate-400)', fontSize:13, cursor:'pointer', display:'block', textAlign:'center', width:'100%' }}>
                ← Back to credentials
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:24 }}>
          <Link to="/" style={{ fontSize:13, color:'var(--slate-500)' }}>← Back to website</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
