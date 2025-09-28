'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import styles from './schedule.module.css';
import { Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

// Calendar data for April 2024
const APRIL_2024 = {
  month: 'April',
  year: 2024,
  days: 30,
  startingDay: 1, // Monday is the first day (0 for Sunday, 1 for Monday, etc.)
  today: new Date().getDate() // Current day of month
};

// Task type definitions
type TaskType = 'inspection' | 'maintenance' | 'calibration' | 'safety' | 'performance';
type TaskPriority = 'high' | 'medium' | 'low';

// Task interface
interface Task {
  id: string;
  date: number;
  time: string;
  machineId: string;
  machineName: string;
  plantId: string;
  plantName: string;
  type: TaskType;
  priority: TaskPriority;
  completed: boolean;
}

// Generate random tasks for April
const generateRandomTasks = (): Task[] => {
  const tasks: Task[] = [];
  const machineNames = [
    'APU System', 'APU Generator', 'APU Starter', 'APU Controller', 
    'APU Test Bench', 'APU Cooling System', 'APU Fuel System', 'APU Electrical Panel'
  ];
  const plantNames = ['Airbus A380', 'Boeing 777', 'Airbus A320', 'Boeing 747'];
  const taskTypes: TaskType[] = ['inspection', 'maintenance', 'calibration', 'safety', 'performance'];
  const priorities: TaskPriority[] = ['high', 'medium', 'low'];
  
  // Generate 40-60 random tasks throughout the month
  const numTasks = Math.floor(Math.random() * 20) + 40;
  
  for (let i = 0; i < numTasks; i++) {
    const date = Math.floor(Math.random() * APRIL_2024.days) + 1;
    const hour = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    const time = `${hour}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
    
    const plantIndex = Math.floor(Math.random() * plantNames.length);
    const machineIndex = Math.floor(Math.random() * machineNames.length);
    const typeIndex = Math.floor(Math.random() * taskTypes.length);
    const priorityIndex = Math.floor(Math.random() * priorities.length);
    
    // Only mark tasks in the past as completed
    const isCompleted = date < APRIL_2024.today;
    
    tasks.push({
      id: `task-${i}`,
      date,
      time,
      machineId: `M${plantIndex}${machineIndex}`,
      machineName: `${machineNames[machineIndex]} ${plantIndex}${machineIndex}`,
      plantId: `plant-${plantIndex}`,
      plantName: plantNames[plantIndex],
      type: taskTypes[typeIndex],
      priority: priorities[priorityIndex],
      completed: isCompleted
    });
  }
  
  return tasks;
};

// Group tasks by date
const groupTasksByDate = (tasks: Task[]): Record<number, Task[]> => {
  const grouped: Record<number, Task[]> = {};
  
  tasks.forEach(task => {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  });
  
  return grouped;
};

// Sort tasks by time
const sortTasksByTime = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aHour = parseInt(a.time.split(':')[0]);
    const bHour = parseInt(b.time.split(':')[0]);
    
    if (aHour !== bHour) return aHour - bHour;
    
    const aMinute = parseInt(a.time.split(':')[1].split(' ')[0]);
    const bMinute = parseInt(b.time.split(':')[1].split(' ')[0]);
    
    return aMinute - bMinute;
  });
};

// Calendar page component
export default function InspectorSchedulePage() {
  const { user, userRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState<number | null>(APRIL_2024.today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksGroupedByDate, setTasksGroupedByDate] = useState<Record<number, Task[]>>({});
  const [mounted, setMounted] = useState(false);
  
  // Generate tasks on mount
  useEffect(() => {
    setMounted(true);
    const generatedTasks = generateRandomTasks();
    setTasks(generatedTasks);
    setTasksGroupedByDate(groupTasksByDate(generatedTasks));
  }, []);
  
  // Get day name from date
  const getDayName = (day: number): string => {
    const date = new Date(APRIL_2024.year, 3, day); // Month is 0-indexed, so 3 is April
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  // Get task icon based on type
  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'inspection':
        return <CheckCircle size={16} />;
      case 'maintenance':
        return <Wrench size={16} />;
      case 'calibration':
        return <Calendar size={16} />;
      case 'safety':
        return <AlertTriangle size={16} />;
      case 'performance':
        return <Clock size={16} />;
    }
  };
  
  // Get priority class
  const getPriorityClass = (priority: TaskPriority): string => {
    switch (priority) {
      case 'high':
        return styles.highPriority;
      case 'medium':
        return styles.mediumPriority;
      case 'low':
        return styles.lowPriority;
    }
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < APRIL_2024.startingDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= APRIL_2024.days; day++) {
      const isToday = day === APRIL_2024.today;
      const isSelected = day === selectedDate;
      const hasTasks = tasksGroupedByDate[day] && tasksGroupedByDate[day].length > 0;
      
      days.push(
        <div 
          key={day} 
          className={`
            ${styles.calendarDay} 
            ${isToday ? styles.today : ''} 
            ${isSelected ? styles.selected : ''}
            ${hasTasks ? styles.hasTasks : ''}
          `}
          onClick={() => setSelectedDate(day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          {hasTasks && (
            <span className={styles.taskIndicator}>
              {tasksGroupedByDate[day].length}
            </span>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  // Toggle task completed status
  const toggleTaskCompleted = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTasks(updatedTasks);
    setTasksGroupedByDate(groupTasksByDate(updatedTasks));
  };
  
  if (!mounted) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading schedule...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.schedulePage}>
      {/* Page header */}
      <div className={styles.scheduleHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/inspector" className={styles.backButton}>
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className={styles.pageTitle}>Monthly Schedule</h1>
        </div>
        
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || 'Inspector'}</span>
          <span className={styles.userRole}>Inspector</span>
        </div>
      </div>
      
      {/* Month selector */}
      <div className={styles.monthSelector}>
        <button className={styles.monthButton}>
          <ArrowLeft size={18} />
        </button>
        <h2 className={styles.monthTitle}>{APRIL_2024.month} {APRIL_2024.year}</h2>
        <button className={styles.monthButton}>
          <ArrowRight size={18} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <div className={styles.weekday}>Mon</div>
          <div className={styles.weekday}>Tue</div>
          <div className={styles.weekday}>Wed</div>
          <div className={styles.weekday}>Thu</div>
          <div className={styles.weekday}>Fri</div>
          <div className={styles.weekday}>Sat</div>
          <div className={styles.weekday}>Sun</div>
        </div>
        
        <div className={styles.calendarGrid}>
          {generateCalendarDays()}
        </div>
      </div>
      
      {/* Selected day details */}
      {selectedDate && (
        <div className={styles.selectedDayDetails}>
          <div className={styles.selectedDayHeader}>
            <h3 className={styles.selectedDayTitle}>
              {getDayName(selectedDate)}, {APRIL_2024.month} {selectedDate}
            </h3>
            <span className={styles.taskCount}>
              {tasksGroupedByDate[selectedDate]?.length || 0} Tasks
            </span>
          </div>
          
          <div className={styles.tasksList}>
            {tasksGroupedByDate[selectedDate] && tasksGroupedByDate[selectedDate].length > 0 ? (
              sortTasksByTime(tasksGroupedByDate[selectedDate]).map(task => (
                <div 
                  key={task.id} 
                  className={`${styles.taskCard} ${task.completed ? styles.completedTask : ''}`}
                  onClick={() => toggleTaskCompleted(task.id)}
                >
                  <div className={styles.taskTime}>
                    <Clock size={16} />
                    <span>{task.time}</span>
                  </div>
                  
                  <div className={styles.taskContent}>
                    <div className={styles.taskHeader}>
                      <span className={`${styles.taskType} ${styles[task.type]}`}>
                        {getTaskIcon(task.type)}
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                      </span>
                      <span className={`${styles.taskPriority} ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <h4 className={styles.taskTitle}>{task.machineName}</h4>
                    <p className={styles.taskLocation}>{task.plantName}</p>
                    
                    {task.completed && (
                      <div className={styles.completedIndicator}>
                        <CheckCircle size={16} />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noTasks}>
                <div className={styles.noTasksIcon}>📅</div>
                <p className={styles.noTasksText}>No tasks scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 