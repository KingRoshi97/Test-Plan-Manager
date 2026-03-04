import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  label?: string;
  defaultExpanded?: boolean;
}

export default function JsonViewer({ data, label, defaultExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (data === null || data === undefined) {
    return <span style={{ color: '#9ca3af' }}>null</span>;
  }

  if (typeof data !== 'object') {
    return <span style={{ color: '#059669' }}>{JSON.stringify(data)}</span>;
  }

  const entries = Array.isArray(data)
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data as Record<string, unknown>);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          color: '#6366f1',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}
      >
        {expanded ? '▼' : '▶'} {label ?? (Array.isArray(data) ? `Array(${data.length})` : `Object(${entries.length})`)}
      </button>
      {expanded && (
        <div style={{ paddingLeft: '20px', borderLeft: '1px solid #e5e7eb' }}>
          {entries.map(([key, value]) => (
            <div key={key} style={{ marginTop: '2px' }}>
              <span style={{ color: '#7c3aed' }}>{key}</span>:{' '}
              {typeof value === 'object' && value !== null ? (
                <JsonViewer data={value} />
              ) : (
                <span style={{ color: '#059669' }}>{JSON.stringify(value)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
