import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const navItems = [
  { to:'/admin/dashboard', icon:'📊', label:'Dashboard' },
  { to:'/admin/appointments', icon:'📅', label:'Appointments' },
  { to:'/admin/doctors', icon:'👨‍⚕️', label:'Doctors' },
  { to:'/admin/reviews', icon:'⭐', label:'Reviews' },
  { to:'/admin/settings', icon:'⚙️', label:'Settings' },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--slate-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 72,
        background:'var(--slate-900)', color:'white',
        display:'flex', flexDirection:'column',
        transition:'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow:'hidden', flexShrink:0, position:'sticky', top:0, height:'100vh',
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:10, minHeight:72 }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🦷</div>
          {sidebarOpen && <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'white' }}>Aurora Dental</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Admin Panel</div>
          </div>}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'16px 8px', overflowY:'auto' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to==='/admin/dashboard'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12, padding:'11px 12px',
                borderRadius:'var(--radius-md)', marginBottom:4,
                background: isActive ? 'rgba(14,165,233,0.15)' : 'transparent',
                color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.6)',
                transition:'all 0.2s', fontSize:14, fontWeight: isActive ? 600 : 400,
                whiteSpace:'nowrap', overflow:'hidden',
                borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
              })}
              onMouseEnter={e=>{ if(!e.currentTarget.classList.contains('active')) e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', padding:'16px 8px' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--radius-md)', color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:4, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='white';e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='';e.currentTarget.style.background='';}}>
            <span style={{ fontSize:16, flexShrink:0 }}>🌐</span>
            {sidebarOpen && <span>View Website</span>}
          </Link>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--radius-md)', background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', width:'100%', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.background='rgba(248,113,113,0.1)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='';e.currentTarget.style.background='';}}>
            <span style={{ fontSize:16, flexShrink:0 }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Top bar */}
        <header style={{ background:'white', borderBottom:'1px solid var(--slate-100)', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-sm)' }}>
          <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--slate-500)', padding:8, borderRadius:8 }}>
            {sidebarOpen ? '☰' : '☰'}
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--slate-800)' }}>{admin?.name}</div>
              <div style={{ fontSize:12, color:'var(--slate-400)' }}>{admin?.email}</div>
            </div>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>
              {admin?.name?.[0] || 'A'}
            </div>
          </div>
        </header>
        <main style={{ flex:1, padding:'32px 28px', overflowY:'auto' }}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
