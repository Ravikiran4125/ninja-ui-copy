import React from 'react';
import Sidebar from './sidebar';
import styles from './layout.module.css';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
