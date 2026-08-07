import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CreditCard, Receipt } from 'lucide-react';
import axios from 'axios';

export default function BillingView({ API_URL }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/billing`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBills(res.data);
    } catch (err) {
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = bills.reduce((acc, b) => acc + (b.Payable_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt color="var(--primary)" /> Financial Billing & Invoice Master Register
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Aggregated payment records, discounts applied, and customer receipts</p>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'right', border: '1px solid var(--primary)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Payable Collected</span>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>₹{totalCollected.toFixed(2)}</h2>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading billing records...</div>
      ) : (
        <div className="glass-card table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Service / Details</th>
                <th>Gross Amount</th>
                <th>Discount Rate</th>
                <th>Net Payable</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.Bill_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#INV-{b.Bill_ID}</td>
                  <td style={{ fontWeight: 600 }}>{b.Customer_Name || 'Walk-in Customer'}</td>
                  <td>{b.Service_Name || 'Salon Service'}</td>
                  <td>₹{parseFloat(b.Amount).toFixed(2)}</td>
                  <td>
                    {b.Discount > 0 ? (
                      <span className="badge badge-gold">{b.Discount}% OFF</span>
                    ) : (
                      <span className="badge badge-secondary">0%</span>
                    )}
                  </td>
                  <td style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>
                    ₹{parseFloat(b.Payable_amount).toFixed(2)}
                  </td>
                  <td>
                    <span className="badge badge-warning">{b.Payment_mode}</span>
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
