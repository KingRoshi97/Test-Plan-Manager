import { Outlet } from 'react-router-dom';
import Nav from './Nav';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Nav />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
