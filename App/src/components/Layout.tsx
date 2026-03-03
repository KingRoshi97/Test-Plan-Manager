import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>◆</span>
          <span className={styles.brandName}>AXION</span>
        </div>
        <Nav />
      </aside>
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.connDot} />
            <span className={styles.connLabel}>Connected</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerHint}>Ctrl+K</span>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
