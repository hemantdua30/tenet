'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  Activity,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import styles from '../machine.module.css';

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const machineId = params.machineId as string;
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading machine details
    setTimeout(() => {
      setMachine({
        id: machineId,
        name: `APU System ${machineId}`,
        status: 'operational',
        lastInspection: '2024-01-10',
        nextInspection: '2024-02-10',
        location: 'Hangar A, Bay 1',
        manufacturer: 'Honeywell',
        model: 'GTCP131-9A',
        serialNumber: 'HT-001-2024',
        operatingHours: 2847,
        healthScore: 87
      });
      setLoading(false);
    }, 1000);
  }, [machineId]);

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
        <p>Loading machine details...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className={styles.errorContainer}>
        <h2>Machine not found</h2>
        <Link href="/dashboard/inspector/machine" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Machines
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.machineDetailPage}>
      <div className={styles.header}>
        <Link href="/dashboard/inspector/machine" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Machines
        </Link>
        <h1>{machine.name}</h1>
        <div className={styles.statusBadge}>
          {getStatusIcon(machine.status)}
          <span>{getStatusText(machine.status)}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.machineInfo}>
          <div className={styles.infoSection}>
            <h3>Basic Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Manufacturer:</label>
                <span>{machine.manufacturer}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Model:</label>
                <span>{machine.model}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Serial Number:</label>
                <span>{machine.serialNumber}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Location:</label>
                <span>{machine.location}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3>Performance Metrics</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Activity size={20} />
                </div>
                <div className={styles.metricContent}>
                  <h4>Operating Hours</h4>
                  <p className={styles.metricValue}>{machine.operatingHours.toLocaleString()} hrs</p>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.metricContent}>
                  <h4>Health Score</h4>
                  <p className={styles.metricValue}>{machine.healthScore}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3>Inspection History</h3>
            <div className={styles.inspectionHistory}>
              <div className={styles.inspectionItem}>
                <Calendar size={16} />
                <div>
                  <p><strong>Last Inspection:</strong> {machine.lastInspection}</p>
                  <p className={styles.inspectionStatus}>Completed</p>
                </div>
              </div>
              <div className={styles.inspectionItem}>
                <Clock size={16} />
                <div>
                  <p><strong>Next Inspection:</strong> {machine.nextInspection}</p>
                  <p className={styles.inspectionStatus}>Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link 
            href={`/dashboard/inspector/machine/${machineId}/inspect`}
            className={styles.primaryButton}
          >
            <Wrench size={16} />
            Start Inspection
          </Link>
          <button className={styles.secondaryButton}>
            <Settings size={16} />
            View Settings
          </button>
        </div>
      </div>
    </div>
  );
}
