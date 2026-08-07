import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function AppointmentsView({ user, API_URL }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = `${API_URL}/appointments?`;
      if (user.role === 'customer') url += `customerId=${user.refId}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Please Sign In</h3>
        <p style={{ color: 'var(--text-muted)' }}>Log in to view your salon appointment bookings and visit records.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0 }}>
            {user.role === 'customer' ? 'My Salon Appointments' : 'Salon Appointment Master Register'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Showing {appointments.length} scheduled and past visit records
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <Calendar size={36} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h3>No Appointments Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You have no appointment bookings scheduled.</p>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service & Category</th>
                <th>Branch Location</th>
                <th>Date & Time</th>
                <th>Bill & Payable</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{apt.Customer_Name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.C_PhoneNo || apt.C_Email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{apt.Service_Name}</div>
                    <span className="badge badge-gold">{apt.Category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--primary)" /> {apt.Branch_Name}
                    </div>
                  </td>
                  <td>
                    <div>{apt.Appointment_Date}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {apt.Appointment_Time}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>
                      ${apt.Payable_amount ? parseFloat(apt.Payable_amount).toFixed(2) : parseFloat(apt.Ser_Price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bill #{apt.Bill_ID || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{apt.Payment_mode || 'Pending'}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
