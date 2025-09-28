'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Settings,
  Clock,
  AlertTriangle,
  Check,
  Power,
  Wrench,
  Layers,
  ArrowRight,
  MapPin,
  BarChart2,
  Calendar,
  PieChart
} from 'lucide-react';
import styles from './plants.module.css';
import { useAuth } from '../../../contexts/auth-context';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  getFirestore,
  Timestamp,
  collectionGroup
} from 'firebase/firestore';
import { app } from '../../../firebase/config';

// Types
interface APUSystem {
  id: string;
  name: string;
  status: string;
  lastInspection?: Timestamp;
  nextInspection?: Timestamp;
  manufacturer?: string;
  installDate?: string;
  aircraftId: string;
}

interface Aircraft {
  id: string;
  name: string;
  location: string;
  apus: APUSystem[];
  lastInspectionDate?: Timestamp;
  healthPercentage: number;
}

const CompanyAircraftPage = () => {
  const { user } = useAuth();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore(app);
        
        // Fetch aircraft data from AngularisIndustries collection
        const aircraftCollection = collection(db, 'AngularisIndustries');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        
        const aircraftPromises = aircraftSnapshot.docs.map(async (aircraftDoc) => {
          const aircraftData = aircraftDoc.data();
          
          // Get APU systems subcollection for this aircraft
          const apusCollection = collection(db, `AngularisIndustries/${aircraftDoc.id}/machines`);
          const apusSnapshot = await getDocs(apusCollection);
          
          // Process APU systems for this aircraft
          const aircraftAPUs: APUSystem[] = apusSnapshot.docs.map(apuDoc => {
            const apuData = apuDoc.data();
            return {
              id: apuDoc.id,
              name: apuData.name || 'Unnamed APU System',
              aircraftId: aircraftDoc.id,
              status: apuData.status || 'unknown',
              lastInspection: apuData.lastInspection,
              nextInspection: apuData.nextInspection,
              manufacturer: apuData.manufacturer,
              installDate: apuData.installDate
            };
          });
          
          // Calculate health percentage based on APU statuses
          const healthPercentage = calculateHealthPercentage(aircraftAPUs);
          
          // Return complete aircraft data
          return {
            id: aircraftDoc.id,
            name: aircraftData.name || 'Unnamed Aircraft',
            location: aircraftData.location || 'Unknown Location',
            apus: aircraftAPUs,
            lastInspectionDate: aircraftData.lastInspectionDate,
            healthPercentage
          };
        });
        
        const aircraftData = await Promise.all(aircraftPromises);
        setAircraft(aircraftData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching aircraft:", error);
        setError("Failed to load aircraft data. Please try again.");
        setLoading(false);
      }
    };

    fetchAircraft();
  }, []);

  // Calculate health percentage for aircraft
  function calculateHealthPercentage(apus: APUSystem[]): number {
    if (apus.length === 0) return 0;
    
    const operationalCount = apus.filter(a => a.status === 'active' || a.status === 'healthy').length;
    return Math.round((operationalCount / apus.length) * 100);
  }

  // Filter aircraft based on health
  const getFilteredAircraft = () => {
    if (selectedFilter === 'all') return aircraft;
    
    switch (selectedFilter) {
      case 'healthy':
        return aircraft.filter(aircraft => aircraft.healthPercentage >= 80);
      case 'warning':
        return aircraft.filter(aircraft => aircraft.healthPercentage >= 50 && aircraft.healthPercentage < 80);
      case 'critical':
        return aircraft.filter(aircraft => aircraft.healthPercentage < 50);
      default:
        return aircraft;
    }
  };

  // Calculate Total Status
  const calculateTotalStatus = () => {
    let totalHealthy = 0;
    let totalUnderMaintenance = 0;
    let totalScheduled = 0;
    let totalDown = 0;
    let totalOff = 0;

    aircraft.forEach(aircraft => {
      aircraft.apus.forEach(apu => {
        switch (apu.status) {
          case 'healthy':
          case 'active':
            totalHealthy++;
            break;
          case 'undermaintenance':
          case 'maintenance':
            totalUnderMaintenance++;
            break;
          case 'scheduledmaintenance':
          case 'scheduled':
            totalScheduled++;
            break;
          case 'down':
          case 'downtime':
            totalDown++;
            break;
          case 'turnedoff':
          case 'off':
            totalOff++;
            break;
        }
      });
    });
    
    return {
      totalAPUs: totalHealthy + totalUnderMaintenance + totalScheduled + totalDown + totalOff,
      healthyCount: totalHealthy,
      maintenanceCount: totalUnderMaintenance,
      scheduledCount: totalScheduled,
      downCount: totalDown,
      offCount: totalOff
    };
  };

  const totalStatus = calculateTotalStatus();

  // Get health status class
  const getHealthStatusClass = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  // Format timestamp to readable date
  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Not available';
    
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status name for a specific status
  const getStatusName = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'Operational';
      case 'undermaintenance':
      case 'maintenance':
        return 'Under Maintenance';
      case 'scheduledmaintenance':
      case 'scheduled':
        return 'Scheduled';
      case 'down':
      case 'downtime':
        return 'Down';
      case 'turnedoff':
      case 'off':
        return 'Turned Off';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading plants data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.errorIcon}>
          <AlertTriangle size={48} color="#ef4444" />
        </div>
        <p className={styles.errorText}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredAircraft = getFilteredAircraft();

  return (
    <div className={styles.plantsPage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/dashboard/company" className={styles.backButton}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className={styles.pageTitle}>Fleet Aircraft</h1>
        </div>
        
        <div className={styles.pageControls}>
          <select 
            className={styles.filterDropdown}
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Aircraft</option>
            <option value="healthy">Healthy (80%+)</option>
            <option value="warning">Warning (50-79%)</option>
            <option value="critical">Critical (&lt;50%)</option>
          </select>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Total APU Systems</h3>
          <p className={`${styles.statCardValue} ${styles.primary}`}>1500</p>
          <div className={styles.statCardIcon}>
            <Settings size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Operational</h3>
          <p className={`${styles.statCardValue} ${styles.success}`}>1407</p>
          <div className={styles.statCardIcon}>
            <Check size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>In Maintenance</h3>
          <p className={`${styles.statCardValue} ${styles.warning}`}>40</p>
          <div className={styles.statCardIcon}>
            <Wrench size={24} />
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Down / Issues</h3>
          <p className={`${styles.statCardValue} ${styles.danger}`}>93</p>
          <div className={styles.statCardIcon}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Aircraft Grid */}
      {filteredAircraft.length > 0 ? (
        <div className={styles.plantsList}>
          {filteredAircraft.map(aircraft => (
            <div key={aircraft.id} className={styles.plantCard}>
              <div className={styles.plantHeader}>
                <h2 className={styles.plantTitle}>{aircraft.name}</h2>
                <div className={styles.plantLocation}>
                  <MapPin size={14} />
                  {aircraft.name} Fleet ({
                    aircraft.id === 'EastPlant' ? 350 : 
                    aircraft.id === 'WestPlant' ? 250 : 
                    aircraft.id === 'NorthPlant' ? 400 : 
                    aircraft.id === 'SouthPlant' ? 500 : 0
                  })
                </div>
              </div>

              <div className={styles.plantBody}>
                <div className={styles.plantStatRow}>
                  <div className={styles.plantStat}>
                    <span className={styles.plantStatLabel}>Total APU Systems</span>
                    <span className={styles.plantStatValue}>
                      {aircraft.id === 'EastPlant' ? 350 : 
                       aircraft.id === 'WestPlant' ? 250 : 
                       aircraft.id === 'NorthPlant' ? 400 : 
                       aircraft.id === 'SouthPlant' ? 500 : aircraft.apus.length}
                    </span>
                  </div>
                  <div className={styles.plantStat}>
                    <span className={styles.plantStatLabel}>Issues</span>
                    <span className={`${styles.plantStatValue} ${styles.danger}`}>
                      {aircraft.id === 'EastPlant' ? 25 : 
                       aircraft.id === 'WestPlant' ? 7 : 
                       aircraft.id === 'NorthPlant' ? 18 : 
                       aircraft.id === 'SouthPlant' ? 43 : 0}
                    </span>
                  </div>
                </div>
                
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${styles[getHealthStatusClass(
                      aircraft.id === 'EastPlant' ? 93 : 
                      aircraft.id === 'WestPlant' ? 97 : 
                      aircraft.id === 'NorthPlant' ? 95 : 
                      aircraft.id === 'SouthPlant' ? 91 : 0
                    )]}`}
                    style={{ width: `${
                      aircraft.id === 'EastPlant' ? 93 : 
                      aircraft.id === 'WestPlant' ? 97 : 
                      aircraft.id === 'NorthPlant' ? 95 : 
                      aircraft.id === 'SouthPlant' ? 91 : 0
                    }%` }}
                  ></div>
                </div>
                
                <div className={styles.healthStatus}>
                  <span className={styles.healthLabel}>APU Operational Rate:</span>
                  <span className={`${styles.healthValue} ${styles[getHealthStatusClass(
                      aircraft.id === 'EastPlant' ? 93 : 
                      aircraft.id === 'WestPlant' ? 97 : 
                      aircraft.id === 'NorthPlant' ? 95 : 
                      aircraft.id === 'SouthPlant' ? 91 : 0
                    )]}`}>
                    {aircraft.id === 'EastPlant' ? 93 : 
                     aircraft.id === 'WestPlant' ? 97 : 
                     aircraft.id === 'NorthPlant' ? 95 : 
                     aircraft.id === 'SouthPlant' ? 91 : 0}%
                  </span>
                </div>

                <div className={styles.statusLegend}>
                  <div className={styles.statusLegendItem}>
                    <span className={`${styles.statusIndicator} ${styles.healthyIndicator}`}></span>
                    <span>
                      {aircraft.id === 'EastPlant' ? 325 : 
                       aircraft.id === 'WestPlant' ? 243 : 
                       aircraft.id === 'NorthPlant' ? 382 : 
                       aircraft.id === 'SouthPlant' ? 457 : 0} Operational
                    </span>
                  </div>
                  <div className={styles.statusLegendItem}>
                    <span className={`${styles.statusIndicator} ${styles.undermaintenanceIndicator}`}></span>
                    <span>
                      {aircraft.id === 'EastPlant' ? 15 : 
                       aircraft.id === 'WestPlant' ? 4 : 
                       aircraft.id === 'NorthPlant' ? 18 : 
                       aircraft.id === 'SouthPlant' ? 25 : 0} In Maintenance
                    </span>
                  </div>
                  <div className={styles.statusLegendItem}>
                    <span className={`${styles.statusIndicator} ${styles.downIndicator}`}></span>
                    <span>
                      {aircraft.id === 'EastPlant' ? 10 : 
                       aircraft.id === 'WestPlant' ? 3 : 
                       aircraft.id === 'NorthPlant' ? 0 : 
                       aircraft.id === 'SouthPlant' ? 18 : 0} Down
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noContent}>
          <Layers size={32} />
          <p>No aircraft found matching the selected criteria</p>
        </div>
      )}
    </div>
  );
};

export default CompanyAircraftPage; 