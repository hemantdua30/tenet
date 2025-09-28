'use client';

import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Gauge, 
  FileText, 
  AlertTriangle, 
  Layers, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  BarChart2,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  Timestamp,
  // collectionGroup
} from 'firebase/firestore';
import { app } from '@/app/firebase/config';
import styles from './company.module.css';
import { useAuth } from '../../contexts/auth-context';

// Interface definitions
interface Aircraft {
  id: string;
  name: string;
  location: string;
  totalAPUs: number;
  activeAPUs: number;
  maintenanceAPUs: number;
  scheduledAPUs: number;
  downtimeAPUs: number;
  offAPUs: number;
  lastInspectionDate?: Timestamp;
}

interface APUSystem {
  id: string;
  name: string;
  aircraftId: string;
  status: string;
  lastInspection?: Timestamp;
  nextInspection?: Timestamp;
}

interface Inspector {
  id: string;
  name: string;
  email: string;
  userRole: string;
  assignedAircraft: string[];
}

interface APUInspectionReport {
  id: string;
  aircraftId: string;
  aircraftName: string;
  apuId: string;
  apuName: string;
  inspectorId: string;
  inspectorName: string;
  date: Timestamp;
  status: string;
  findings: unknown;
}

interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
  relatedId?: string;
  relatedType?: string;
}

