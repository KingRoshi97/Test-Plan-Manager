import { useState, useEffect } from 'react';
import type { Pointer } from '../lib/types';
import JsonViewer from './JsonViewer';
import * as api from '../lib/api';

interface ArtifactDrawerProps {
  pointer: Pointer | null;
  onClose: () => void;
}

export default function ArtifactDrawer({ pointer, onClose }: ArtifactDrawerProps) {
  const [content, setContent] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pointer) {
      setContent(null);
      return;
    }
    setLoading(true);
    setError(null);
    api.readArtifact(pointer.path)
      .then((res) => setContent(res.content))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [pointer?.path]);

  if (!pointer) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'var(--drawer-width)',
        background: 'var(--bg-drawer)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-drawer)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 150ms ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: '12px' }}>📦</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pointer.path}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading…</div>
        )}
        {error && (
          <div style={{ color: 'var(--status-fail)', fontSize: '13px' }}>{error}</div>
        )}
        {!loading && !error && content !== null && (
          <JsonViewer data={content} label={pointer.path.split('/').pop()} />
        )}
      </div>
    </div>
  );
}
