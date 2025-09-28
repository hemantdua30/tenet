'use client';

import React, { useState } from 'react';
import dashboardStyles from '../../dashboard.module.css';
import styles from './page.module.css';

// Define types
interface InspectionStatus {
  upToDate: number;
  upcoming: number;
  overdue: number;
}

interface Aircraft {
  id: string;
  name: string;
  location: string;
  apuCount: number;
  inspectionStatus: InspectionStatus;
  healthScore: number;
  alerts: number;
  lastInspection: string;
}

// Mock aircraft data
const aircraftData: Aircraft[] = [
  {
    id: 'a1',
    name: 'Airbus A380-800',
    location: 'Hangar A, Terminal 1',
    apuCount: 2,
    inspectionStatus: {
      upToDate: 2,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 88,
    alerts: 2,
    lastInspection: '2023-09-18'
  },
  {
    id: 'a2',
    name: 'Boeing 777-300ER',
    location: 'Hangar B, Terminal 2',
    apuCount: 2,
    inspectionStatus: {
      upToDate: 2,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 92,
    alerts: 1,
    lastInspection: '2023-09-15'
  },
  {
    id: 'a3',
    name: 'Airbus A350-900',
    location: 'Hangar C, Terminal 1',
    apuCount: 1,
    inspectionStatus: {
      upToDate: 1,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 74,
    alerts: 6,
    lastInspection: '2023-09-10'
  },
  {
    id: 'a4',
    name: 'Boeing 787-9 Dreamliner',
    location: 'Hangar D, Terminal 2',
    apuCount: 1,
    inspectionStatus: {
      upToDate: 1,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 85,
    alerts: 3,
    lastInspection: '2023-09-12'
  },
  {
    id: 'a5',
    name: 'Airbus A320neo',
    location: 'Hangar E, Terminal 3',
    apuCount: 1,
    inspectionStatus: {
      upToDate: 1,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 96,
    alerts: 0,
    lastInspection: '2023-09-20'
  },
  {
    id: 'a6',
    name: 'Boeing 737 MAX 8',
    location: 'Hangar F, Terminal 3',
    apuCount: 1,
    inspectionStatus: {
      upToDate: 1,
      upcoming: 0,
      overdue: 0
    },
    healthScore: 82,
    alerts: 2,
    lastInspection: '2023-09-14'
  }
];

const AircraftPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'apus' | 'alerts'>('name');
  
  // Filter and sort aircraft
  const filteredAircraft = aircraftData
    .filter(aircraft => 
      aircraft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aircraft.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'apus') return b.apuCount - a.apuCount;
      if (sortBy === 'alerts') return b.alerts - a.alerts;
      return 0;
    });

  // Get health status indicator
  const getHealthIndicator = (score: number) => {
    if (score >= 90) return { class: styles.indicatorHealthy, label: 'Excellent' };
    if (score >= 80) return { class: styles.indicatorGood, label: 'Good' };
    if (score >= 70) return { class: styles.indicatorWarning, label: 'Fair' };
    return { class: styles.indicatorCritical, label: 'Poor' };
  };

  return (
    <div className={styles.facilitiesContainer}>
      <div className={dashboardStyles.dashboardHeader}>
        <h1 className={dashboardStyles.dashboardTitle}>Fleet Aircraft</h1>
        <div className={dashboardStyles.userProfile}>
          <div className={dashboardStyles.userAvatar}>
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Profile" />
          </div>
          <div className={dashboardStyles.userInfo}>
            <div className={dashboardStyles.userName}>Sarah Johnson</div>
            <div className={dashboardStyles.userRole}>Fleet Operations Manager</div>
          </div>
        </div>
      </div>

      <div className={styles.topControls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search aircraft..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className={styles.controlsRight}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'health' | 'apus' | 'alerts')}
            className={styles.filterSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="health">Sort by Health Score</option>
            <option value="apus">Sort by APU Count</option>
            <option value="alerts">Sort by Alerts</option>
          </select>
          
          <button className={`${styles.button} ${styles.primaryButton}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Aircraft
          </button>
        </div>
      </div>

      <div className={styles.facilitiesOverview}>
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className={styles.overviewValue}>{aircraftData.length}</div>
            <div className={styles.overviewLabel}>Total Aircraft</div>
          </div>
        </div>
        
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <div className={styles.overviewValue}>
              {aircraftData.reduce((sum, aircraft) => sum + aircraft.apuCount, 0)}
            </div>
            <div className={styles.overviewLabel}>Total APU Systems</div>
          </div>
        </div>
        
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className={styles.overviewValue}>
              {aircraftData.reduce((sum, aircraft) => sum + aircraft.alerts, 0)}
            </div>
            <div className={styles.overviewLabel}>Active Alerts</div>
          </div>
        </div>
        
        <div className={styles.overviewCard}>
          <div className={styles.overviewIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className={styles.overviewValue}>
              {Math.round(
                aircraftData.reduce((sum, aircraft) => sum + aircraft.healthScore, 0) / 
                aircraftData.length
              )}%
            </div>
            <div className={styles.overviewLabel}>Avg Health Score</div>
          </div>
        </div>
      </div>

      <div className={styles.facilitiesContainer}>
        {filteredAircraft.length === 0 ? (
          <div className={styles.noResults}>
            No aircraft found matching your criteria
          </div>
        ) : (
          filteredAircraft.map(aircraft => {
            const healthStatus = getHealthIndicator(aircraft.healthScore);
            
            return (
              <div key={aircraft.id} className={styles.facilityCard}>
                <div className={styles.facilityHeader}>
                  <h3 className={styles.facilityName}>{aircraft.name}</h3>
                  <div className={`${styles.healthIndicator} ${healthStatus.class}`}>
                    {aircraft.healthScore}% · {healthStatus.label}
                  </div>
                </div>
                
                <div className={styles.facilityLocation}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {aircraft.location}
                </div>
                
                <div className={styles.facilityCounts}>
                  <div className={styles.countItem}>
                    <div className={styles.countValue}>{aircraft.apuCount}</div>
                    <div className={styles.countLabel}>APU Systems</div>
                  </div>
                  
                  <div className={styles.countItem}>
                    <div className={styles.countValue}>{aircraft.alerts}</div>
                    <div className={styles.countLabel}>Alerts</div>
                  </div>
                  
                  <div className={styles.countItem}>
                    <div className={styles.countValue}>{aircraft.inspectionStatus.overdue}</div>
                    <div className={styles.countLabel}>Overdue</div>
                  </div>
                </div>
                
                <div className={styles.inspectionStatusBar}>
                  <div 
                    className={styles.statusSegment} 
                    style={{ 
                      flex: aircraft.inspectionStatus.upToDate, 
                      backgroundColor: '#10b981' 
                    }} 
                    title={`${aircraft.inspectionStatus.upToDate} APU systems up to date`}
                  ></div>
                  <div 
                    className={styles.statusSegment} 
                    style={{ 
                      flex: aircraft.inspectionStatus.upcoming, 
                      backgroundColor: '#f59e0b' 
                    }}
                    title={`${aircraft.inspectionStatus.upcoming} inspections upcoming`}
                  ></div>
                  <div 
                    className={styles.statusSegment} 
                    style={{ 
                      flex: aircraft.inspectionStatus.overdue, 
                      backgroundColor: '#ef4444' 
                    }}
                    title={`${aircraft.inspectionStatus.overdue} inspections overdue`}
                  ></div>
                </div>
                
                <div className={styles.facilityFooter}>
                  <div className={styles.lastInspection}>
                    Last inspection: {new Date(aircraft.lastInspection).toLocaleDateString()}
                  </div>
                  
                  <div className={styles.facilityActions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`}>
                      Details
                    </button>
                    <button className={`${styles.button} ${styles.primaryButton}`}>
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AircraftPage; 