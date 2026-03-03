import { useState } from 'react';

export default function Settings() {
  const [apiBase, setApiBase] = useState('http://localhost:8000');
  const [theme, setTheme] = useState('dark');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Local configuration
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '480px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}
          >
            Controller API Base URL
          </label>
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            The base URL for the Controller wrapper API
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}
          >
            Theme
          </label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Dark</option>
            <option value="light">Light (coming soon)</option>
          </select>
        </div>

        <button
          style={{
            alignSelf: 'flex-start',
            padding: '8px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-indigo)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
