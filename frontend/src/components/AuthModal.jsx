import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Sparkles, Key } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: 'Female',
    city: 'Ahmedabad',
    street: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await onRegister(formData);
      } else {
        await onLogin(formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillPreset = (email, password) => {
    setIsRegister(false);
    setFormData({ ...formData, email, password });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.35rem', color: '#0f172a' }}>{isRegister ? 'Create Customer Account' : 'Sign In to Your Account'}</h3>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.88rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="e.g. Ahmedabad"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '11px' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            style={{ background: 'none', border: 'none', color: '#be185d', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>

        {/* Evaluation Credentials Helper */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setShowPresets(!showPresets)}
          >
            <Key size={12} /> {showPresets ? 'Hide test login accounts' : 'Need test login credentials?'}
          </button>

          {showPresets && (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                onClick={() => fillPreset('customer@salon.com', 'customer123')}
              >
                Customer
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                onClick={() => fillPreset('staff@salon.com', 'staff123')}
              >
                Staff
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#be185d', borderColor: '#fbcfe8' }}
                onClick={() => fillPreset('admin@salon.com', 'admin123')}
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
