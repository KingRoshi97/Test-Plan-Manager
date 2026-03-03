import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../lib/paths';

export default function Nav() {
  return (
    <nav
      style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: '#111827',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '0 20px 24px',
          borderBottom: '1px solid #1f2937',
          marginBottom: '16px',
        }}
      >
        <h1 style={{ color: '#f9fafb', fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Axion
        </h1>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>Internal UI</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 20px',
                color: isActive ? '#818cf8' : '#d1d5db',
                backgroundColor: isActive ? '#1e1b4b' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
