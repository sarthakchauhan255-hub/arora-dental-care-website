import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import AdminDoctors from './pages/AdminDoctors';
import { AdminReviews, AdminSettings } from './pages/AdminReviewsSettings';

/* Public layout wrapper */
const PublicLayout = ({ children }) => (
  <>
    <Navbar/>
    <div style={{ paddingTop: 0 }}>{children}</div>
    <Footer/>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration:4000, style:{ fontFamily:'var(--font-body)', fontSize:14 } }}/>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage/></PublicLayout>}/>
          <Route path="/services" element={<PublicLayout><ServicesPage/></PublicLayout>}/>
          <Route path="/booking" element={<PublicLayout><BookingPage/></PublicLayout>}/>
          <Route path="/about" element={<PublicLayout><AboutPage/></PublicLayout>}/>

          {/* Auth routes */}
          <Route path="/admin/login" element={<AdminLoginPage/>}/>
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage/>}/>

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace/>}/>
            <Route path="dashboard" element={<AdminDashboard/>}/>
            <Route path="appointments" element={<AdminAppointments/>}/>
            <Route path="doctors" element={<AdminDoctors/>}/>
            <Route path="reviews" element={<AdminReviews/>}/>
            <Route path="settings" element={<AdminSettings/>}/>
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, textAlign:'center', padding:24 }}>
              <div style={{ fontSize:80 }}>🦷</div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:36 }}>Page Not Found</h1>
              <p style={{ color:'var(--slate-500)' }}>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
