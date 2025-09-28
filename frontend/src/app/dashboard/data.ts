// Dashboard data types and utilities

// Machine types and interfaces
export interface Machine {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  type: string;
  lastInspection: string;
  location: string;
  metrics: {
    uptime: number;
    efficiency: number;
    temperature: number;
  };
}

export interface Inspection {
  id: string;
  machine: string;
  date: string;
  status: 'completed' | 'warning' | 'critical' | 'info';
  findings: string;
  inspector: string;
}

export interface Task {
  id: string;
  title: string;
  machine: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  machineCount: number;
  healthScore: number;
}

export interface Alert {
  id: string;
  facility: string;
  machine: string;
  priority: 'info' | 'warning' | 'critical';
  time: string;
  message: string;
}

export interface FinancialMetrics {
  maintenanceCostSavings: string;
  downtimeReduction: string;
  roi: string;
  lifespanIncrease: string;
}

export interface Inspector {
  id: string;
  name: string;
  facility: string;
  tasksCompleted: number;
  photo: string | null;
}

// Sample data generators
export function generateRandomMachines(count: number): Machine[] {
  const machineTypes = ['CNC Mill', 'Packaging Robot', 'Conveyor Belt', 'Industrial Pump', 'Assembly Line'];
  const locations = ['Hangar A', 'Hangar B', 'Hangar C', 'Hangar D', 'Terminal 1', 'Terminal 2'];
  const statuses: Array<Machine['status']> = ['healthy', 'warning', 'critical', 'maintenance'];
  
  return Array.from({ length: count }).map((_, i) => {
    const type = machineTypes[Math.floor(Math.random() * machineTypes.length)];
    const id = `machine-${(i + 1).toString().padStart(2, '0')}`;
    
    return {
      id,
      name: `${type} #${Math.floor(Math.random() * 10) + 1}`,
      status: statuses[Math.floor(Math.random() * (statuses.length - 1))], // Bias towards healthy
      type,
      lastInspection: `${Math.floor(Math.random() * 14) + 1} days ago`,
      location: locations[Math.floor(Math.random() * locations.length)],
      metrics: {
        uptime: 85 + Math.floor(Math.random() * 15),
        efficiency: 75 + Math.floor(Math.random() * 25),
        temperature: 65 + Math.floor(Math.random() * 30),
      }
    };
  });
}

export function generateRandomInspections(count: number, machines: Machine[]): Inspection[] {
  const statuses: Array<Inspection['status']> = ['completed', 'warning', 'critical', 'info'];
  const findings = [
    'No issues detected',
    'Bearing wear detected',
    'Abnormal vibration pattern',
    'Maintenance due in 3 days',
    'Temperature threshold exceeded',
    'Replaced seals',
    'Belt tension needs adjustment',
    'Lubrication system serviced'
  ];
  const inspectors = ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson'];
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return Array.from({ length: count }).map((_, i) => {
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `ins-${(i + 1).toString().padStart(3, '0')}`,
      machine: randomMachine.name,
      date: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      findings: findings[Math.floor(Math.random() * findings.length)],
      inspector: inspectors[Math.floor(Math.random() * inspectors.length)]
    };
  });
}

export function generateRandomTasks(count: number, machines: Machine[]): Task[] {
  const titles = [
    'Routine inspection',
    'Follow-up check',
    'Calibration',
    'Preventive maintenance',
    'Emergency repair',
    'System update',
    'Performance review'
  ];
  const priorities: Array<Task['priority']> = ['low', 'medium', 'high', 'urgent'];
  const inspectors = ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson'];
  
  const dueDates = ['Today', 'Tomorrow', 'In 2 days'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;
  
  return Array.from({ length: count }).map((_, i) => {
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const randomDueTime = Math.floor(Math.random() * 20);
    let dueDate = '';
    
    if (randomDueTime < 3) {
      dueDate = dueDates[randomDueTime];
    } else {
      const date = new Date();
      date.setDate(date.getDate() + randomDueTime);
      dueDate = `${months[date.getMonth()]} ${date.getDate()}`;
    }
    
    return {
      id: `task-${(i + 1).toString().padStart(2, '0')}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      machine: randomMachine.name,
      dueDate,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignedTo: inspectors[Math.floor(Math.random() * inspectors.length)]
    };
  });
}

// Helper functions for dashboard data processing
export function getMachineStatusCounts(machines: Machine[]) {
  return machines.reduce((counts, machine) => {
    counts[machine.status] = (counts[machine.status] || 0) + 1;
    return counts;
  }, {} as Record<Machine['status'], number>);
}

export function getActiveAlertCount(alerts: Alert[]) {
  return alerts.filter(alert => alert.priority === 'warning' || alert.priority === 'critical').length;
}

export function getAverageHealthScore(facilities: Facility[]) {
  const total = facilities.reduce((sum, facility) => sum + facility.healthScore, 0);
  return Math.round(total / facilities.length);
}

// Generate random 3D visualization data points
export function generateRandomDataPoints(count: number) {
  return Array.from({ length: count }).map(() => ({
    x: 20 + Math.random() * 200,
    y: 20 + Math.random() * 80,
    size: 4 + Math.random() * 3,
    pulseDelay: Math.random() * 4
  }));
}

// Generate random chart data
export function generateMonthlyChartData(months: number) {
  return Array.from({ length: months }).map(() => 
    Math.floor(Math.random() * 30) + 40
  );
}

// Default export of sample data for dashboards
export default {
  generateRandomMachines,
  generateRandomInspections,
  generateRandomTasks,
  getMachineStatusCounts,
  getActiveAlertCount,
  getAverageHealthScore,
  generateRandomDataPoints,
  generateMonthlyChartData
}; 