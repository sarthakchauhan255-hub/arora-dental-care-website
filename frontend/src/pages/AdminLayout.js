import React, { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(()=>{
   const handleResize = ()=> {
     const mobile = window.innerWidth <=768;
     setIsMobile(mobile);

     if(window.innerWidth <= 768){
     setSidebarOpen(false);
     }
    };
   window.addEventListener('resize', handleResize);
   return ()=> window.removeEventListener('resize', handleResize);
  },[]);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--slate-50)' }}>
      {/* Sidebar */}
      <aside style={{
         width: isMobile
          ? 260
          : (sidebarOpen ? 260 : 78),
         background:'var(--slate-900)',
         color:'white',
         display:'flex',
         flexDirection:'column',
         overflow:'hidden',

         position:isMobile ? 'fixed' : 'sticky',
         top:0,
         left: isMobile
         ? (sidebarOpen ? 0 : '-270px')
         : 0,

         height:'100vh',
         zIndex:1000,
         transition:'left .3s ease, width .3s ease'
        }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:10, minHeight:72 }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🦷</div>
            {((!isMobile && sidebarOpen) || isMobile) && (
            <div style={{overflow:'hidden', whiteSpace:'nowrap'}}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'white' }}>Aurora Dental</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>Admin Panel</div>
          </div>}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'16px 8px', overflowY:'auto' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
             key={to}
             to={to}
             end={to==='/admin/dashboard'}
             onClick={()=>{
             if(isMobile) setSidebarOpen(false);
             }}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center',justifyContent: sidebarOpen || isMobile ? 'flex-start' : 'center', gap:12, padding:'11px 12px',
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
              {(sidebarOpen || isMobile) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', padding:'16px 8px' }}>
          <Link
           to="/"
           onClick={()=>{
            if(isMobile) setSidebarOpen(false);
           }}
             style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--radius-md)', color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:4, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='white';e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='';e.currentTarget.style.background='';}}>
            <span style={{ fontSize:16, flexShrink:0 }}>🌐</span>
            {(sidebarOpen || isMobile) && <span>View Website</span>}
          </Link>
          <button
           onClick={()=>{
            if(isMobile) setSidebarOpen(false);
            handleLogout();
           }} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--radius-md)', background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', width:'100%', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.background='rgba(248,113,113,0.1)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='';e.currentTarget.style.background='';}}>
            <span style={{ fontSize:16, flexShrink:0 }}>🚪</span>
            {(sidebarOpen || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
      {isMobile && sidebarOpen && (
      <div
       onClick={()=>setSidebarOpen(false)}
       style={{
        position:'fixed',
        inset:0,
        background:'rgba(0,0,0,.45)',
        zIndex:999
       }}
      />
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Top bar */}
        <header style={{ background:'white', borderBottom:'1px solid var(--slate-100)', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-sm)' }}>
          <button
           onClick={()=>setSidebarOpen(!sidebarOpen)}
           style={{
           background:'none',
           border:'none',
           fontSize:28,
           cursor:'pointer',
           padding:8
           }}
          >
          ☰
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--slate-800)' }}>{admin?.name}</div>
                {!isMobile && (
                <div style={{ fontSize:12, color:'var(--slate-400)' }}>
                 {admin?.email}
                </div>
                )}
            </div>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0ea5e9,#0284c7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>
              {admin?.name?.[0] || 'A'}
            </div>
          </div>
        </header>
        <main style={{ flex:1,padding:isMobile ? '18px' : '32px 28px',overflowY:'auto'}}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
