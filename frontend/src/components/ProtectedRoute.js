import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner spinner-blue" style={{ width:40, height:40, borderWidth:4 }}/>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/admin/login" replace/>;
  return children;
};

export default ProtectedRoute;
