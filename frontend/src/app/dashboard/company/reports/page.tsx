'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  MapPin, 
  User,
  Wrench,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  Plane
} from 'lucide-react';
import styles from './reports.module.css';

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aircraftFilter, setAircraftFilter] = useState('all');

  // Multiple hardcoded reports for different aircraft
  const reports = [
    {
      id: 'apu-report-001',
      apuName: 'APU System A380-001',
      reportName: 'Airbus A380 #6566',
      status: 'Safe',
      timestamp: new Date('2024-01-14T12:52:00Z'),
      userName: 'John Smith',
      aircraftName: 'Airbus A380',
      location: 'Hangar A, Terminal 1',
      fileName: 'airbus-a380-apu-inspection-2024.pdf',
      healthScore: 95
    },
    {
      id: 'apu-report-002',
      apuName: 'APU System A380-002',
      reportName: 'Airbus A380 #6567',
      status: 'Needs Attention',
      timestamp: new Date('2024-01-17T22:27:00Z'),
      userName: 'John Smith',
      aircraftName: 'Airbus A380',
      location: 'Hangar A, Terminal 1',
      fileName: 'airbus-a380-apu-inspection-2024.pdf',
      healthScore: 69
    }
  ];

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon and class
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Safe':
        return { icon: CheckCircle, class: 'success', label: 'Safe' };
      case 'pending':
        return { icon: AlertCircle, class: 'warning', label: 'Pending' };
      case 'Needs Attention':
        return { icon: AlertTriangle, class: 'danger', label: 'Needs Attention' };
      default:
        return { icon: AlertCircle, class: 'neutral', label: 'Unknown' };
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.aircraftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.apuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesAircraft = aircraftFilter === 'all' || report.aircraftName === aircraftFilter;
    
    return matchesSearch && matchesStatus && matchesAircraft;
  });

  // Get unique aircraft names for filter
  const aircraftNames = [...new Set(reports.map(report => report.aircraftName))];

  return (
    <div className={styles.reportsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/dashboard/company" className={styles.backButton}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageIcon}>
              <FileText size={20} />
            </span>
            APU Inspection Reports
          </h1>
        </div>
        <div className={styles.reportCount}>
          {filteredReports.length} Report{filteredReports.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className={styles.filterControls}>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search reports..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Safe">Safe</option>
            <option value="pending">Pending</option>
            <option value="Needs Attention">Needs Attention</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <Plane size={16} />
          <select 
            className={styles.filterSelect}
            value={aircraftFilter}
            onChange={(e) => setAircraftFilter(e.target.value)}
          >
            <option value="all">All Aircraft</option>
            {aircraftNames.map(aircraft => (
              <option key={aircraft} value={aircraft}>{aircraft}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Reports Grid */}
      <div className={styles.reportsGrid}>
        {filteredReports.map(report => {
          const statusInfo = getStatusInfo(report.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={report.id} className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <div className={styles.reportIcon}>
                  <Plane size={24} />
                </div>
                <div className={styles.reportTitleSection}>
                  <h3 className={styles.reportTitle}>{report.reportName}</h3>
                  <div className={styles.reportSubtitle}>
                    <span className={`${styles.statusTag} ${styles[statusInfo.class]}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.reportBody}>
                <div className={styles.reportInfo}>
                  <div className={styles.infoItem}>
                    <MapPin size={14} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Aircraft</span>
                      <span className={styles.infoValue}>{report.aircraftName}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <Wrench size={14} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>APU System</span>
                      <span className={styles.infoValue}>{report.apuName}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <User size={14} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Technician</span>
                      <span className={styles.infoValue}>{report.userName}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <Clock size={14} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>{formatDate(report.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Health Score Bar */}
                <div className={styles.healthScoreSection}>
                  <div className={styles.healthScoreHeader}>
                    <span className={styles.healthScoreLabel}>APU Health Score</span>
                    <span className={styles.healthScoreValue}>{report.healthScore}%</span>
                  </div>
                  <div className={styles.healthScoreBar}>
                    <div 
                      className={styles.healthScoreProgress}
                      style={{ 
                        width: `${report.healthScore}%`,
                        backgroundColor: report.healthScore >= 80 ? '#22c55e' : 
                                       report.healthScore >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className={styles.reportFooter}>
                <div className={styles.reportActions}>
                  <button 
                    className={styles.actionButton}
                    title="View Report"
                    onClick={() => {
                      alert(`Viewing report: ${report.reportName}`);
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  
                  <button 
                    className={styles.actionButton}
                    title="Download Report"
                    onClick={() => {
                      alert(`Downloading: ${report.fileName}`);
                    }}
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredReports.length === 0 && (
        <div className={styles.noResults}>
          <FileText size={48} />
          <h3>No reports found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;