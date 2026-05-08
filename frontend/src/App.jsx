import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [stats, setStats] = useState({});
  const [status, setStatus] = useState('Idle');

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/dashboard');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStats(data.analytics || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendPulse = async (type) => {
    setStatus(`Sending ${type}...`);
    try {
      const response = await fetch('http://localhost:8001/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_123',
          event_type: type,
          payload: { timestamp: new Date().toISOString() }
        }),
      });
      if (!response.ok) throw new Error('Ingestion failed');
      setStatus(`Success: ${type} sent!`);
      fetchStats();
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error sending pulse');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Pulse GitOps Platform</h1>
      <div className="card">
        <h3>Trigger Events</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => sendPulse('CLICK')}>Send Click</button>
          <button onClick={() => sendPulse('VIEW')}>Send View</button>
          <button onClick={() => sendPulse('BUY')}>Send Buy</button>
        </div>
        <p>Status: <strong>{status}</strong></p>
      </div>

      <div className="card" style={{ textAlign: 'left', marginTop: '20px' }}>
        <h3>Live Analytics (from User Service)</h3>
        <pre style={{ background: '#f4f4f4', padding: '15px', borderRadius: '5px', color: '#333' }}>
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default App
