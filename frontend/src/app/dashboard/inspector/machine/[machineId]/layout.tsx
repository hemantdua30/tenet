'use client';

import React from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import RoleBasedRoute from '../../../../components/RoleBasedRoute';

interface MachineLayoutProps {
  children: React.ReactNode;
}

export default function MachineLayout({ children }: MachineLayoutProps) {
  const { user } = useAuth();

  return (
    <RoleBasedRoute allowedRoles={['inspector', 'admin']} redirectTo="/dashboard">
      <div>
        {children}
      </div>
    </RoleBasedRoute>
  );
}
