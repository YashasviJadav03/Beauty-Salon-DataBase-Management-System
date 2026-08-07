import React, { useState, useEffect } from 'react';
import { Database, Play, Code, CheckCircle, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import axios from 'axios';

export default function QueriesView({ API_URL }) {
  const [queriesList, setQueriesList] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState(1);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customSQL, setCustomSQL] = useState('');
  const [customResult, setCustomResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchQueriesList();
  }, []);

  useEffect(() => {
    if (selectedQueryId) {
      runPredefinedQuery(selectedQueryId);
    }
  }, [selectedQueryId]);

  const fetchQueriesList = async () => {
    try {
      const res = await axios.get(`${API_URL}/queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueriesList(res.data);
    } catch (err) {
      console.error('Error loading query list:', err);
    }
  };

  const runPredefinedQuery = async (id) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${API_URL}/queries/${id}/execute`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueryResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRun = async (e) => {
    e.preventDefault();
    if (!customSQL.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/queries/custom`, { sql: customSQL }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCustomResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database color="var(--primary)" /> SQL Analytical Engine & Business Queries
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Run real-time analytical queries against the normalized salon relational database (from Phase 4 DBMS Specification)
        </p>
      </div>

      {/* Query Selector Bar */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
            Select Business Analytical Query:
          </label>
          <select
            className="form-control"
            style={{ width: '100%', padding: '10px 14px', fontSize: '0.95rem' }}
            value={selectedQueryId}
            onChange={(e) => setSelectedQueryId(parseInt(e.target.value))}
          >
            {queriesList.map(q => (
              <option key={q.id} value={q.id}>Query #{q.id}: {q.title}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: '20px', padding: '10px 20px' }}
          onClick={() => runPredefinedQuery(selectedQueryId)}
          disabled={loading}
        >
          <Play size={16} /> Execute Query
        </button>
      </div>

      {/* Query Metadata & SQL Code Display */}
      {queryResult && (
        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '6px' }}>Query #{queryResult.id}</span>
              <h3 style={{ fontSize: '1.3rem', margin: '4px 0', color: '#831843' }}>{queryResult.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>"{queryResult.description}"</p>
            </div>
            <span className="badge badge-success">
              <CheckCircle size={12} /> {queryResult.rowCount} Rows Returned
            </span>
          </div>

          {/* SQL Snippet View */}
          <div style={{ background: '#fdf2f8', padding: '14px', borderRadius: '10px', border: '1px solid #fbcfe8', margin: '14px 0' }}>
            <div style={{ fontSize: '0.78rem', color: '#db2777', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={14} /> EXECUTED SQL CODE:
            </div>
            <pre style={{ margin: 0, fontSize: '0.88rem', color: '#831843', fontFamily: 'Courier New, monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {queryResult.sql}
            </pre>
          </div>

          {/* Data Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Executing query...</div>
          ) : queryResult.data?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No matching records found for this query parameters.</div>
          ) : (
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    {queryResult.columns?.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.data?.map((row, idx) => (
                    <tr key={idx}>
                      {queryResult.columns?.map(col => (
                        <td key={col}>{row[col] !== null ? String(row[col]) : <em style={{ color: '#64748b' }}>NULL</em>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Custom SQL Sandbox */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal color="var(--primary)" size={18} /> Admin Live SQL Execution Sandbox
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
          Execute custom SELECT queries or database inspect commands live on the SQLite schema.
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCustomRun}>
          <textarea
            className="form-control"
            rows="3"
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '12px' }}
            placeholder="SELECT * FROM Customer LIMIT 10;"
            value={customSQL}
            onChange={(e) => setCustomSQL(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Play size={16} /> Run Custom SQL
          </button>
        </form>

        {customResult && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: 'var(--success)', fontSize: '0.88rem', marginBottom: '8px' }}>
              Execution completed cleanly ({customResult.rowCount || customResult.changes || 0} result(s))
            </p>
            {customResult.data && customResult.data.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {customResult.columns?.map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {customResult.data.map((row, i) => (
                      <tr key={i}>
                        {customResult.columns?.map(col => <td key={col}>{String(row[col])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
