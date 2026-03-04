import { useState } from 'react';
import DataTable from '../components/DataTable';

interface TemplateRow {
  template_id: string;
  title: string;
  type: string;
  status: string;
  group: string;
  [key: string]: unknown;
}

const GROUPS = [
  { name: 'Group 1 — Product Definition', prefix: ['PRD', 'URD', 'STK', 'DMG', 'RSC', 'RISK', 'BRP', 'SMIP'], count: 38 },
  { name: 'Group 2 — Experience Design', prefix: ['DES', 'IXD', 'CDX', 'DSYS', 'IAN', 'A11YD', 'RLB', 'VAP'], count: 43 },
  { name: 'Group 3 — System Architecture', prefix: ['ARC', 'SIC', 'SBDT', 'PMAD', 'ERR', 'RTM', 'WFO', 'APIG'], count: 52 },
  { name: 'Group 4 — Data & Information', prefix: ['DATA', 'DLR', 'DGL', 'DQV', 'SRCH', 'CACHE', 'RPT'], count: 44 },
  { name: 'Group 5 — Application Build', prefix: ['API', 'JBS', 'EVT', 'RLIM', 'FFCFG', 'PFS', 'FPMP', 'ADMIN', 'FE', 'SMD', 'CPR', 'FORM', 'ROUTE', 'UICP', 'CER', 'CSec', 'MOB', 'MDC', 'OFS', 'MBAT', 'MDL', 'MPUSH', 'SIGN'], count: 131 },
  { name: 'Group 6 — Integrations', prefix: ['IXS', 'SSO', 'CRMERP', 'WHCP', 'PAY', 'NOTIF', 'FMS'], count: 70 },
  { name: 'Group 7 — Security', prefix: ['SEC', 'IAM', 'TMA', 'SKM', 'PRIV', 'AUDIT', 'COMP'], count: 68 },
];

const SAMPLE_TEMPLATES: TemplateRow[] = [
  { template_id: 'PRD-01', title: 'Product Requirements Document', type: 'Product / Requirements', status: 'active', group: 'Group 1' },
  { template_id: 'API-01', title: 'Endpoint Catalog', type: 'Build / API', status: 'active', group: 'Group 5' },
  { template_id: 'IXS-01', title: 'Integration Inventory', type: 'Integration / Core', status: 'active', group: 'Group 6' },
  { template_id: 'SEC-01', title: 'Security Requirements Inventory', type: 'Security / Controls', status: 'active', group: 'Group 7' },
];

export default function Templates() {
  const [filter, setFilter] = useState('');

  const filtered = SAMPLE_TEMPLATES.filter(
    (t) =>
      t.template_id.toLowerCase().includes(filter.toLowerCase()) ||
      t.title.toLowerCase().includes(filter.toLowerCase()) ||
      t.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
        Templates
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        446 templates across 7 groups.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {GROUPS.map((g) => (
          <div
            key={g.name}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{g.count}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{g.name}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', fontFamily: 'monospace' }}>
              {g.prefix.join(', ')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="Filter templates..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <DataTable<TemplateRow>
          columns={[
            { key: 'template_id', header: 'ID', width: '120px', render: (row) => (
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366f1' }}>{row.template_id}</span>
            )},
            { key: 'title', header: 'Title' },
            { key: 'type', header: 'Type', width: '200px' },
            { key: 'group', header: 'Group', width: '100px' },
            { key: 'status', header: 'Status', width: '80px' },
          ]}
          data={filtered}
        />
      </div>
    </div>
  );
}
