import { NavLink } from 'react-router-dom';
import { ROUTES } from '../lib/paths';
import styles from './Nav.module.css';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { icon: '⌂', label: 'Dashboard', path: ROUTES.DASHBOARD },
      { icon: '▶', label: 'Runs', path: ROUTES.RUNS },
      { icon: '⌘', label: 'Commands', path: ROUTES.COMMANDS },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { icon: '☰', label: 'Registries', path: ROUTES.REGISTRIES },
      { icon: '◎', label: 'Knowledge', path: ROUTES.KNOWLEDGE },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: '⚙', label: 'Settings', path: ROUTES.SETTINGS },
    ],
  },
];

export default function Nav() {
  return (
    <nav className={styles.nav}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className={styles.section}>
          <div className={styles.sectionLabel}>{section.label}</div>
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
