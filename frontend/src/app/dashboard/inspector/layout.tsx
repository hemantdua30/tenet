'use client';

import React from 'react';
import { useAuth } from '../../contexts/auth-context';
import RoleBasedRoute from '../../components/RoleBasedRoute';
import styles from './inspector.module.css';

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default function InspectorLayout({ children }: InspectorLayoutProps) {
  const { user } = useAuth();

  return (
    <RoleBasedRoute allowedRoles={['inspector', 'admin']} redirectTo="/dashboard">
      <div className={styles.inspectorLayout}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </RoleBasedRoute>
  );
}
