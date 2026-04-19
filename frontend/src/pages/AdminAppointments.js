import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const statusConfig = {
  pending:    { label:'Pending',   cls:'badge-yellow' },
  confirmed:  { label:'Confirmed', cls:'badge-blue'   },
  completed:  { label:'Completed', cls:'badge-green'  },
  missed:     { label:'Missed',    cls:'badge-red'    },
  cancelled:  { label:'Cancelled', cls:'badge-gray'   },
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', sort:'date_asc', date_from:'', date_to:'' });
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v])=>v));
      const res = await api.get('/appointments', { params });
      setAppointments(res.data.appointments);
    } catch { setMsg({ type:'error', text:'Failed to load appointments.' }); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setAppointments(p=>p.map(a=>a.id===id?{...a,status}:a));
      setMsg({ type:'success', text:'Status updated.' });
      setTimeout(()=>setMsg(null), 3000);
    } catch { setMsg({ type:'error', text:'Update failed.' }); }
    finally { setUpdating(null); }
  };

  const setFilter = (k) => (e) => setFilters(p=>({...p,[k]:e.target.value}));

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Appointments</h1>
        <p style={{ color:'var(--slate-500)', fontSize:14 }}>Manage all patient appointments</p>
      </div>

      {msg && (
        <div style={{ background:msg.type==='success'?'#d1fae5':'#fee2e2', color:msg.type==='success'?'#065f46':'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>
          {msg.type==='success'?'✓':'⚠️'} {msg.text}
        </div>
      )}

      {/* Filters */}
      <div style={{ background:'white', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:24, boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={filters.status} onChange={setFilter('status')}>
              <option value="">All Statuses</option>
              {Object.entries(statusConfig).map(([v,{label}])=><option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select className="form-input" value={filters.sort} onChange={setFilter('sort')}>
              <option value="date_asc">Date ↑</option>
              <option value="date_desc">Date ↓</option>
              <option value="created_desc">Newest First</option>
              <option value="name_asc">Patient Name</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input className="form-input" type="date" value={filters.date_from} onChange={setFilter('date_from')}/>
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input className="form-input" type="date" value={filters.date_to} onChange={setFilter('date_to')}/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)', border:'1px solid var(--slate-100)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-blue" style={{ width:36,height:36,borderWidth:3 }}/></div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--slate-400)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            No appointments found.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--slate-50)' }}>
                  {['Patient','Service / Doctor','Date & Time','Status','Actions'].map(h=>(
                    <th key={h} style={{ padding:'13px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--slate-500)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt=>(
                  <tr key={apt.id} style={{ borderTop:'1px solid var(--slate-50)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>{apt.patient_name}</div>
                      <div style={{ fontSize:12, color:'var(--slate-400)' }}>{apt.patient_email}</div>
                      <div style={{ fontSize:12, color:'var(--slate-400)' }}>{apt.patient_phone}</div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:13 }}>
                      <div style={{ color:'var(--slate-700)', fontWeight:500 }}>{apt.service_name||'General'}</div>
                      <div style={{ fontSize:12, color:'var(--slate-400)' }}>{apt.doctor_name||'Any doctor'}</div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:13 }}>
                      <div style={{ fontWeight:500 }}>{new Date(apt.appointment_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                      <div style={{ color:'var(--slate-400)', fontSize:12 }}>{apt.appointment_time}</div>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span className={`badge ${statusConfig[apt.status]?.cls||'badge-gray'}`}>{statusConfig[apt.status]?.label||apt.status}</span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <select
                        value={apt.status}
                        onChange={e=>updateStatus(apt.id,e.target.value)}
                        disabled={updating===apt.id}
                        style={{ padding:'7px 10px', borderRadius:8, border:'1.5px solid var(--slate-200)', fontSize:13, background:'white', cursor:'pointer', color:'var(--slate-700)' }}>
                        {Object.entries(statusConfig).map(([v,{label}])=><option key={v} value={v}>{label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:'14px 16px', background:'var(--slate-50)', borderTop:'1px solid var(--slate-100)', fontSize:13, color:'var(--slate-500)' }}>
              Showing {appointments.length} appointment{appointments.length!==1?'s':''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
