'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to company dashboard by default
    router.push('/dashboard/company');
  }, [router]);

  return (
    <div>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
