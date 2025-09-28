"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  BarChart2, 
  LineChart, 
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import styles from './page.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

// Interface definitions
interface Aircraft {
  id: string;
  name: string;
  location: string;
  healthScore?: number;
}

const AnalyticsPage = () => {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAircraft, setSelectedAircraft] = useState<string>('all');
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Local mock health trend data (last 90 days)
  const generateHealthTrendData = (): { date: string; value: number }[] => {
    const today = new Date();
    const data: { date: string; value: number }[] = [];
    let value = 80;
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      // Simulate slight fluctuations around 80-90
      const delta = (Math.sin(i / 7) + Math.cos(i / 11)) * 2;
      value = Math.max(70, Math.min(95, value + delta));
      data.push({ date: d.toISOString().slice(0, 10), value: Math.round(value) });
    }
    return data;
  };
  const healthTrendData = generateHealthTrendData();

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch aircraft
        const aircraftCollection = collection(db, 'AngularisIndustries');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        
        const aircraftData = aircraftSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Aircraft',
          location: doc.data().location || 'Unknown Location',
          healthScore: Math.random() * 20 + 80 // Simulated data (80-100)
        }));
        
        setAircraft(aircraftData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load analytics data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process analytics data for the selected period
  // const processAnalyticsData = useCallback((
  //   apusData: APUSystem[], 
  //   aircraftData: Aircraft[], 
  //   reportsData: APUInspectionReport[]
  // ) => {
  //   // Calculate APU status counts
  //   const statusCounts: Record<string, number> = {};
  //   apusData.forEach(apu => {
  //     const status = apu.status || 'unknown';
  //     statusCounts[status] = (statusCounts[status] || 0) + 1;
  //   });
  //   setAPUStatusCounts(statusCounts);
  //   
  //   // Calculate overall health score (average of APU health scores)
  //   const avgHealthScore = apusData.reduce((sum, apu) => 
  //     sum + (apu.healthScore || 0), 0) / apusData.length;
  //   setOverallHealthScore(Math.round(avgHealthScore));
  //   
  //   // Generate inspection trend data (simulated for now)
  //   const trendData = generateTimeSeriesData(90, 5, 15);
  //   setInspectionTrendData(trendData);
  //   
  //   // Generate health trend data (slightly increasing trend)
  //   const healthData = generateTimeSeriesData(90, 75, 95, true);
  //   setHealthTrendData(healthData);
  //   
  //   // Set aircraft health data
  //   const aircraftHealth = aircraftData.map(aircraft => ({
  //     name: aircraft.name,
  //     value: aircraft.healthScore || 0
  //   }));
  //   setAircraftHealthData(aircraftHealth);
  //   
  //   // Set inspection completion rate (simulated)
  //   setInspectionCompletionRate(Math.round(Math.random() * 10 + 90)); // 90-100%
  //   
  //   // Set issues identified
  //   setIssuesIdentified(Math.floor(Math.random() * 50) + 20); // 20-70 issues
  //   
  //   // Set average time to fix (in hours)
  //   setAverageTimeToFix(Math.round((Math.random() * 30) + 10)); // 10-40 hours
  //   
  //   // Generate predictive maintenance data
  //   const predictions = apusData
  //   .filter(a => a.failureProbability && a.failureProbability > 10)
  //   .slice(0, 5)
  //   .map(apu => ({
  //     apuName: apu.name,
  //     failureProbability: apu.failureProbability || 0,
  //     suggestedAction: getSuggestedAction(apu.failureProbability || 0),
  //     daysUntilMaintenance: Math.floor(Math.random() * 14) + 1 // 1-14 days
  //   }));
  //   setPredictiveMaintenance(predictions);

  //   // Generate insights
  //   const insightsList: InsightCard[] = [
  //     {
  //       title: 'Health Score',
  //       description: 'Overall APU system health status',
  //       value: `${Math.round(avgHealthScore)}%`,
  //       change: 3.2,
  //       icon: CheckCircle,
  //       trend: 'up',
  //       color: '#22c55e'
  //     },
  //     {
  //       title: 'Issue Detection',
  //       description: 'Issues identified in last period',
  //       value: Math.floor(Math.random() * 50) + 20,
  //       change: -8.1,
  //       icon: AlertTriangle,
  //       trend: 'down',
  //       color: '#f59e0b'
  //     },
  //     {
  //       title: 'Maintenance Efficiency',
  //       description: 'Average time to fix issues',
  //       value: `${Math.round((Math.random() * 30) + 10)}h`,
  //       change: -12.5,
  //       icon: RefreshCw,
  //       trend: 'down',
  //       color: '#3b82f6'
  //     },
  //     {
  //       title: 'Inspection Completion',
  //       description: 'Scheduled inspections completed',
  //       value: `${Math.round(Math.random() * 10 + 90)}%`,
  //       change: 1.8,
  //       icon: CheckCircle,
  //       trend: 'up',
  //       color: '#22c55e'
  //     }
  //   ];
    
  //   setInsights(insightsList);
  // }, []);

  // Utility function to generate time series data (simulated)
  // const generateTimeSeriesData = (days: number, min: number, max: number, uptrend = false) => {
  //   const data = [];
  //   let lastValue = (min + max) / 2;
  //   
  //   for (let i = days; i >= 0; i--) {
  //     const date = new Date();
  //     date.setDate(date.getDate() - i);
  //     
  //     // Generate a somewhat realistic time series with some randomness
  //     const randomChange = Math.random() * 5 - 2.5; // -2.5 to 2.5
  //     const trendComponent = uptrend ? (i / days) * 5 : 0; // Slight uptrend if needed
  //     
  //     lastValue = lastValue + randomChange + trendComponent;
  //     
  //     // Keep within bounds
  //     lastValue = Math.max(min, Math.min(max, lastValue));
  //     
  //     data.push({
  //       date: date.toISOString().split('T')[0],
  //       value: Math.round(lastValue)
  //     });
  //   }
  //   
  //   return data;
  // };

  // Get suggested action based on failure probability
  // const getSuggestedAction = (probability: number): string => {
  //   if (probability > 25) return 'Immediate Maintenance';
  //   if (probability > 15) return 'Schedule Inspection';
  //   if (probability > 10) return 'Monitor Closely';
  //   return 'Routine Maintenance';
  // };

  // Handle period change
  // const handlePeriodChange = (period: string) => {
  //   setSelectedPeriod(period);
  //   // We would re-process data based on the period in a real application
  // };

  // Handle aircraft filter change
  const handleAircraftChange = (aircraft: string) => {
    setSelectedAircraft(aircraft);
    // We would filter data based on the aircraft in a real application
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading analytics data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
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
    <div className={styles.analyticsContainer}>
      {/* Page Header */}
      <header className={styles.analyticsHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/company" className={styles.backButton}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className={styles.pageTitle}>Analytics & Insights</h1>
        </div>
        
        <div className={styles.headerControls}>
          
          {/* Aircraft Selector */}
          <div className={styles.plantSelector}>
            <select
              value={selectedAircraft}
              onChange={(e) => handleAircraftChange(e.target.value)}
              className={styles.plantDropdown}
            >
              <option value="all">Flight #6566</option>
              {aircraft.map(aircraft => (
                <option key={aircraft.id} value={aircraft.id}>{aircraft.name}</option>
              ))}
            </select>
          </div>
          
          {/* Download Button */}
          <button className={styles.downloadButton}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Single APU Metrics Section */}
      <section className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.insightIcon} style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
            <BarChart2 size={20} />
          </div>
          <div className={styles.insightContent}>
            <h3 className={styles.insightTitle}>APU Health Score</h3>
            <p className={styles.insightDescription}>Current operational health status</p>
            <div className={styles.insightMetrics}>
              <span className={styles.insightValue}>95%</span>
              <span className={`${styles.insightChange} ${styles.trendUp}`}>
                <ArrowUpRight size={14} />
                2.3%
              </span>
            </div>
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightIcon} style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div className={styles.insightContent}>
            <h3 className={styles.insightTitle}>Maintenance Threshold</h3>
            <p className={styles.insightDescription}>Minimum health score before maintenance required</p>
            <div className={styles.insightMetrics}>
              <span className={styles.insightValue}>75%</span>
              <span className={styles.insightChange}>
                <Info size={14} />
                Critical
              </span>
            </div>
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightIcon} style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.insightContent}>
            <h3 className={styles.insightTitle}>Operating Hours</h3>
            <p className={styles.insightDescription}>Total runtime since last maintenance</p>
            <div className={styles.insightMetrics}>
              <span className={styles.insightValue}>2,847 hrs</span>
              <span className={`${styles.insightChange} ${styles.trendUp}`}>
                <ArrowUpRight size={14} />
                156 hrs
              </span>
            </div>
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightIcon} style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
            <BrainCircuit size={20} />
          </div>
          <div className={styles.insightContent}>
            <h3 className={styles.insightTitle}>Failure Risk</h3>
            <p className={styles.insightDescription}>Predicted failure probability</p>
            <div className={styles.insightMetrics}>
              <span className={styles.insightValue}>12%</span>
              <span className={`${styles.insightChange} ${styles.trendDown}`}>
                <ArrowDownRight size={14} />
                3.1%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analytics Section */}
      <div className={styles.analyticsPanels}>
        {/* Panel 1: Health Score Trends */}
        <div className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <LineChart size={18} />
              Health Score Trends
            </h2>
            <div className={styles.panelControls}>
              <button className={styles.infoButton}><Info size={14} /></button>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.healthScoreChart}>
              {/* In a real application, we would use a charting library like Chart.js or Recharts */}
              <div className={styles.chartPlaceholder}>
                <div className={styles.mockLineChart}>
                  {healthTrendData.map((point, index) => (
                    <div
                      key={index}
                      className={styles.mockDataPoint}
                      style={{
                        left: `${(index / (healthTrendData.length - 1)) * 100}%`,
                        bottom: `${(point.value - 50) / 50 * 100}%`
                      }}
                    ></div>
                  ))}
                  <div className={styles.mockChartLine}></div>
                </div>
                <div className={styles.chartAxis}>
                  {healthTrendData.filter((_, i) => i % 15 === 0).map((point, i) => (
                    <div key={i} className={styles.axisLabel}>{point.date.slice(5)}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <div className={styles.healthScoreSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Current Score</span>
                  <span className={styles.summaryValue}>87%</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Maintenance Threshold</span>
                  <span className={`${styles.summaryValue} ${styles.trendDown}`}>
                    <AlertTriangle size={14} /> 75%
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Status</span>
                  <span className={`${styles.summaryValue} ${styles.trendUp}`}>
                    <CheckCircle size={14} /> Above Threshold
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Single APU Performance Metrics */}
        <div className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <BarChart2 size={18} />
              APU Performance Metrics
            </h2>
            <div className={styles.panelControls}>
              <button className={styles.infoButton}><Info size={14} /></button>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.machineStatusChart}>
              <div className={styles.statusDistribution}>
                <div className={styles.statusGroup}>
                  <div 
                    className={`${styles.statusBar} ${styles.statusOperational}`}
                    style={{ width: '87%' }}
                  ></div>
                  <div className={styles.statusLabel}>
                    <span className={styles.statusDot} style={{ backgroundColor: '#22c55e' }}></span>
                    <span>Health Score</span>
                    <span className={styles.statusCount}>87%</span>
                  </div>
                </div>
                <div className={styles.statusGroup}>
                  <div 
                    className={`${styles.statusBar} ${styles.statusMaintenance}`}
                    style={{ width: '75%' }}
                  ></div>
                  <div className={styles.statusLabel}>
                    <span className={styles.statusDot} style={{ backgroundColor: '#f59e0b' }}></span>
                    <span>Maintenance Threshold</span>
                    <span className={styles.statusCount}>75%</span>
                  </div>
                </div>
                <div className={styles.statusGroup}>
                  <div 
                    className={`${styles.statusBar} ${styles.statusDown}`}
                    style={{ width: '12%' }}
                  ></div>
                  <div className={styles.statusLabel}>
                    <span className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></span>
                    <span>Failure Risk</span>
                    <span className={styles.statusCount}>12%</span>
                  </div>
                </div>
                <div className={styles.statusGroup}>
                  <div 
                    className={`${styles.statusBar} ${styles.statusIdle}`}
                    style={{ width: '95%' }}
                  ></div>
                  <div className={styles.statusLabel}>
                    <span className={styles.statusDot} style={{ backgroundColor: '#3b82f6' }}></span>
                    <span>Efficiency</span>
                    <span className={styles.statusCount}>95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: APU Operating Data */}
        <div className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <TrendingUp size={18} />
              APU Operating Data
            </h2>
            <div className={styles.panelControls}>
              <button className={styles.infoButton}><Info size={14} /></button>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.inspectionTrendsChart}>
              <div className={styles.chartPlaceholder}>
                <div className={styles.mockBarChart}>
                  <div className={styles.mockBarColumn}>
                    <div className={styles.mockBar} style={{ height: '85%' }}></div>
                    <div className={styles.mockBarLabel}>Temp</div>
                  </div>
                  <div className={styles.mockBarColumn}>
                    <div className={styles.mockBar} style={{ height: '92%' }}></div>
                    <div className={styles.mockBarLabel}>Pressure</div>
                  </div>
                  <div className={styles.mockBarColumn}>
                    <div className={styles.mockBar} style={{ height: '78%' }}></div>
                    <div className={styles.mockBarLabel}>Vibration</div>
                  </div>
                  <div className={styles.mockBarColumn}>
                    <div className={styles.mockBar} style={{ height: '95%' }}></div>
                    <div className={styles.mockBarLabel}>Fuel Flow</div>
                  </div>
                  <div className={styles.mockBarColumn}>
                    <div className={styles.mockBar} style={{ height: '88%' }}></div>
                    <div className={styles.mockBarLabel}>RPM</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <div className={styles.inspectionSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Operating Hours</span>
                  <span className={styles.summaryValue}>2,847 hrs</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Last Maintenance</span>
                  <span className={styles.summaryValue}>45 days ago</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Next Scheduled</span>
                  <span className={styles.summaryValue}>15 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Single APU Predictive Maintenance */}
        <div className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <BrainCircuit size={18} />
              APU Predictive Maintenance
            </h2>
            <div className={styles.panelControls}>
              <button className={styles.infoButton}><Info size={14} /></button>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.predictionTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Component</div>
                <div className={styles.tableHeaderCell}>Failure Risk</div>
                <div className={styles.tableHeaderCell}>Action</div>
                <div className={styles.tableHeaderCell}>Timeline</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>APU Generator</div>
                <div className={styles.tableCell}>
                  <div className={styles.riskIndicator}>
                    <div 
                      className={styles.riskBar}
                      style={{ 
                        width: '12%',
                        backgroundColor: '#f59e0b'
                      }}
                    ></div>
                    <span className={styles.riskValue}>12%</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.actionTag} ${styles.actionNormal}`}>
                    Monitor
                  </span>
                </div>
                <div className={styles.tableCell}>
                  45 days
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>Fuel System</div>
                <div className={styles.tableCell}>
                  <div className={styles.riskIndicator}>
                    <div 
                      className={styles.riskBar}
                      style={{ 
                        width: '8%',
                        backgroundColor: '#22c55e'
                      }}
                    ></div>
                    <span className={styles.riskValue}>8%</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.actionTag} ${styles.actionNormal}`}>
                    Normal
                  </span>
                </div>
                <div className={styles.tableCell}>
                  90 days
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>Cooling System</div>
                <div className={styles.tableCell}>
                  <div className={styles.riskIndicator}>
                    <div 
                      className={styles.riskBar}
                      style={{ 
                        width: '15%',
                        backgroundColor: '#f59e0b'
                      }}
                    ></div>
                    <span className={styles.riskValue}>15%</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.actionTag} ${styles.actionWarning}`}>
                    Schedule Inspection
                  </span>
                </div>
                <div className={styles.tableCell}>
                  30 days
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>Electrical Panel</div>
                <div className={styles.tableCell}>
                  <div className={styles.riskIndicator}>
                    <div 
                      className={styles.riskBar}
                      style={{ 
                        width: '5%',
                        backgroundColor: '#22c55e'
                      }}
                    ></div>
                    <span className={styles.riskValue}>5%</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.actionTag} ${styles.actionNormal}`}>
                    Normal
                  </span>
                </div>
                <div className={styles.tableCell}>
                  120 days
                </div>
              </div>
            </div>
            <div className={styles.predictionDisclaimer}>
              <AlertCircle size={14} />
              <span>Predictions based on historical data and machine learning algorithms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aircraft Performance Section */}
      <section className={styles.plantPerformanceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Fleet Performance Analytics</h2>
        </div>
        <div className={styles.plantGrid}>
          {aircraft.map((aircraft, index) => (
            <div key={index} className={styles.plantCard}>
              <div className={styles.plantHeader}>
                <h3 className={styles.plantName}>{aircraft.name}</h3>
                <div className={styles.plantLocation}>
                  {aircraft.name} Fleet ({
                    aircraft.id === 'EastPlant' ? 350 : 
                    aircraft.id === 'WestPlant' ? 250 : 
                    aircraft.id === 'NorthPlant' ? 400 : 
                    aircraft.id === 'SouthPlant' ? 500 : 0
                  })
                </div>
              </div>
              <div className={styles.plantMetrics}>
                <div className={styles.plantStatsList}>
                  <div className={styles.plantStat}>
                    <div className={styles.statLabel}>APU Systems</div>
                    <div className={styles.statValue}>
                      {aircraft.id === 'EastPlant' ? 350 : 
                       aircraft.id === 'WestPlant' ? 250 : 
                       aircraft.id === 'NorthPlant' ? 400 : 
                       aircraft.id === 'SouthPlant' ? 500 : 0}
                    </div>
                  </div>
                  <div className={styles.plantStat}>
                    <div className={styles.statLabel}>Issues</div>
                    <div className={styles.statValue}>
                      {aircraft.id === 'EastPlant' ? 25 : 
                       aircraft.id === 'WestPlant' ? 7 : 
                       aircraft.id === 'NorthPlant' ? 18 : 
                       aircraft.id === 'SouthPlant' ? 43 : 0}
                    </div>
                  </div>
                  <div className={styles.plantStat}>
                    <div className={styles.statLabel}>Inspections</div>
                    <div className={styles.statValue}>
                      {aircraft.id === 'EastPlant' ? 19 : 
                       aircraft.id === 'WestPlant' ? 24 : 
                       aircraft.id === 'NorthPlant' ? 17 : 
                       aircraft.id === 'SouthPlant' ? 9 : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage; 