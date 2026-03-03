import DataTable from '../components/DataTable';

export default function Commands() {
  const columns = [
    { key: 'action_id', header: 'Action ID', sortable: true },
    { key: 'action_type', header: 'Type', sortable: true },
    { key: 'outcome', header: 'Outcome', sortable: true },
    { key: 'timestamp', header: 'Timestamp', sortable: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
          Commands
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Action history and command log
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          data={[]}
          emptyMessage="No actions recorded yet"
        />
      </div>
    </div>
  );
}
