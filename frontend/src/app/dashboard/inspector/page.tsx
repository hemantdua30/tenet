'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import styles from './inspector.module.css';

export default function InspectorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userRole] = useState('inspector');
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      case 'overdue':
        return styles.statusOverdue;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <XCircle size={16} />;
    }
  };

  return (
    <div className={styles.inspectorDashboard}>
      <div className={styles.header}>
        <h1>Inspector Dashboard</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user?.name || 'Inspector'}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Total Inspections</h3>
              <p className={styles.statNumber}>24</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Completed</h3>
              <p className={styles.statNumber}>18</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Pending</h3>
              <p className={styles.statNumber}>4</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Overdue</h3>
              <p className={styles.statNumber}>2</p>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/dashboard/inspector/schedule')}
            >
              <Calendar size={20} />
              <span>View Schedule</span>
            </button>
            
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/dashboard/inspector/machine')}
            >
              <FileText size={20} />
              <span>Start Inspection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}