import Link from 'next/link';
import styles from './sidebar.module.css';

const nav = [
  { label: 'Overview', href: '/docs/overview' },
  { label: 'Orchestration', href: '/docs/orchestration' },
  { label: 'Shinobi', href: '/docs/shinobi' },
  { label: 'Kata', href: '/docs/kata' },
  { label: 'Shuriken', href: '/docs/shuriken' },
  { label: 'Utils', href: '/docs/utils' },
];

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sectionTitle} style={{marginBottom: 24, fontSize: 18}}>Documentation</div>
      <ul className={styles.list}>
        {nav.map(item => (
          <li key={item.href} className={styles.item}>
            <Link className={styles.link} href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
