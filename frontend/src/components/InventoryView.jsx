import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Phone, Mail, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function InventoryView({ API_URL }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedQty, setAddedQty] = useState(20);
  const [restockMsg, setRestockMsg] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(res.data.products);
      setSuppliers(res.data.suppliers);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setRestockMsg('');
    try {
      const res = await axios.post(`${API_URL}/inventory/restock`, {
        productId: selectedProduct.Product_ID,
        addedQuantity: parseInt(addedQty)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRestockMsg(res.data.message);
      setTimeout(() => {
        setSelectedProduct(null);
        fetchInventory();
      }, 1200);
    } catch (err) {
      setRestockMsg(err.response?.data?.error || 'Restock failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package color="var(--primary)" /> Inventory & Supplier Management
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitor product stock levels, brands, and supplier replenishment channels</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading inventory...</div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Brand</th>
                  <th>Selling Price</th>
                  <th>Stock Level</th>
                  <th>Supplier Info</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.Product_ID}>
                    <td style={{ fontWeight: 600 }}>{p.P_name}</td>
                    <td><span className="badge badge-gold">{p.BrandName}</span></td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>${parseFloat(p.SellingPrice).toFixed(2)}</td>
                    <td>
                      {p.Stock < 25 ? (
                        <span className="badge badge-danger"><AlertTriangle size={12} /> Low ({p.Stock} left)</span>
                      ) : (
                        <span className="badge badge-success">{p.Stock} units</span>
                      )}
                    </td>
                    <td>
                      <div>{p.Supp_Name || 'Direct'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.Supp_PhoneNo}</div>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedProduct(p)}>
                        <Plus size={14} /> Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Restock Product: {selectedProduct.P_name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>Current Stock: {selectedProduct.Stock} units</p>

            {restockMsg && <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>{restockMsg}</div>}

            <form onSubmit={handleRestockSubmit}>
              <div className="form-group">
                <label>Add Stock Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  required
                  value={addedQty}
                  onChange={e => setAddedQty(e.target.value)}
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <strong>Supplier Details:</strong>
                <div>{selectedProduct.Supp_Name}</div>
                <div style={{ color: 'var(--text-muted)' }}>Phone: {selectedProduct.Supp_PhoneNo} | Email: {selectedProduct.Supp_Email}</div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                Confirm Restock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
