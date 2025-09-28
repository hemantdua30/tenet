'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import styles from './dashboard.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userDisplay = user?.name || user?.email || 'User';

  const handleSignOut = async () => {
    // Sign out logic here
    console.log('Signing out...');
  };

  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.content} style={{ width: '100vw' }}>
        {children}
      </div>
    </div>
  );
}
