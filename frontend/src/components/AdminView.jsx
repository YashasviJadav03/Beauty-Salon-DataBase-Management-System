import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, Package, MapPin, Award, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function AdminView({ API_URL }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Executive Dashboard...</div>;
  }

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="var(--primary)" /> Executive Salon Dashboard & Analytics
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>System-wide revenue metrics, branch performance, and operational status</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Total Gross Revenue</span>
            <DollarSign size={18} color="var(--primary)" />
          </div>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginTop: '6px' }}>
            ₹{parseFloat(stats.totalRevenue).toFixed(2)}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From {stats.totalBills} billing invoices</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Total Appointments</span>
            <Calendar size={18} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.totalAppointments}</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>Across 8 Gujarat branches</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #60a5fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Active Customers</span>
            <Users size={18} color="#60a5fa" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.totalCustomers}</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Profiles</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Low Stock Alerts</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <h2 style={{ color: '#f59e0b', fontSize: '2rem', marginTop: '6px' }}>{stats.lowStockCount}</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Items needing replenishment</span>
        </div>
      </div>

      {/* Recent Appointments & Branch Summary */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Recent Appointment Activity Log</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Service Booked</th>
                <th>Branch</th>
                <th>Payable Bill</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAppointments?.map((apt, i) => (
                <tr key={i}>
                  <td>{apt.Appointment_Date} ({apt.Appointment_Time})</td>
                  <td style={{ fontWeight: 600 }}>{apt.C_Name}</td>
                  <td><span className="badge badge-gold">{apt.Ser_Name}</span></td>
                  <td>{apt.B_Name}</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>
                    ₹{apt.Payable_amount ? parseFloat(apt.Payable_amount).toFixed(2) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
