'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Layers,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import styles from './schedule.module.css';
import { useAuth } from '@/app/contexts/auth-context';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';

// Interfaces
interface APUInspectionSchedule {
  id: string;
  technicianId: string;
  technicianName: string;
  aircraftId: string;
  aircraftName: string;
  date: Timestamp;
  status: string;
  priority: string;
  notes?: string;
  apuId?: string;
}

interface Aircraft {
  id: string;
  name: string;
  location: string;
}

interface APUSystem {
  id: string;
  name: string;
  aircraftId: string;
}

// Calendar utility functions
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Check if two dates are the same day
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const SchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<APUInspectionSchedule[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [apus, setAPUs] = useState<APUSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAircraft, setFilterAircraft] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Fetch schedules data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch aircraft
        const aircraftCollection = collection(db, 'AngularisIndustries');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        
        const aircraftData = aircraftSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Aircraft',
          location: doc.data().location || 'Unknown Location'
        }));
        
        setAircraft(aircraftData);
        
        // Fetch APU systems
        const apusSnapshot = await getDocs(collection(db, 'machines'));
        const apusData = apusSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown APU System',
          aircraftId: doc.data().plantId
        }));
        setAPUs(apusData);
        
        // Fetch inspection schedules
        const schedulesCollection = collection(db, 'inspectionSchedules');
        const schedulesQuery = query(schedulesCollection, orderBy('date', 'asc'));
        const schedulesSnapshot = await getDocs(schedulesQuery);
        
        const schedulesData = await Promise.all(schedulesSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get technician name (using userName from data)
          const technicianName = data.userName || 'Unknown Technician';
          
          // Get aircraft name
          const aircraftName = aircraftData.find(a => a.id === data.plantId)?.name || 'Unknown Aircraft';
          
          return {
            id: doc.id,
            technicianId: data.inspectorId || data.userId || 'unknown',
            technicianName,
            aircraftId: data.plantId,
            aircraftName,
            date: data.date,
            status: data.status || 'scheduled',
            priority: data.priority || 'medium',
            notes: data.notes,
            apuId: data.machineId
          };
        }));
        
        setSchedules(schedulesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setError('Failed to load schedule data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Navigation functions
  const goToPreviousMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Filter schedules by selected date
  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return [];
    
    return schedules.filter(schedule => {
      if (!schedule.date) return false;
      
      const scheduleDate = schedule.date.toDate();
      return isSameDay(scheduleDate, date);
    });
  };

  // Filter schedules by search term and filters
  const getFilteredSchedules = useCallback(() => {
    let filtered = [...schedules];
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(schedule => {
        const aircraft = aircraft.find(a => a.id === schedule.aircraftId);
        const apu = apus.find(a => a.id === schedule.apuId);
        
        return (
          aircraft?.name.toLowerCase().includes(lowerQuery) ||
          aircraft?.location.toLowerCase().includes(lowerQuery) ||
          schedule.technicianName.toLowerCase().includes(lowerQuery) ||
          apu?.name.toLowerCase().includes(lowerQuery) ||
          schedule.notes?.toLowerCase().includes(lowerQuery)
        );
      });
    }
    
    if (filterAircraft) {
      filtered = filtered.filter(schedule => schedule.aircraftId === filterAircraft);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(schedule => schedule.status === filterStatus);
    }
    
    return filtered;
  }, [schedules, aircraft, apus, searchQuery, filterAircraft, filterStatus]);

  // Get the count of schedules for each day in the current month
  const getScheduleCountForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return schedules.filter(schedule => {
      if (!schedule.date) return false;
      
      const scheduleDate = schedule.date.toDate();
      return isSameDay(scheduleDate, date);
    }).length;
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

  // Format timestamp to readable time
  const formatTime = (timestamp?: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Not available';
    
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Get priority class
  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'neutral';
    }
  };

  // Build calendar grid
  const buildCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    const calendarDays = [];
    
    // Previous month's days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
      calendarDays.push({
        day: prevMonthDays - (firstDayOfMonth - i) + 1,
        currentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - (firstDayOfMonth - i) + 1)
      });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        currentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    // Next month's days
    const remainingSlots = 42 - calendarDays.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingSlots; i++) {
      calendarDays.push({
        day: i,
        currentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    
    return calendarDays;
  };

  // Get schedules for the currently selected date
  const selectedDateSchedules = selectedDate 
    ? getFilteredSchedules().filter(schedule => {
        const scheduleDate = schedule.date.toDate();
        return isSameDay(scheduleDate, selectedDate);
      })
    : [];

  // Sort upcoming schedules
  const upcomingSchedules = getFilteredSchedules()
    .filter(schedule => {
      const scheduleDate = schedule.date.toDate();
      return scheduleDate >= new Date();
    })
    .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading schedule data...</p>
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

  const calendarDays = buildCalendarDays();
  const filteredSchedules = getFilteredSchedules();

  return (
    <div className={styles.schedulePage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/dashboard/company" className={styles.backButton}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageIcon}><CalendarIcon size={24} /></span>
            APU Inspection Schedule
          </h1>
        </div>
        
        <div className={styles.filterControls}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search schedules..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className={styles.filterDropdown}
            value={filterAircraft}
            onChange={(e) => setFilterAircraft(e.target.value)}
          >
            <option value="">All Aircraft</option>
            {aircraft.map(aircraft => (
              <option key={aircraft.id} value={aircraft.id}>{aircraft.name}</option>
            ))}
          </select>
          
          <select
            className={styles.filterDropdown}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarNavigation}>
            <button onClick={goToPreviousMonth} className={styles.navButton}>
              <ChevronLeft size={20} />
            </button>
            
            <h2 className={styles.currentMonthYear}>
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            
            <button onClick={goToNextMonth} className={styles.navButton}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button onClick={goToToday} className={styles.todayButton}>
            Today
          </button>
        </div>
        
        <div className={styles.calendar}>
          <div className={styles.dayLabels}>
            {DAYS.map(day => (
              <div key={day} className={styles.dayLabel}>{day}</div>
            ))}
          </div>
          
          <div className={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const daySchedules = filteredSchedules.filter(schedule => {
                const scheduleDate = schedule.date.toDate();
                return isSameDay(scheduleDate, day.date);
              });
              
              const isToday = isSameDay(day.date, new Date());
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const hasSchedules = daySchedules.length > 0;
              
              return (
                <div 
                  key={index} 
                  className={`
                    ${styles.calendarDay} 
                    ${!day.currentMonth ? styles.otherMonth : ''} 
                    ${isToday ? styles.today : ''} 
                    ${isSelected ? styles.selected : ''}
                    ${hasSchedules ? styles.hasSchedules : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span className={styles.dayNumber}>{day.day}</span>
                  {hasSchedules && (
                    <span className={styles.scheduleCount}>{daySchedules.length}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Schedule */}
      {selectedDate && (
        <div className={styles.selectedDaySchedules}>
          <h3 className={styles.selectedDayTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {selectedDateSchedules.length > 0 ? (
            <div className={styles.schedulesList}>
              {selectedDateSchedules.map(schedule => {
                const aircraft = aircraft.find(a => a.id === schedule.aircraftId);
                const apu = apus.find(a => a.id === schedule.apuId);
                const scheduleDate = schedule.date.toDate();
                
                return (
                  <div key={schedule.id} className={styles.scheduleCard}>
                    <div className={styles.scheduleTime}>
                      <Clock size={16} />
                      {formatTime(schedule.date)}
                    </div>
                    
                    <div className={styles.scheduleDetails}>
                      <h4 className={styles.scheduleTitle}>
                        {aircraft?.name || 'Unknown Aircraft'}
                        {apu && ` - ${apu.name}`}
                      </h4>
                      
                      <div className={styles.scheduleInfo}>
                        <div className={styles.infoItem}>
                          <Users size={14} className={styles.infoIcon} />
                          <span>{schedule.technicianName || 'Unassigned'}</span>
                        </div>
                        
                        <div className={styles.infoItem}>
                          <Layers size={14} className={styles.infoIcon} />
                          <span>{aircraft?.location || 'Unknown Location'}</span>
                        </div>
                      </div>
                      
                      {schedule.notes && (
                        <p className={styles.scheduleNotes}>{schedule.notes}</p>
                      )}
                      
                      <div className={styles.scheduleTags}>
                        <span className={`${styles.statusTag} ${styles[getStatusClass(schedule.status)]}`}>
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                        
                        <span className={`${styles.priorityTag} ${styles[getPriorityClass(schedule.priority)]}`}>
                          {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noSchedules}>
              <CalendarIcon size={32} />
              <p>No inspections scheduled for this day</p>
            </div>
          )}
        </div>
      )}

      {/* All Upcoming Schedules */}
      <div className={styles.upcomingSchedules}>
        <div className={styles.sectionHeader}>
          <h3>All Scheduled APU Inspections</h3>
          <div className={styles.activeTags}>
            {filterAircraft && (
              <div className={styles.activeTag}>
                Aircraft: {aircraft.find(a => a.id === filterAircraft)?.name}
                <button 
                  className={styles.removeTag} 
                  onClick={() => setFilterAircraft('')}
                >
                  ×
                </button>
              </div>
            )}
            
            {filterStatus && (
              <div className={styles.activeTag}>
                Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <button 
                  className={styles.removeTag} 
                  onClick={() => setFilterStatus('')}
                >
                  ×
                </button>
              </div>
            )}
            
            {searchQuery && (
              <div className={styles.activeTag}>
                Search: {searchQuery}
                <button 
                  className={styles.removeTag} 
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        
        {upcomingSchedules.length > 0 ? (
          <div className={styles.timelineSchedules}>
            {upcomingSchedules.map(schedule => {
              const aircraft = aircraft.find(a => a.id === schedule.aircraftId);
              const apu = apus.find(a => a.id === schedule.apuId);
              const scheduleDate = schedule.date.toDate();
              
              const month = scheduleDate.toLocaleString('default', { month: 'short' });
              const day = scheduleDate.getDate();
              
              return (
                <div key={schedule.id} className={styles.timelineCard}>
                  <div className={styles.timelineDate}>
                    <div className={styles.dateChip}>
                      <div className={styles.dateMonth}>{month}</div>
                      <div className={styles.dateDay}>{day}</div>
                    </div>
                    <div className={styles.dateTime}>{formatTime(schedule.date)}</div>
                  </div>
                  
                  <div className={styles.timelineContent}>
                    <h4 className={styles.timelineTitle}>
                      {aircraft?.name || 'Unknown Aircraft'}
                      {apu && ` - ${apu.name}`}
                    </h4>
                    
                    <div className={styles.scheduleInfo}>
                      <div className={styles.infoItem}>
                        <Users size={14} className={styles.infoIcon} />
                        <span>{schedule.technicianName || 'Unassigned'}</span>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <Layers size={14} className={styles.infoIcon} />
                        <span>{aircraft?.location || 'Unknown Location'}</span>
                      </div>
                    </div>
                    
                    <div className={styles.scheduleTags}>
                      <div className={`${styles.statusTag} ${styles[getStatusClass(schedule.status)]}`}>
                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                      </div>
                      
                      <div className={`${styles.priorityTag} ${styles[getPriorityClass(schedule.priority)]}`}>
                        {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noContent}>
            <CalendarIcon size={32} />
            <p>No upcoming APU inspections match your criteria</p>
            <button 
              className={styles.resetButton}
              onClick={() => {
                setSearchQuery('');
                setFilterAircraft('');
                setFilterStatus('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage; 