import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.adminId) setAdminId(res.data.adminId);
      setStep(2);
    } catch(err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { adminId, otp, newPassword });
      setSuccess(true);
    } catch(err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#f0f9ff,#bae6fd)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:48, maxWidth:400, width:'100%', textAlign:'center', boxShadow:'var(--shadow-xl)' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontFamily:'var(--font-display)', marginBottom:12 }}>Password Reset!</h2>
        <p style={{ color:'var(--slate-500)', marginBottom:28 }}>Your password has been changed successfully. You can now log in.</p>
        <Link to="/admin/login" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#f0f9ff,#bae6fd)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🦷</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--slate-900)' }}>Aurora Dental Care</div>
          </Link>
        </div>
        <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:40, boxShadow:'var(--shadow-xl)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:8 }}>Reset Password</h2>
          <p style={{ color:'var(--slate-500)', fontSize:14, marginBottom:28 }}>
            {step === 1 ? 'Enter your admin email to receive a reset OTP.' : 'Enter the OTP and your new password.'}
          </p>
          {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>⚠️ {error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group" style={{ marginBottom:24 }}>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@auroradental.com" required autoFocus/>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                {loading ? <><span className="spinner"/>Sending…</> : 'Send Reset OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">OTP Code</label>
                <input className="form-input" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} style={{ letterSpacing:8, fontSize:22, textAlign:'center', fontWeight:700 }} required/>
              </div>
              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Min 8 chars, upper, lower, number, symbol" required/>
              </div>
              <div className="form-group" style={{ marginBottom:24 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repeat new password" required/>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                {loading ? <><span className="spinner"/>Resetting…</> : 'Reset Password'}
              </button>
            </form>
          )}
          <div style={{ textAlign:'center', marginTop:20 }}>
            <Link to="/admin/login" style={{ fontSize:13, color:'var(--slate-500)' }}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
