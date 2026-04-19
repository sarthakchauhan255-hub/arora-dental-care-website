import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const emptyForm = { name:'', specialty:'', bio:'', image_url:'', email:'', phone:'', experience_years:0 };

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try { const r = await api.get('/doctors?active=false'); setDoctors(r.data.doctors); }
    catch { setMsg({ type:'error', text:'Failed to load.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (doc) => { setForm({ name:doc.name, specialty:doc.specialty, bio:doc.bio||'', image_url:doc.image_url||'', email:doc.email||'', phone:doc.phone||'', experience_years:doc.experience_years||0 }); setEditingId(doc.id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, { ...form, is_active:true });
        setMsg({ type:'success', text:'Doctor updated.' });
      } else {
        await api.post('/doctors', form);
        setMsg({ type:'success', text:'Doctor added.' });
      }
      setShowForm(false);
      fetchDoctors();
    } catch(err) {
      setMsg({ type:'error', text: err.response?.data?.message||'Failed.' });
    } finally { setSaving(false); setTimeout(()=>setMsg(null),3000); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); fetchDoctors(); setMsg({ type:'success', text:'Doctor deactivated.' }); setTimeout(()=>setMsg(null),3000); }
    catch { setMsg({ type:'error', text:'Failed.' }); }
  };

  const set = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Doctors</h1>
          <p style={{ color:'var(--slate-500)', fontSize:14 }}>Manage your medical team</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      {msg && <div style={{ background:msg.type==='success'?'#d1fae5':'#fee2e2', color:msg.type==='success'?'#065f46':'#991b1b', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:14 }}>{msg.text}</div>}

      {/* Form modal overlay */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e=>{ if(e.target===e.currentTarget) setShowForm(false); }}>
          <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:40, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow-xl)' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:24 }}>{editingId?'Edit Doctor':'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={set('name')} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty *</label>
                  <input className="form-input" value={form.specialty} onChange={set('specialty')} required/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={set('phone')}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
                <div className="form-group">
                  <label className="form-label">Photo URL</label>
                  <input className="form-input" value={form.image_url} onChange={set('image_url')} placeholder="https://..."/>
                </div>
                <div className="form-group">
                  <label className="form-label">Years Exp.</label>
                  <input className="form-input" type="number" value={form.experience_years} onChange={set('experience_years')} min={0}/>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom:28 }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input" value={form.bio} onChange={set('bio')} rows={3}/>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1, justifyContent:'center' }}>
                  {saving?<><span className="spinner"/>Saving…</>: editingId?'Update Doctor':'Add Doctor'}
                </button>
                <button type="button" className="btn btn-outline" onClick={()=>setShowForm(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-blue" style={{ width:36,height:36,borderWidth:3 }}/></div>
      ) : (
        <div className="grid-3">
          {doctors.map(doc=>(
            <div key={doc.id} className="card" style={{ padding:0 }}>
              <div style={{ position:'relative' }}>
                <img src={doc.image_url||'https://via.placeholder.com/400x260?text=No+Photo'} alt={doc.name} style={{ width:'100%', height:220, objectFit:'cover' }}/>
                {!doc.is_active && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>INACTIVE</div>}
              </div>
              <div style={{ padding:'20px 24px 24px' }}>
                <h3 style={{ fontSize:17, marginBottom:2 }}>{doc.name}</h3>
                <div style={{ color:'var(--sky-600)', fontWeight:600, fontSize:13, marginBottom:8 }}>{doc.specialty}</div>
                <div style={{ fontSize:12, color:'var(--slate-400)', marginBottom:4 }}>📧 {doc.email||'—'}</div>
                <div style={{ fontSize:12, color:'var(--slate-400)', marginBottom:16 }}>🎓 {doc.experience_years} yrs exp</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={()=>openEdit(doc)}>✏️ Edit</button>
                  <button className="btn btn-sm" style={{ flex:1, justifyContent:'center', background:'#fee2e2', color:'#991b1b', border:'none' }} onClick={()=>handleDelete(doc.id)}>🗑️ Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
