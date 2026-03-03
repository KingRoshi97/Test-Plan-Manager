import { useState } from 'react';

interface IdPillProps {
  id: string;
  truncate?: number;
}

export default function IdPill({ id, truncate }: IdPillProps) {
  const [copied, setCopied] = useState(false);

  const display = truncate && id.length > truncate
    ? id.slice(0, truncate) + '…'
    : id;

  const handleClick = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <span
      onClick={handleClick}
      title={copied ? 'Copied!' : `Click to copy: ${id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: copied ? 'var(--accent-emerald)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'color var(--transition-fast)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {display}
    </span>
  );
}
