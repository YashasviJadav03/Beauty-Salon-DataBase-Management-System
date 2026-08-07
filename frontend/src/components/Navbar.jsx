import React from 'react';
import { Scissors, User, LogOut, ShieldCheck, Sparkles, Database, Calendar, Package, DollarSign, Users } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout, onQuickLogin }) {
  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #fbcfe8',
      boxShadow: '0 4px 20px rgba(236, 72, 153, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('services')}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
          }}>
            <Scissors size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2, color: '#831843' }}>Luxe Salon & Spa</h2>
            <p style={{ fontSize: '0.72rem', color: '#db2777', margin: 0, letterSpacing: '1px', fontWeight: 600 }}>DATABASE MANAGEMENT SYSTEM</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on Role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('services')}
          >
            <Sparkles size={16} /> Services & Offers
          </button>

          {user && (
            <button
              className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar size={16} /> {user.role === 'customer' ? 'My Appointments' : 'Appointments Schedule'}
            </button>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldCheck size={16} /> Admin Dashboard
              </button>
              <button
                className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('inventory')}
              >
                <Package size={16} /> Inventory
              </button>
              <button
                className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('billing')}
              >
                <DollarSign size={16} /> Billing
              </button>
              <button
                className={`btn ${activeTab === 'queries' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('queries')}
              >
                <Database size={16} /> SQL Analytics
              </button>
            </>
          )}
        </nav>

        {/* User Auth Info & Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Demo Login Quick Links */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              title="Quick Demo Customer Login"
              onClick={() => onQuickLogin('customer@salon.com', 'customer123')}
            >
              Demo Cust
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              title="Quick Demo Staff Login"
              onClick={() => onQuickLogin('staff@salon.com', 'staff123')}
            >
              Demo Staff
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: '#ec4899', color: '#be185d' }}
              title="Quick Demo Admin Login"
              onClick={() => onQuickLogin('admin@salon.com', 'admin123')}
            >
              Demo Admin
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#831843' }}>
                  {user.profile?.C_Name || user.profile?.S_name || user.profile?.A_Name || user.email}
                </div>
                <span className={`badge ${user.role === 'admin' ? 'badge-gold' : user.role === 'staff' ? 'badge-warning' : 'badge-success'}`}>
                  {user.role}
                </span>
              </div>
              <button className="btn btn-danger" style={{ padding: '8px 12px' }} onClick={onLogout}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
