import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ServicesView from './components/ServicesView';
import AppointmentsView from './components/AppointmentsView';
import AdminView from './components/AdminView';
import InventoryView from './components/InventoryView';
import BillingView from './components/BillingView';
import QueriesView from './components/QueriesView';

const API_URL = 'https://beauty-salon-database-management-system.onrender.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check existing stored token
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser({
            userId: res.data.user.User_ID,
            email: res.data.user.Email,
            role: res.data.user.Role,
            refId: res.data.user.Ref_ID,
            profile: res.data.profile
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  const handleLogin = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    if (res.data.user.role === 'admin') setActiveTab('admin');
    else if (res.data.user.role === 'staff') setActiveTab('appointments');
    else setActiveTab('services');
  };

  const handleRegister = async (formData) => {
    const res = await axios.post(`${API_URL}/auth/register`, formData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setActiveTab('services');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('services');
  };

  const handleQuickLogin = async (email, password) => {
    try {
      await handleLogin(email, password);
    } catch (err) {
      alert('Quick login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
      />

      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'services' && (
          <ServicesView
            user={user}
            API_URL={API_URL}
            onAppointmentBooked={() => setActiveTab('appointments')}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView user={user} API_URL={API_URL} />
        )}

        {activeTab === 'admin' && (
          <AdminView API_URL={API_URL} />
        )}

        {activeTab === 'inventory' && (
          <InventoryView API_URL={API_URL} />
        )}

        {activeTab === 'billing' && (
          <BillingView API_URL={API_URL} />
        )}

        {activeTab === 'queries' && (
          <QueriesView API_URL={API_URL} />
        )}
      </main>

      <footer style={{
        background: 'rgba(15, 17, 26, 0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.88rem'
      }}>
        <div>💇‍♀️ <strong>Beauty Salon Database Management System</strong> &bull; Group G2_T9</div>
        <div style={{ fontSize: '0.78rem', marginTop: '4px', color: '#64748b' }}>
          Phase 1 to Phase 4 Database Normalization (BCNF) & Interactive Full Stack Application
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
