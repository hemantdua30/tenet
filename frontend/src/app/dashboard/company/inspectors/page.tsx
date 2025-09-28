'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Users, 
  Calendar, 
  Layers,
  CheckCircle,
  Search,
  Mail,
  Clock,
  Shield,
  Award,
  AlertTriangle,
  Star
} from 'lucide-react';
import styles from './page.module.css';
import { useAuth } from '../../../contexts/auth-context';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  getFirestore,
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { app } from '../../../firebase/config';

// Interfaces
interface Inspector {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedPlants?: string[];
  completedInspections?: number;
  pendingInspections?: number;
  lastActive?: Timestamp;
  performance?: number;
}

interface Plant {
  id: string;
  name: string;
  location: string;
}

interface InspectionReport {
  id: string;
  inspectorId: string;
  plantId: string;
  status: string;
  date: Timestamp;
}

const CompanyInspectorsPage = () => {
  // const { user } = useAuth();
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [filteredInspectors, setFilteredInspectors] = useState<Inspector[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  // const [reports, setReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore(app);
        
        // Fetch plants
        const plantsCollection = collection(db, 'AngularisIndustries');
        const plantsSnapshot = await getDocs(plantsCollection);
        
        const plantsData = plantsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Plant',
          location: doc.data().location || 'Unknown Location'
        }));
        
        setPlants(plantsData);
        
        // Fetch inspectors (users with inspector role)
        const usersCollection = collection(db, 'users');
        const inspectorsQuery = query(usersCollection, where('role', '==', 'inspector'));
        const inspectorsSnapshot = await getDocs(inspectorsQuery);
        
        // Fetch inspection reports for calculating stats
        const reportsCollection = collection(db, 'inspectionReports');
        const reportsQuery = query(reportsCollection, orderBy('date', 'desc'));
        const reportsSnapshot = await getDocs(reportsQuery);
        
        const reportsData = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            inspectorId: data.inspectorId,
            plantId: data.plantId,
            status: data.status,
            date: data.date
          };
        });
        
        setReports(reportsData);
        
        // Process inspector data with calculated metrics
        const inspectorsData = inspectorsSnapshot.docs.map(doc => {
          const inspectorId = doc.id;
          const data = doc.data();
          
          // Calculate completed and pending inspections
          const inspectorReports = reportsData.filter(r => r.inspectorId === inspectorId);
          const completedInspections = inspectorReports.filter(r => r.status === 'completed').length;
          const pendingInspections = inspectorReports.filter(r => r.status === 'pending').length;
          
          // Calculate performance (simplified example)
          // In a real system, this would be a more complex calculation
          const performance = inspectorReports.length > 0 
            ? Math.round((completedInspections / inspectorReports.length) * 100) 
            : 0;
          
          // Find last active timestamp
          const latestReport = inspectorReports.length > 0 
            ? inspectorReports.reduce((latest, current) => 
                latest.date && current.date && current.date.toMillis() > latest.date.toMillis() 
                  ? current 
                  : latest, 
                inspectorReports[0])
            : null;
          
          return {
            id: inspectorId,
            name: data.name || 'Unknown',
            email: data.email || 'No email',
            role: data.role || 'Inspector',
            assignedPlants: data.assignedPlants || [],
            completedInspections,
            pendingInspections,
            lastActive: latestReport?.date,
            performance
          };
        });
        
        setInspectors(inspectorsData);
        setFilteredInspectors(inspectorsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load inspectors data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter and sort inspectors
  useEffect(() => {
    let results = inspectors;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        inspector => 
          inspector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inspector.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (selectedRole !== 'all') {
      results = results.filter(inspector => inspector.role === selectedRole);
    }
    
    // Filter by assigned plant
    if (selectedPlant !== 'all') {
      results = results.filter(inspector => 
        inspector.assignedPlants?.includes(selectedPlant)
      );
    }
    
    // Sort results
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          return (b.performance || 0) - (a.performance || 0);
        case 'completed':
          return (b.completedInspections || 0) - (a.completedInspections || 0);
        case 'pending':
          return (b.pendingInspections || 0) - (a.pendingInspections || 0);
        default:
          return 0;
      }
    });
    
    setFilteredInspectors(results);
  }, [searchTerm, selectedRole, selectedPlant, sortBy, inspectors]);

  // Get unique roles for filter
  const getUniqueRoles = () => {
    const roles = inspectors.map(inspector => inspector.role);
    return [...new Set(roles)];
  };

  // Get inspector statistics
  const getInspectorStats = () => {
    const totalInspections = inspectors.reduce(
      (sum, inspector) => sum + (inspector.completedInspections || 0), 
      0
    );
    
    const pendingInspections = inspectors.reduce(
      (sum, inspector) => sum + (inspector.pendingInspections || 0), 
      0
    );
    
    const avgPerformance = inspectors.length > 0 
      ? Math.round(inspectors.reduce((sum, inspector) => sum + (inspector.performance || 0), 0) / inspectors.length)
      : 0;
      
    return {
      totalInspectors: inspectors.length,
      totalInspections,
      pendingInspections,
      avgPerformance
    };
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

  // Get performance class based on value
  const getPerformanceClass = (performance: number) => {
    if (performance >= 80) return 'high';
    if (performance >= 50) return 'medium';
    return 'low';
  };

  // Get plant name by ID
  const getPlantName = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    return plant ? plant.name : 'Unknown Plant';
  };

  // Get role-based icon
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'senior inspector':
        return <Shield size={16} className={styles.roleIcon} />;
      case 'lead inspector':
        return <Award size={16} className={styles.roleIcon} />;
      default:
        return <User size={16} className={styles.roleIcon} />;
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const stats = getInspectorStats();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading inspectors data...</p>
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
    <div className={styles.inspectorsPage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/dashboard/company" className={styles.backButton}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageIcon}><Users size={24} /></span>
            Inspector Team
          </h1>
        </div>
        
        <div className={styles.filterControls}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search inspectors..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className={styles.filterDropdown}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          
          <select
            className={styles.filterDropdown}
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
          >
            <option value="all">All Plants</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>{plant.name}</option>
            ))}
          </select>
          
          <select
            className={styles.filterDropdown}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="performance">Sort by Performance</option>
            <option value="completed">Sort by Completed</option>
            <option value="pending">Sort by Pending</option>
          </select>
        </div>
      </header>

      {/* Statistics Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Team Size</h3>
          <p className={`${styles.statCardValue} ${styles.primary}`}>{stats.totalInspectors}</p>
          <div className={styles.statCardIcon}>
            <Users size={24} />
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Inspections Completed</h3>
          <p className={`${styles.statCardValue} ${styles.success}`}>{stats.totalInspections}</p>
          <div className={styles.statCardIcon}>
            <CheckCircle size={24} />
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Pending Inspections</h3>
          <p className={`${styles.statCardValue} ${styles.warning}`}>{stats.pendingInspections}</p>
          <div className={styles.statCardIcon}>
            <Calendar size={24} />
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Team Performance</h3>
          <p className={`${styles.statCardValue} ${styles[getPerformanceClass(stats.avgPerformance)]}`}>{stats.avgPerformance}%</p>
          <div className={styles.statCardIcon}>
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* Inspectors Grid */}
      {filteredInspectors.length > 0 ? (
        <div className={styles.inspectorsList}>
          {filteredInspectors.map(inspector => (
            <Link href={`/dashboard/company/inspectors/${inspector.id}`} key={inspector.id} className={styles.inspectorCard}>
              <div className={styles.inspectorHeader}>
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarFallback} style={{
                    background: `linear-gradient(135deg, 
                      hsl(${inspector.name.charCodeAt(0) % 360}, 70%, 40%), 
                      hsl(${(inspector.name.charCodeAt(0) + 120) % 360}, 70%, 50%))`
                  }}>
                    {getInitials(inspector.name)}
                  </div>
                </div>
                
                <div className={styles.inspectorInfo}>
                  <h2 className={styles.inspectorName}>{inspector.name}</h2>
                  <p className={styles.inspectorRole}>
                    {getRoleIcon(inspector.role)}
                    {inspector.role}
                  </p>
                  <div className={styles.inspectorEmail}>
                    <Mail size={14} />
                    {inspector.email}
                  </div>
                </div>
                
                <div className={styles.performanceBadge} style={{ 
                  backgroundColor: inspector.performance && inspector.performance >= 80 ? 'rgba(16, 185, 129, 0.15)' : 
                                   inspector.performance && inspector.performance >= 50 ? 'rgba(245, 158, 11, 0.15)' : 
                                   'rgba(239, 68, 68, 0.15)',
                  color: inspector.performance && inspector.performance >= 80 ? 'var(--success)' : 
                         inspector.performance && inspector.performance >= 50 ? 'var(--warning)' : 
                         'var(--danger)'
                }}>
                  {inspector.performance || 0}%
                </div>
              </div>
              
              <div className={styles.inspectorBody}>
                <div className={styles.performanceContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${styles[getPerformanceClass(inspector.performance || 0)]}`}
                      style={{ width: `${inspector.performance || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={styles.inspectionStats}>
                  <div className={styles.statItem}>
                    <div className={styles.iconStat}>
                      <CheckCircle size={16} className={styles.statIcon} />
                      <span className={styles.statLabel}>Completed</span>
                    </div>
                    <span className={`${styles.statValue} ${styles.primary}`}>{inspector.completedInspections || 0}</span>
                  </div>
                  
                  <div className={styles.statItem}>
                    <div className={styles.iconStat}>
                      <Clock size={16} className={styles.statIcon} />
                      <span className={styles.statLabel}>Pending</span>
                    </div>
                    <span className={styles.statValue}>{inspector.pendingInspections || 0}</span>
                  </div>
                </div>
                
                {inspector.assignedPlants && inspector.assignedPlants.length > 0 && (
                  <div className={styles.assignedPlantsSection}>
                    <div className={styles.sectionLabel}>Assigned to {inspector.assignedPlants.length} plant{inspector.assignedPlants.length !== 1 ? 's' : ''}</div>
                    <div className={styles.plantsContainer}>
                      {inspector.assignedPlants.slice(0, 3).map(plantId => (
                        <div key={plantId} className={styles.plantBadge}>
                          <Layers size={12} />
                          {getPlantName(plantId)}
                        </div>
                      ))}
                      {inspector.assignedPlants.length > 3 && (
                        <div className={styles.plantBadge}>
                          +{inspector.assignedPlants.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.inspectorFooter}>
                <div className={styles.lastActive}>
                  <Clock size={14} className={styles.footerIcon} />
                  <span>Active: {formatDate(inspector.lastActive)}</span>
                </div>
                <div className={styles.viewProfileButton}>
                  View Profile <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.noContent}>
          <Users size={32} />
          <p>No inspectors found matching the criteria</p>
          <button 
            className={styles.resetButton}
            onClick={() => {
              setSearchTerm('');
              setSelectedRole('all');
              setSelectedPlant('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyInspectorsPage; 