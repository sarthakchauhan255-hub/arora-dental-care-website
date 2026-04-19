import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'24px', boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ background:color+'15', color, borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700 }}>{sub}</div>
    </div>
    <div style={{ fontSize:36, fontWeight:700, color:'var(--slate-900)', fontFamily:'var(--font-display)', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:13, color:'var(--slate-500)', marginTop:6 }}>{label}</div>
  </div>
);

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/stats'),
      api.get('/appointments?sort=created_desc'),
    ]).then(([statsRes, aptsRes]) => {
      setStats(statsRes.data.stats);
      setRecentApts(aptsRes.data.appointments.slice(0,5));
    }).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const map = { pending:['badge-yellow','Pending'], confirmed:['badge-blue','Confirmed'], completed:['badge-green','Completed'], missed:['badge-red','Missed'], cancelled:['badge-gray','Cancelled'] };
    const [cls, label] = map[s] || ['badge-gray', s];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  if (loading) return <div style={{ textAlign:'center', padding:80 }}><div className="spinner spinner-blue" style={{ width:40,height:40,borderWidth:4 }}/></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, marginBottom:4 }}>Welcome back, {admin?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color:'var(--slate-500)', fontSize:14 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:20, marginBottom:36 }}>
        <StatCard icon="📅" label="Total Appointments" value={stats?.total||0} color="#0284c7" sub="All time"/>
        <StatCard icon="⏳" label="Pending" value={stats?.pending||0} color="#d97706" sub="Needs review"/>
        <StatCard icon="✅" label="Confirmed" value={stats?.confirmed||0} color="#0284c7" sub="Upcoming"/>
        <StatCard icon="🎉" label="Completed" value={stats?.completed||0} color="#059669" sub="Done"/>
        <StatCard icon="📆" label="Today" value={stats?.today||0} color="#7c3aed" sub="Today's"/>
        <StatCard icon="🗓️" label="This Month" value={stats?.thisMonth||0} color="#0284c7" sub="MTD"/>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:36 }}>
        {[
          { to:'/admin/appointments', icon:'📋', label:'Manage Appointments', desc:'View & update all appointments', color:'#0284c7' },
          { to:'/admin/doctors', icon:'👨‍⚕️', label:'Manage Doctors', desc:'Add, edit, or remove doctors', color:'#059669' },
          { to:'/admin/reviews', icon:'⭐', label:'Manage Reviews', desc:'Approve or delete patient reviews', color:'#d97706' },
          { to:'/admin/settings', icon:'⚙️', label:'Settings', desc:'Update credentials and preferences', color:'#7c3aed' },
        ].map(({ to, icon, label, desc, color }) => (
          <Link key={to} to={to} style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'20px 24px', display:'flex', gap:16, alignItems:'flex-start', border:'1px solid var(--slate-100)', boxShadow:'var(--shadow-sm)', transition:'all 0.2s', textDecoration:'none' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
            <div style={{ width:44, height:44, borderRadius:10, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:14, color:'var(--slate-800)', marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:12, color:'var(--slate-400)' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent appointments */}
      <div style={{ background:'white', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--slate-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:18 }}>Recent Appointments</h3>
          <Link to="/admin/appointments" style={{ fontSize:13, color:'var(--sky-600)', fontWeight:600 }}>View All →</Link>
        </div>
        {recentApts.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--slate-400)' }}>No appointments yet.</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--slate-50)' }}>
                  {['Patient','Service','Date & Time','Status','Doctor'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--slate-500)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApts.map(apt => (
                  <tr key={apt.id} style={{ borderTop:'1px solid var(--slate-50)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--sky-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--slate-800)' }}>{apt.patient_name}</div>
                      <div style={{ fontSize:12, color:'var(--slate-400)' }}>{apt.patient_email}</div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:'var(--slate-600)' }}>{apt.service_name||'General'}</td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:'var(--slate-600)' }}>
                      <div>{new Date(apt.appointment_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                      <div style={{ fontSize:12, color:'var(--slate-400)' }}>{apt.appointment_time}</div>
                    </td>
                    <td style={{ padding:'14px 16px' }}>{statusBadge(apt.status)}</td>
                    <td style={{ padding:'14px 16px', fontSize:13, color:'var(--slate-600)' }}>{apt.doctor_name||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
