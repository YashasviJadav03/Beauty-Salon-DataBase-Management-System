import React from 'react';
import { Scissors, User, LogOut, ShieldCheck, Sparkles, Database, Calendar, Package, DollarSign, UserPlus } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout }) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }} 
          onClick={() => setActiveTab('services')}
        >
          <div style={{
            background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(190, 24, 93, 0.2)'
          }}>
            <Scissors size={18} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.1, color: '#0f172a', fontFamily: "'Playfair Display', serif" }}>
              Luxe Salon & Spa
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#be185d', letterSpacing: '0.5px', fontWeight: 600 }}>
              MANAGEMENT SYSTEM
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            className="nav-tab"
            style={{
              padding: '7px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'services' ? '#ffffff' : 'transparent',
              color: activeTab === 'services' ? '#be185d' : '#64748b',
              boxShadow: activeTab === 'services' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('services')}
          >
            <Sparkles size={14} /> Services
          </button>

          {user && (
            <button
              className="nav-tab"
              style={{
                padding: '7px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'appointments' ? '#ffffff' : 'transparent',
                color: activeTab === 'appointments' ? '#be185d' : '#64748b',
                boxShadow: activeTab === 'appointments' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar size={14} /> {user.role === 'customer' ? 'My Visits' : 'Appointments'}
            </button>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                className="nav-tab"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeTab === 'admin' ? '#ffffff' : 'transparent',
                  color: activeTab === 'admin' ? '#be185d' : '#64748b',
                  boxShadow: activeTab === 'admin' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldCheck size={14} /> Dashboard
              </button>
              <button
                className="nav-tab"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeTab === 'inventory' ? '#ffffff' : 'transparent',
                  color: activeTab === 'inventory' ? '#be185d' : '#64748b',
                  boxShadow: activeTab === 'inventory' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('inventory')}
              >
                <Package size={14} /> Inventory
              </button>
              <button
                className="nav-tab"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeTab === 'billing' ? '#ffffff' : 'transparent',
                  color: activeTab === 'billing' ? '#be185d' : '#64748b',
                  boxShadow: activeTab === 'billing' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('billing')}
              >
                <DollarSign size={14} /> Billing
              </button>
              <button
                className="nav-tab"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeTab === 'queries' ? '#ffffff' : 'transparent',
                  color: activeTab === 'queries' ? '#be185d' : '#64748b',
                  boxShadow: activeTab === 'queries' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('queries')}
              >
                <Database size={14} /> SQL Engine
              </button>
            </>
          )}
        </nav>

        {/* Right User Authentication Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.profile?.C_Name || user.profile?.S_name || user.profile?.A_Name || user.email.split('@')[0]}
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {user.role}
                </span>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '7px 10px', color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }} 
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.85rem' }} onClick={onOpenAuth}>
                <User size={14} /> Sign In
              </button>
              <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.85rem' }} onClick={onOpenAuth}>
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
