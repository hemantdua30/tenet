'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import styles from './machine.module.css';

export default function MachinePage() {
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading machines
    setTimeout(() => {
      setMachines([
        {
          id: 'machine-001',
          name: 'APU System A380-001',
          status: 'operational',
          lastInspection: '2024-01-10',
          nextInspection: '2024-02-10',
          location: 'Hangar A, Bay 1'
        },
        {
          id: 'machine-002',
          name: 'APU System A380-002',
          status: 'maintenance',
          lastInspection: '2024-01-08',
          nextInspection: '2024-01-25',
          location: 'Hangar A, Bay 2'
        },
        {
          id: 'machine-003',
          name: 'APU System B777-001',
          status: 'operational',
          lastInspection: '2024-01-12',
          nextInspection: '2024-02-12',
          location: 'Hangar B, Bay 1'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle size={16} className={styles.statusOperational} />;
      case 'maintenance':
        return <Wrench size={16} className={styles.statusMaintenance} />;
      case 'down':
        return <XCircle size={16} className={styles.statusDown} />;
      default:
        return <AlertTriangle size={16} className={styles.statusUnknown} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'maintenance':
        return 'In Maintenance';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading machines...</p>
      </div>
    );
  }

  return (
    <div className={styles.machinePage}>
      <div className={styles.header}>
        <Link href="/dashboard/inspector" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1>APU Systems</h1>
      </div>

      <div className={styles.machinesGrid}>
        {machines.map((machine) => (
          <div key={machine.id} className={styles.machineCard}>
            <div className={styles.machineHeader}>
              <h3>{machine.name}</h3>
              <div className={styles.statusBadge}>
                {getStatusIcon(machine.status)}
                <span>{getStatusText(machine.status)}</span>
              </div>
            </div>

            <div className={styles.machineInfo}>
              <div className={styles.infoItem}>
                <Calendar size={14} />
                <span>Last Inspection: {machine.lastInspection}</span>
              </div>
              <div className={styles.infoItem}>
                <Clock size={14} />
                <span>Next Inspection: {machine.nextInspection}</span>
              </div>
              <div className={styles.infoItem}>
                <User size={14} />
                <span>{machine.location}</span>
              </div>
            </div>

            <div className={styles.machineActions}>
              <Link 
                href={`/dashboard/inspector/machine/${machine.id}`}
                className={styles.inspectButton}
              >
                View Details
              </Link>
              <Link 
                href={`/dashboard/inspector/machine/${machine.id}/inspect`}
                className={styles.inspectButton}
              >
                Start Inspection
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
