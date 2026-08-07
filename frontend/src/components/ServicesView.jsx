import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Award, CheckCircle, Clock, DollarSign, Filter } from 'lucide-react';
import axios from 'axios';

export default function ServicesView({ user, API_URL, onAppointmentBooked }) {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal state
  const [bookingService, setBookingService] = useState(null);
  const [bookingBranchId, setBookingBranchId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [bookingStatus, setBookingStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedBranch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let serviceUrl = `${API_URL}/services?`;
      if (selectedCategory !== 'ALL') serviceUrl += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedBranch) serviceUrl += `branchId=${selectedBranch}&`;

      const [resServices, resBranches, resMemberships] = await Promise.all([
        axios.get(serviceUrl),
        axios.get(`${API_URL}/branches`),
        axios.get(`${API_URL}/memberships`)
      ]);

      setServices(resServices.data);
      setBranches(resBranches.data);
      setMemberships(resMemberships.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (service) => {
    setBookingService(service);
    setBookingBranchId(selectedBranch || (branches[0]?.Branch_ID || '1'));
    // Default tomorrow's date
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setBookingDate(tmr.toISOString().split('T')[0]);
    setBookingStatus({ error: '', success: '' });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus({ error: '', success: '' });

    if (!user) {
      setBookingStatus({ error: 'Please sign in to book an appointment!', success: '' });
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/appointments`, {
        customerId: user.refId,
        serviceId: bookingService.Service_ID,
        branchId: parseInt(bookingBranchId),
        date: bookingDate,
        time: bookingTime,
        paymentMode
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setBookingStatus({ error: '', success: res.data.message });
      setTimeout(() => {
        setBookingService(null);
        if (onAppointmentBooked) onAppointmentBooked();
      }, 1500);
    } catch (err) {
      setBookingStatus({ error: err.response?.data?.error || 'Booking failed', success: '' });
    }
  };

  const handleSubscribe = async (membershipName) => {
    if (!user) {
      alert('Please sign in to subscribe to a membership!');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/memberships/subscribe`, {
        customerId: user.refId,
        membershipName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Subscription failed');
    }
  };

  const categories = ['ALL', 'Hair', 'Nails', 'Skin', 'Waxing', 'Massage', 'Makeup', 'Grooming'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        padding: '36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '10px' }}><Sparkles size={14} /> Luxury Salon Care</span>
          <h1 style={{ fontSize: '2.2rem', margin: '8px 0', color: '#0f172a' }}>Exquisite Beauty & Wellness Services</h1>
          <p style={{ color: '#64748b', maxWidth: '600px' }}>
            Book premium hair styling, facial care, luxury manicures, and body therapy across our Gujarat salon branches.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 20px', borderRadius: '12px' }}>
            <h3 style={{ color: '#be185d', fontSize: '1.5rem', margin: 0 }}>8+</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cities & Branches</span>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 20px', borderRadius: '12px' }}>
            <h3 style={{ color: '#be185d', fontSize: '1.5rem', margin: 0 }}>11+</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Core Services</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Branch Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--primary)" />
          <select
            className="form-control"
            style={{ width: '220px', padding: '8px 12px' }}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.Branch_ID} value={b.Branch_ID}>{b.B_Name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading salon services...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
          {services.map(ser => (
            <div key={ser.Service_ID} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-gold">{ser.Category}</span>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', margin: 0 }}>${parseFloat(ser.Ser_Price).toFixed(2)}</h3>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{ser.Ser_Name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Available at: {ser.Branches || 'Select Branches'}
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => openBookingModal(ser)}
              >
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VIP Membership Plans Banner */}
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award color="var(--primary)" /> VIP Salon Memberships
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {memberships.map(m => (
            <div key={m.M_name} className="glass-card" style={{ border: m.M_name === 'Platinum' ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}>
              <span className="badge badge-gold" style={{ marginBottom: '8px' }}>{m.Duration} Months Plan</span>
              <h3 style={{ fontSize: '1.5rem', margin: '4px 0 12px 0' }}>{m.M_name} Club</h3>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '16px' }}>
                ${parseFloat(m.M_Price).toFixed(2)}
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color="var(--success)" /> {m.Discount_rate}% Off all Service & Product bills
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color="var(--success)" /> Priority appointment booking slots
                </li>
              </ul>
              <button className="btn btn-outline-gold" style={{ width: '100%' }} onClick={() => handleSubscribe(m.M_name)}>
                Subscribe to {m.M_name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <div className="modal-overlay" onClick={() => setBookingService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Book {bookingService.Ser_Name}</h3>
            <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '16px' }}>Base Price: ${parseFloat(bookingService.Ser_Price).toFixed(2)}</p>

            {bookingStatus.error && <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.88rem' }}>{bookingStatus.error}</div>}
            {bookingStatus.success && <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.88rem' }}>{bookingStatus.success}</div>}

            <form onSubmit={handleBookSubmit}>
              <div className="form-group">
                <label>Select Branch Location</label>
                <select
                  className="form-control"
                  required
                  value={bookingBranchId}
                  onChange={(e) => setBookingBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.Branch_ID} value={b.Branch_ID}>{b.B_Name} - {b.B_City}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Appointment Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Salon Counter</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
                Confirm Appointment Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
