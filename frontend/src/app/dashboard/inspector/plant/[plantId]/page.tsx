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
import styles from './plant.module.css';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plantId = params.plantId as string;
  const [plant, setPlant] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading plant details
    setTimeout(() => {
      setPlant({
        id: plantId,
        name: `Aircraft ${plantId}`,
        status: 'operational',
        location: 'Hangar A',
        type: 'Airbus A380',
        capacity: 350
      });
      
      setMachines([
        {
          id: 'machine-001',
          name: 'APU System A380-001',
          status: 'operational',
          lastInspection: '2024-01-10',
          nextInspection: '2024-02-10'
        },
        {
          id: 'machine-002',
          name: 'APU System A380-002',
          status: 'maintenance',
          lastInspection: '2024-01-08',
          nextInspection: '2024-01-25'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [plantId]);

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
        <p>Loading plant details...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className={styles.errorContainer}>
        <h2>Plant not found</h2>
        <Link href="/dashboard/inspector" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.plantDetailPage}>
      <div className={styles.header}>
        <Link href="/dashboard/inspector" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1>{plant.name}</h1>
        <div className={styles.statusBadge}>
          {getStatusIcon(plant.status)}
          <span>{getStatusText(plant.status)}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.plantInfo}>
          <div className={styles.infoSection}>
            <h3>Plant Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Type:</label>
                <span>{plant.type}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Location:</label>
                <span>{plant.location}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Capacity:</label>
                <span>{plant.capacity} APU Systems</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.machinesSection}>
          <h3>APU Systems</h3>
          <div className={styles.machinesGrid}>
            {machines.map((machine) => (
              <div key={machine.id} className={styles.machineCard}>
                <div className={styles.machineHeader}>
                  <h4>{machine.name}</h4>
                  <div className={styles.statusBadge}>
                    {getStatusIcon(machine.status)}
                    <span>{getStatusText(machine.status)}</span>
                  </div>
                </div>
                
                <div className={styles.machineInfo}>
                  <div className={styles.infoItem}>
                    <Calendar size={14} />
                    <span>Last: {machine.lastInspection}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Clock size={14} />
                    <span>Next: {machine.nextInspection}</span>
                  </div>
                </div>

                <div className={styles.machineActions}>
                  <Link 
                    href={`/dashboard/inspector/machine/${machine.id}`}
                    className={styles.inspectButton}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
