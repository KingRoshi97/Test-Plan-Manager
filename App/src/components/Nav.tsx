import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../lib/paths';

export default function Nav() {
  return (
    <nav>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