const CompanyDashboard = () => {
  const { user } = useAuth();
  // const router = useRouter();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  // const [apus, setAPUs] = useState<APUSystem[]>([]);
  // const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [reports, setReports] = useState<APUInspectionReport[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ top: string; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 10 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 5}s`
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const db = getFirestore(app);
        
        // Fetch aircraft data from AngularisIndustries collection
        const aircraftCollection = collection(db, 'AngularisIndustries');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        
        const aircraftData: Aircraft[] = [];
        let allAPUs: APUSystem[] = [];
        
        // Process each aircraft document
        for (const aircraftDoc of aircraftSnapshot.docs) {
          const aircraftDataDoc = aircraftDoc.data();
          
          // Get APU systems subcollection for this aircraft
          const apusCollection = collection(db, `AngularisIndustries/${aircraftDoc.id}/machines`);
          const apusSnapshot = await getDocs(apusCollection);
          
          // Process APU systems for this aircraft
          const aircraftAPUs: APUSystem[] = [];
          apusSnapshot.docs.forEach(apuDoc => {
            const apuData = apuDoc.data();
            aircraftAPUs.push({
              id: apuDoc.id,
              name: apuData.name || 'Unnamed APU System',
              aircraftId: aircraftDoc.id,
              status: apuData.status || 'unknown',
              lastInspection: apuData.lastInspection,
              nextInspection: apuData.nextInspection
            });
          });
          
          // Add APUs to all APUs array
          allAPUs = [...allAPUs, ...aircraftAPUs];
          
          // Count APU statuses
          const activeAPUs = aircraftAPUs.filter(a => a.status === 'active').length;
          const maintenanceAPUs = aircraftAPUs.filter(a => a.status === 'maintenance').length;
          const scheduledAPUs = aircraftAPUs.filter(a => a.status === 'scheduled').length;
          const downtimeAPUs = aircraftAPUs.filter(a => a.status === 'downtime').length;
          const offAPUs = aircraftAPUs.filter(a => a.status === 'off').length;
          
          // Add aircraft to aircraft array
          aircraftData.push({
            id: aircraftDoc.id,
            name: aircraftDataDoc.name || 'Unnamed Aircraft',
            location: aircraftDataDoc.location || 'Unknown Location',
            totalAPUs: aircraftAPUs.length,
            activeAPUs,
            maintenanceAPUs,
            scheduledAPUs,
            downtimeAPUs,
            offAPUs,
            lastInspectionDate: aircraftDataDoc.lastInspectionDate
          });
        }
        
        setAircraft(aircraftData);
        // setAPUs(allAPUs);
        
        // Fetch inspectors data (users with inspector role)
        const usersCollection = collection(db, 'users');
        const inspectorsQuery = query(usersCollection, where('role', '==', 'inspector'));
        const inspectorsSnapshot = await getDocs(inspectorsQuery);
        const inspectorsData = inspectorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Inspector[];
        // setInspectors(inspectorsData);
        
        // Fetch recent APU inspection reports
        const reportsCollection = collection(db, 'inspectionReports');
        const reportsQuery = query(reportsCollection, orderBy('timestamp', 'desc'), limit(10));
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as APUInspectionReport[];
        setReports(reportsData);
        
        // Fetch recent activity logs
        const activitiesCollection = collection(db, 'activityLogs');
        const activitiesQuery = query(activitiesCollection, orderBy('timestamp', 'desc'), limit(5));
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityLog[];
        setActivities(activitiesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simple mind map rendering
  useEffect(() => {
    if (!loading && reports.length > 0) {
      renderMindMap();
    }
  }, [loading, reports]);

  function renderMindMap() {
    const canvas = document.getElementById('mindMapCanvas');
    if (!canvas || reports.length === 0) return;

    // This would be replaced with a more sophisticated visualization library
    // For demo, we'll create a simple representation
    const container = canvas as HTMLElement;
    container.innerHTML = '';

    // Create root node
    const rootNode = document.createElement('div');
    rootNode.className = `${styles.nodeContainer}`;
    rootNode.style.top = '200px';
    rootNode.style.left = '50%';
    rootNode.style.transform = 'translate(-50%, -50%)';

    const rootNodeContent = document.createElement('div');
    rootNodeContent.className = `${styles.mapNode} ${styles.rootNode}`;
    rootNodeContent.innerHTML = `
      <div class="${styles.nodeTitle}">Inspection Reports</div>
      <div class="${styles.nodeValue}">${reports.length} reports</div>
    `;
    rootNode.appendChild(rootNodeContent);
    container.appendChild(rootNode);

    // Create first level nodes (aircraft)
    const aircraftIds = [...new Set(reports.map(r => r.aircraftId))];
    aircraftIds.forEach((aircraftId, index) => {
      const aircraftItem = aircraft.find(a => a.id === aircraftId);
      if (!aircraftItem) return;

      const aircraftReports = reports.filter(r => r.aircraftId === aircraftId);
      
      const angle = (index / aircraftIds.length) * 2 * Math.PI;
      const x = 200 * Math.cos(angle) + container.clientWidth / 2;
      const y = 200 * Math.sin(angle) + container.clientHeight / 2;

      // Aircraft node
      const aircraftNode = document.createElement('div');
      aircraftNode.className = `${styles.nodeContainer}`;
      aircraftNode.style.top = `${y}px`;
      aircraftNode.style.left = `${x}px`;
      aircraftNode.style.transform = 'translate(-50%, -50%)';

      const aircraftNodeContent = document.createElement('div');
      aircraftNodeContent.className = `${styles.mapNode} ${styles.childNode}`;
      aircraftNodeContent.innerHTML = `
        <div class="${styles.nodeTitle}">${aircraftItem.name}</div>
        <div class="${styles.nodeValue}">${aircraftReports.length} reports</div>
      `;
      aircraftNode.appendChild(aircraftNodeContent);
      container.appendChild(aircraftNode);

      // Create connection line
      const line = document.createElement('div');
      line.className = styles.nodeLine;
      const dx = x - container.clientWidth / 2;
      const dy = y - container.clientHeight / 2;
      const length = Math.sqrt(dx * dx + dy * dy);
      const lineAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      line.style.width = `${length}px`;
      line.style.left = `${container.clientWidth / 2}px`;
      line.style.top = `${container.clientHeight / 2}px`;
      line.style.transform = `rotate(${lineAngle}deg)`;
      
      container.appendChild(line);

      // Add connector dot
      const connector = document.createElement('div');
      connector.className = styles.nodeConnector;
      connector.style.left = `${container.clientWidth / 2 + dx * 0.3}px`;
      connector.style.top = `${container.clientHeight / 2 + dy * 0.3}px`;
      container.appendChild(connector);

      // Create second level nodes (reports)
      if (aircraftReports.length > 0) {
        aircraftReports.slice(0, 3).forEach((report, rIndex) => {
          const reportAngle = angle + (rIndex - Math.min(aircraftReports.length, 3) / 2 + 0.5) * 0.4;
          const rx = 120 * Math.cos(reportAngle) + x;
          const ry = 120 * Math.sin(reportAngle) + y;

          // Report node
          const reportNode = document.createElement('div');
          reportNode.className = `${styles.nodeContainer}`;
          reportNode.style.top = `${ry}px`;
          reportNode.style.left = `${rx}px`;
          reportNode.style.transform = 'translate(-50%, -50%)';

          const reportNodeContent = document.createElement('div');
          reportNodeContent.className = `${styles.mapNode} ${styles.grandchildNode}`;
          
          // Format date
          let formattedDate = 'No date';
          if (report.date && report.date.toDate) {
            const reportDate = report.date.toDate();
            formattedDate = reportDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          }
          
          // Display findings if available
          let findingsText = 'No details';
          if (report.findings) {
            const criticalCount = report.findings.critical || 0;
            const majorCount = report.findings.major || 0;
            findingsText = `${criticalCount > 0 ? `${criticalCount} critical` : ''} ${majorCount > 0 ? `${criticalCount > 0 ? ', ' : ''}${majorCount} major` : ''}`;
            if (findingsText.trim() === '') findingsText = 'No issues';
          }
          
          reportNodeContent.innerHTML = `
            <div class="${styles.nodeTitle}">${formattedDate}</div>
            <div class="${styles.nodeValue}">${report.apuName || 'APU System'}</div>
            <div class="${styles.nodeValue}">${findingsText}</div>
          `;
          reportNode.appendChild(reportNodeContent);
          container.appendChild(reportNode);

          // Create connection line
          const rLine = document.createElement('div');
          rLine.className = styles.nodeLine;
          const rdx = rx - x;
          const rdy = ry - y;
          const rLength = Math.sqrt(rdx * rdx + rdy * rdy);
          const rLineAngle = Math.atan2(rdy, rdx) * (180 / Math.PI);

          rLine.style.width = `${rLength}px`;
          rLine.style.left = `${x}px`;
          rLine.style.top = `${y}px`;
          rLine.style.transform = `rotate(${rLineAngle}deg)`;
          
          container.appendChild(rLine);
        });
      }
    });
  }

  // Calculate dashboard stats
  // const getTotalAPUs = () => {
  //   return apus.length;
  // };

  const getTotalIssues = () => {
    return aircraft.reduce((total, aircraft) => total + (aircraft.downtimeAPUs || 0), 0);
  };

  const getCompletedInspections = () => {
    return reports.filter(report => report.status === 'completed').length;
  };

  // const getPendingInspections = () => {
  //   // Count APU systems with upcoming inspections
  //   const now = new Date();
  //   const upcomingInspections = apus.filter(apu => {
  //     if (apu.nextInspection && apu.nextInspection.toDate) {
  //       const nextInspectionDate = apu.nextInspection.toDate();
  //       return nextInspectionDate > now;
  //     }
  //     return false;
  //   }).length;
  //   
  //   return upcomingInspections;
  // };

  // const getNextInspectionDate = () => {
  //   const now = new Date();
  //   let nextInspectionDate: Date | null = null;
  //   let daysUntilNext = Infinity;
  //   
  //   apus.forEach(apu => {
  //     if (apu.nextInspection && apu.nextInspection.toDate) {
  //       const inspectionDate = apu.nextInspection.toDate();
  //       if (inspectionDate > now) {
  //         const diffDays = Math.ceil((inspectionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  //         if (diffDays < daysUntilNext) {
  //           daysUntilNext = diffDays;
  //           nextInspectionDate = inspectionDate;
  //         }
  //       }
  //     }
  //   });
  //   
  //   return daysUntilNext < Infinity ? daysUntilNext : null;
  // };

  // const handleSignOut = async () => {
  //   try {
  //     await signOut();
  //     router.push('/signin');
  //   } catch (error) {
  //     console.error('Error signing out:', error);
  //   }
  // };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading dashboard data...</p>
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

  return (
    <div className={styles.companyDashboard}>
      {/* Particles decoration */}
      {particles.map((particle, i) => (
        <div 
          key={i} 
          className={styles.particle}
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration
          }}
        />
      ))}

      {/* Dashboard Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardCompany}>
          <h1 className={styles.companyName}>HoneyWell Aerospace</h1>
          <p className={styles.companyTagline}>Fleet APU Management System</p>
        </div>
        
        <div className={styles.userGreeting}>
          <p className={styles.greeting}>
            Welcome back, <span className={styles.userName}>{user?.name || 'Admin'}</span>
          </p>
          <div className={styles.userRole}>Fleet Operations Manager</div>
        </div>
      </div>

      {/* Content Container */}
      <div className={styles.contentContainer}>
        {/* Quick Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statCardTitle}>Total APU Systems</h3>
              <p className={`${styles.statCardValue} ${styles.primary}`}>{1500}</p>
              <p className={styles.statCardChange}>
                <TrendingUp size={14} /> {1407} operational
              </p>
              <div className={styles.statCardIcon}>
                <Gauge size={24} />
              </div>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statCardTitle}>APU Issues</h3>
              <p className={`${styles.statCardValue} ${styles.warning}`}>{93}</p>
              <p className={`${styles.statCardChange} ${getTotalIssues() > 0 ? styles.negative : styles.positive}`}>
                <TrendingUp size={14} /> 93 APUs down
              </p>
              <div className={styles.statCardIcon}>
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statCardTitle}>Completed Inspections</h3>
              <p className={`${styles.statCardValue} ${styles.success}`}>{getCompletedInspections()}</p>
              <p className={`${styles.statCardChange} ${styles.positive}`}>
                <TrendingUp size={14} /> 17 total reports
              </p>
              <div className={styles.statCardIcon}>
                <CheckCircle size={24} />
              </div>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statCardTitle}>Scheduled Inspections</h3>
              <p className={styles.statCardValue}>{40}</p>
              <p className={styles.statCardChange}>
                <Clock size={14} /> Next in 3 days
              </p>
              <div className={styles.statCardIcon}>
                <Calendar size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft Section */}
        <div className={styles.plantsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Aircraft Fleet</h2>
          </div>

          <div className={styles.plantsGrid}>
            {aircraft.length > 0 ? (
              aircraft.slice(0, 4).map((aircraftItem) => (
                <div key={aircraftItem.id} className={styles.plantCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardImageContainer}>
                      <div className={styles.cardImage}>
                        <Layers size={48} color="#8b5cf6" />
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{aircraftItem.name || 'Unnamed Aircraft'}</h3>
                      <div className={styles.cardLocation}>
                        <MapPin size={14} />
                        {aircraftItem.location || 'No location'}
                      </div>
                      <div className={styles.cardStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {aircraftItem.id === 'EastPlant' ? 350 : 
                             aircraftItem.id === 'WestPlant' ? 500 : 
                             aircraftItem.id === 'SouthPlant' ? 400 : 
                             aircraftItem.id === 'NorthPlant' ? 250 : 0}
                          </span>
                          <span className={styles.statLabel}>APU Systems</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {aircraftItem.id === 'EastPlant' ? 25 : 
                             aircraftItem.id === 'WestPlant' ? 7 : 
                             aircraftItem.id === 'SouthPlant' ? 18 : 
                             aircraftItem.id === 'NorthPlant' ? 43 : 0}
                          </span>
                          <span className={styles.statLabel}>Issues</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noContent}>
                <Layers size={24} />
                <p>No aircraft available</p>
              </div>
            )}
          </div>
        </div>


        {/* Two-column layout for Recent Activity and Mind Map */}
        <div className={styles.columnsContainer}>
          {/* Recent Activity Feed */}
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
            </div>

            <div className={styles.activityFeed}>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityItemIcon}>
                      {activity.type === 'inspection' && <FileText size={18} />}
                      {activity.type === 'maintenance' && <Settings size={18} />}
                      {activity.type === 'issue' && <AlertTriangle size={18} />}
                      {activity.type === 'report' && <BarChart2 size={18} />}
                      {!activity.type && <Activity size={18} />}
                    </div>
                    <div className={styles.activityItemContent}>
                      <h4 className={styles.activityItemTitle}>{activity.title || 'Unnamed Activity'}</h4>
                      <p className={styles.activityItemDesc}>{activity.description || 'No description'}</p>
                      <p className={styles.activityItemTime}>
                        {activity.timestamp?.toDate ? 
                          activity.timestamp.toDate().toLocaleString() : 
                          'Unknown time'} by{' '}
                        <span className={styles.activityItemUser}>{activity.userName || 'Unknown'}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noActivities}>
                  <Activity size={24} />
                  <p>No recent activities to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Mind Map Section */}
          <div className={styles.mindMapSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>APU Inspection Analysis</h2>
              <Link href="/dashboard/company/reports" className={styles.viewAllButton}>
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className={styles.mindMapContainer}>
              <div className={styles.mindMapHeader}>
                <h3 className={styles.mindMapTitle}>APU Reports Mind Map</h3>
                <div className={styles.mindMapControls}>
                  <button className={styles.controlButton}>
                    <BarChart2 size={16} /> Analytics
                  </button>
                  <button className={styles.controlButton}>
                    <Calendar size={16} /> Timeline
                  </button>
                </div>
              </div>
              {reports.length > 0 ? (
                <div id="mindMapCanvas" className={styles.mindMapCanvas}></div>
              ) : (
                <div className={styles.noReports}>
                  <FileText size={24} />
                  <p>No APU inspection reports available to visualize</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard; 