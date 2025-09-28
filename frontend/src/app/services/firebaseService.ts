'use client';

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Type definitions
export type MachineStatus = 'healthy' | 'undermaintenance' | 'scheduledmaintenance' | 'down' | 'turnedoff';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  lastInspection: string | null;
  manufacturer: string;
  installDate: string;
  model: string;
  serialNumber: string;
  plantId: string;
  location: string;
  metrics?: {
    uptime?: number;
    efficiency?: number;
    temperature?: number;
    pressure?: number;
    vibration?: number;
  };
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  totalMachines: number;
  activeMachines: number;
  maintenanceMachines: number;
  downtimeMachines: number;
  scheduledMachines: number;
  offMachines: number;
}

export interface Inspection {
  id: string;
  machineId: string;
  machineName: string;
  plantId: string;
  plantName: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: 'scheduled' | 'inprogress' | 'completed' | 'cancelled';
  type: 'regular' | 'maintenance' | 'calibration' | 'safety' | 'performance';
  notes: string | null;
  findings: {
    id: string;
    category: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    action: string | null;
  }[];
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  plantId: string;
  plantName: string;
  timestamp: string;
  type: 'maintenance' | 'breakdown' | 'performance' | 'safety';
  message: string;
  status: 'new' | 'acknowledged' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo: string | null;
}

// Fetch all plants
export const fetchPlants = async (): Promise<Plant[]> => {
  try {
    console.log('Starting fetchPlants function');
    // Try different collection names in case the collection name is mistyped
    const possibleCollectionNames = ['AngularisIndustries', 'AngilarisIndustries', 'angularisindustries', 'plants'];
    
    let plantsSnapshot = null;
    let usedCollection = '';
    
    // Try each possible collection name
    for (const collName of possibleCollectionNames) {
      console.log(`Trying to fetch from collection: ${collName}`);
      try {
        const plantsCollection = collection(db, collName);
        const snapshot = await getDocs(plantsCollection);
        
        if (!snapshot.empty) {
          plantsSnapshot = snapshot;
          usedCollection = collName;
          console.log(`Found data in collection: ${collName}`);
          break;
        }
      } catch (collErr) {
        console.log(`Collection ${collName} failed:`, collErr);
        // Continue to next collection
      }
    }
    
    // If we found data in any collection
    if (plantsSnapshot && !plantsSnapshot.empty) {
      console.log(`Using collection: ${usedCollection} with ${plantsSnapshot.size} documents`);
      const plants: Plant[] = [];
      plantsSnapshot.forEach(doc => {
        console.log(`Processing plant document: ${doc.id}`);
        const data = doc.data();
        
        // Log the data structure to help debug
        console.log('Plant document data structure:', Object.keys(data));
        
        // More robust data extraction
        const plant: Plant = {
          id: doc.id,
          name: data.name || doc.id,
          location: data.location || 'Unknown Location',
          totalMachines: data.totalMachines || data.machines?.length || 0,
          activeMachines: data.activeMachines || 0,
          maintenanceMachines: data.maintenanceMachines || 0,
          downtimeMachines: data.downtimeMachines || 0,
          scheduledMachines: data.scheduledMachines || 0,
          offMachines: data.offMachines || 0
        };
        
        plants.push(plant);
      });
      
      console.log(`Returning ${plants.length} plants`);
      return plants;
    }

    console.log('No data found in Firebase, returning mock data');
    // Otherwise return mock data
    return [
      {
        id: 'east',
        name: 'Airbus A380',
        location: 'Hangar A, Terminal 1',
        totalMachines: 8,
        activeMachines: 5,
        maintenanceMachines: 1,
        downtimeMachines: 1,
        scheduledMachines: 1,
        offMachines: 0
      },
      {
        id: 'west',
        name: 'Boeing 777',
        location: 'Hangar B, Terminal 2',
        totalMachines: 10,
        activeMachines: 6,
        maintenanceMachines: 1,
        downtimeMachines: 0,
        scheduledMachines: 1,
        offMachines: 2
      },
      {
        id: 'north',
        name: 'Airbus A320',
        location: 'Hangar C, Terminal 1',
        totalMachines: 6,
        activeMachines: 3,
        maintenanceMachines: 1,
        downtimeMachines: 1,
        scheduledMachines: 0,
        offMachines: 1
      },
      {
        id: 'south',
        name: 'Boeing 747',
        location: 'Hangar D, Terminal 2',
        totalMachines: 8,
        activeMachines: 5,
        maintenanceMachines: 0,
        downtimeMachines: 1,
        scheduledMachines: 2,
        offMachines: 0
      }
    ];
  } catch (error) {
    console.error('Error in fetchPlants:', error);
    // Return mock data even if there's an error to prevent the app from crashing
    return [
      {
        id: 'east',
        name: 'Airbus A380 (Fallback)',
        location: 'Hangar A, Terminal 1',
        totalMachines: 8,
        activeMachines: 5,
        maintenanceMachines: 1,
        downtimeMachines: 1,
        scheduledMachines: 1,
        offMachines: 0
      },
      {
        id: 'west',
        name: 'Boeing 777 (Fallback)',
        location: 'Hangar B, Terminal 2',
        totalMachines: 10,
        activeMachines: 6,
        maintenanceMachines: 1,
        downtimeMachines: 0,
        scheduledMachines: 1,
        offMachines: 2
      }
    ];
  }
};

// Fetch machines for a specific plant
export const fetchMachinesByPlant = async (plantId: string): Promise<Machine[]> => {
  try {
    console.log(`Starting fetchMachinesByPlant for plantId: ${plantId}`);
    // Try different collection names and paths
    const possiblePaths = [
      { collection: 'AngularisIndustries', subcollection: 'machines' },
      { collection: 'AngilarisIndustries', subcollection: 'machines' },
      { collection: 'angularisindustries', subcollection: 'machines' },
      { collection: 'plants', subcollection: 'machines' }
    ];
    
    let machinesSnapshot = null;
    let usedPath = '';
    
    // Try each possible path
    for (const path of possiblePaths) {
      console.log(`Trying to fetch machines from ${path.collection}/${plantId}/${path.subcollection}`);
      try {
        const machinesCollection = collection(db, path.collection, plantId, path.subcollection);
        const snapshot = await getDocs(machinesCollection);
        
        if (!snapshot.empty) {
          machinesSnapshot = snapshot;
          usedPath = `${path.collection}/${plantId}/${path.subcollection}`;
          console.log(`Found machines in: ${usedPath}`);
          break;
        }
      } catch (collErr) {
        console.log(`Path ${path.collection}/${plantId}/${path.subcollection} failed:`, collErr);
        // Continue to next path
      }
    }
    
    // If we found data in any collection
    if (machinesSnapshot && !machinesSnapshot.empty) {
      console.log(`Using path: ${usedPath} with ${machinesSnapshot.size} machines`);
      const machines: Machine[] = [];
      machinesSnapshot.forEach(doc => {
        console.log(`Processing machine document: ${doc.id}`);
        const data = doc.data();
        
        // Log the data structure to help debug
        console.log('Machine document data structure:', Object.keys(data));
        
        // More robust data extraction
        machines.push({
          id: doc.id,
          name: data.name || `Machine ${doc.id}`,
          status: data.status || 'healthy',
          lastInspection: data.lastInspection || null,
          manufacturer: data.manufacturer || 'Unknown Manufacturer',
          installDate: data.installDate || 'Unknown Date',
          model: data.model || 'Unknown Model',
          serialNumber: data.serialNumber || 'Unknown S/N',
          plantId: plantId,
          location: data.location || 'Unknown Location',
          metrics: data.metrics || {}
        });
      });
      
      console.log(`Returning ${machines.length} machines for plant ${plantId}`);
      return machines;
    }

    console.log(`No machines found for plant ${plantId}, returning mock data`);
    // Otherwise return mock data based on plantId
    const mockMachines: Record<string, Machine[]> = {
      'east': [
        { id: 'E001', name: 'APU System E1', status: 'healthy', lastInspection: '2024-04-10', manufacturer: 'Honeywell', installDate: '2020-06-15', model: 'GTCP131-9A', serialNumber: 'HW20567', plantId: 'east', location: 'Hangar A, Bay 1' },
        { id: 'E002', name: 'APU System E2', status: 'undermaintenance', lastInspection: '2024-03-28', manufacturer: 'Pratt & Whitney', installDate: '2019-08-22', model: 'APS5000A', serialNumber: 'PW19345', plantId: 'east', location: 'Hangar A, Bay 1' },
        { id: 'E003', name: 'APU System E3', status: 'healthy', lastInspection: '2024-04-05', manufacturer: 'Safran', installDate: '2021-03-17', model: 'RE220', serialNumber: 'SF21678', plantId: 'east', location: 'Hangar A, Bay 2' },
        { id: 'E004', name: 'APU System E4', status: 'down', lastInspection: '2024-03-15', manufacturer: 'Honeywell', installDate: '2018-11-30', model: 'GTCP131-9B', serialNumber: 'HW18234', plantId: 'east', location: 'Hangar A, Bay 3' }
      ],
      'west': [
        { id: 'W001', name: 'APU System W1', status: 'healthy', lastInspection: '2024-04-08', manufacturer: 'Honeywell', installDate: '2020-01-15', model: 'GTCP131-9A', serialNumber: 'HW20123', plantId: 'west', location: 'Hangar B, Bay 1' },
        { id: 'W002', name: 'APU System W2', status: 'healthy', lastInspection: '2024-04-12', manufacturer: 'Pratt & Whitney', installDate: '2019-05-22', model: 'APS5000A', serialNumber: 'PW19678', plantId: 'west', location: 'Hangar B, Bay 1' },
        { id: 'W003', name: 'APU System W3', status: 'scheduledmaintenance', lastInspection: '2024-03-22', manufacturer: 'Safran', installDate: '2021-07-10', model: 'RE220', serialNumber: 'SF21345', plantId: 'west', location: 'Hangar B, Bay 2' }
      ],
      'north': [
        { id: 'N001', name: 'APU System N1', status: 'undermaintenance', lastInspection: '2024-03-25', manufacturer: 'Honeywell', installDate: '2020-08-12', model: 'GTCP131-9A', serialNumber: 'HW20890', plantId: 'north', location: 'Hangar C, Bay 1' },
        { id: 'N002', name: 'APU System N2', status: 'healthy', lastInspection: '2024-04-07', manufacturer: 'Pratt & Whitney', installDate: '2019-12-05', model: 'APS5000A', serialNumber: 'PW19234', plantId: 'north', location: 'Hangar C, Bay 1' }
      ],
      'south': [
        { id: 'S001', name: 'APU System S1', status: 'healthy', lastInspection: '2024-04-06', manufacturer: 'Honeywell', installDate: '2021-04-18', model: 'GTCP131-9A', serialNumber: 'HW21234', plantId: 'south', location: 'Hangar D, Bay 1' },
        { id: 'S002', name: 'APU System S2', status: 'healthy', lastInspection: '2024-04-09', manufacturer: 'Pratt & Whitney', installDate: '2020-07-25', model: 'APS5000A', serialNumber: 'PW20567', plantId: 'south', location: 'Hangar D, Bay 1' }
      ]
    };

    // Return a smaller subset of machines for faster loading
    return mockMachines[plantId] || [];
  } catch (error) {
    console.error(`Error in fetchMachinesByPlant for plant ${plantId}:`, error);
    // Return a minimal set of mock machines even if there's an error
    return [
      { 
        id: `${plantId}001`, 
        name: `Fallback Machine ${plantId}001`, 
        status: 'healthy', 
        lastInspection: '2024-04-01', 
        manufacturer: 'Unknown', 
        installDate: '2020-01-01', 
        model: 'Unknown', 
        serialNumber: 'Unknown', 
        plantId: plantId, 
        location: 'Unknown' 
      },
      { 
        id: `${plantId}002`, 
        name: `Fallback Machine ${plantId}002`, 
        status: 'undermaintenance', 
        lastInspection: '2024-04-02', 
        manufacturer: 'Unknown', 
        installDate: '2020-01-02', 
        model: 'Unknown', 
        serialNumber: 'Unknown', 
        plantId: plantId, 
        location: 'Unknown' 
      }
    ];
  }
};

// Fetch a specific machine by ID
export const fetchMachineById = async (machineId: string): Promise<Machine | null> => {
  try {
    console.log(`Starting fetchMachineById for machineId: ${machineId}`);
    
    // Try different collection approaches since the structure might vary
    const possibleApproaches = [
      // Approach 1: Machines as subcollections under plants
      async () => {
        const plants = await fetchPlants();
        for (const plant of plants) {
          try {
            const machines = await fetchMachinesByPlant(plant.id);
            const machine = machines.find(m => m.id === machineId);
            if (machine) {
              return machine;
            }
          } catch (err) {
            console.log(`No machine found in plant ${plant.id}`);
          }
        }
        return null;
      },
      
      // Approach 2: Machines as direct collection with machineId field
      async () => {
        const machinesCollection = collection(db, 'machines');
        const q = query(machinesCollection, where('id', '==', machineId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const machine = snapshot.docs[0].data() as Machine;
          return { ...machine, id: snapshot.docs[0].id };
        }
        return null;
      },
      
      // Approach 3: Direct document lookup by ID
      async () => {
        const machineDoc = doc(db, 'machines', machineId);
        const snapshot = await getDoc(machineDoc);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          return { ...data, id: snapshot.id } as Machine;
        }
        return null;
      }
    ];
    
    // Try each approach until we find the machine
    for (const approach of possibleApproaches) {
      try {
        const machine = await approach();
        if (machine) {
          console.log(`Found machine with ID: ${machineId}`);
          return machine;
        }
      } catch (err) {
        console.log('Approach failed:', err);
      }
    }
    
    // If we get here, we couldn't find the machine in the database
    console.log(`No machine found with ID: ${machineId}, returning mock data`);
    
    // Return mock data as fallback
    return {
      id: machineId,
      name: `Machine ${machineId}`,
      status: 'healthy',
      lastInspection: new Date().toISOString(),
      manufacturer: 'MockManufacturer',
      installDate: '2022-01-01',
      model: 'Test Model X1',
      serialNumber: 'SN12345',
      plantId: 'east',
      location: 'Main Floor',
      metrics: {
        uptime: 98,
        efficiency: 87,
        temperature: 42,
        pressure: 720,
        vibration: 12
      }
    };
  } catch (error) {
    console.error('Error in fetchMachineById:', error);
    return null;
  }
};

// Fetch all inspections for an inspector
export const fetchInspectionsByInspector = async (inspectorId: string): Promise<Inspection[]> => {
  try {
    // For real implementation we would fetch from Firestore
    // First check if there's data in the collection
    const inspectionsCollection = collection(db, 'inspections');
    const q = query(inspectionsCollection, where('inspectorId', '==', inspectorId));
    const inspectionsSnapshot = await getDocs(q);

    // If the collection exists and has data, use that
    if (!inspectionsSnapshot.empty) {
      const inspections: Inspection[] = [];
      inspectionsSnapshot.forEach(doc => {
        const data = doc.data();
        inspections.push({
          id: doc.id,
          machineId: data.machineId || '',
          machineName: data.machineName || '',
          plantId: data.plantId || '',
          plantName: data.plantName || '',
          inspectorId: data.inspectorId || '',
          inspectorName: data.inspectorName || '',
          date: data.date ? new Date(data.date.seconds * 1000).toISOString().split('T')[0] : '',
          startTime: data.startTime || '',
          endTime: data.endTime || null,
          status: data.status || 'scheduled',
          type: data.type || 'regular',
          notes: data.notes || null,
          findings: data.findings || []
        });
      });
      return inspections;
    }

    // Otherwise create mock data
    // Generate random dates in the past month
    const getRandomDate = () => {
      const today = new Date();
      const pastDays = Math.floor(Math.random() * 30);
      const date = new Date(today);
      date.setDate(date.getDate() - pastDays);
      return date.toISOString().split('T')[0];
    };

    // Generate random times
    const getRandomTime = () => {
      const hours = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
      const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    // Generate 15-25 mock inspections
    const mockInspections: Inspection[] = [];
    const inspectionTypes: ('regular' | 'maintenance' | 'calibration' | 'safety' | 'performance')[] = [
      'regular', 'maintenance', 'calibration', 'safety', 'performance'
    ];
    const statuses: ('scheduled' | 'inprogress' | 'completed' | 'cancelled')[] = [
      'scheduled', 'inprogress', 'completed', 'cancelled'
    ];
    const plantNames = ['Airbus A380', 'Boeing 777', 'Airbus A320', 'Boeing 747'];
    const plantIds = ['east', 'west', 'north', 'south'];
    const machineIds = ['E001', 'E002', 'W001', 'W002', 'N001', 'N002', 'S001', 'S002'];
    const machineNames = [
      'APU System E1', 'APU System E2', 'APU System W1', 'APU System W2',
      'APU System N1', 'APU System N2', 'APU System S1', 'APU System S2'
    ];

    const numInspections = Math.floor(Math.random() * 10) + 15; // 15-25 inspections

    for (let i = 0; i < numInspections; i++) {
      const randomPlantIndex = Math.floor(Math.random() * plantNames.length);
      const randomMachineIndex = Math.floor(Math.random() * machineIds.length);
      const randomTypeIndex = Math.floor(Math.random() * inspectionTypes.length);
      const randomStatusIndex = Math.floor(Math.random() * statuses.length);
      const date = getRandomDate();
      const status = statuses[randomStatusIndex];

      // Create findings only for completed inspections
      const findings = status === 'completed' ? [
        {
          id: `finding-${i}-1`,
          category: 'Mechanical',
          description: 'Slight vibration detected during operation',
          severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
          action: 'Recommended tightening of mounting bolts'
        },
        {
          id: `finding-${i}-2`,
          category: 'Electrical',
          description: 'Power fluctuations during peak loads',
          severity: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'high' : 'medium',
          action: 'Schedule electrical system inspection'
        }
      ] : [];

      mockInspections.push({
        id: `inspection-${i}`,
        machineId: machineIds[randomMachineIndex],
        machineName: machineNames[randomMachineIndex],
        plantId: plantIds[randomPlantIndex],
        plantName: plantNames[randomPlantIndex],
        inspectorId: inspectorId,
        inspectorName: 'John Smith', // Mock inspector name
        date,
        startTime: getRandomTime(),
        endTime: status === 'completed' ? getRandomTime() : null,
        status,
        type: inspectionTypes[randomTypeIndex],
        notes: status === 'completed' ? 'Inspection completed successfully. No major issues found.' : null,
        findings: findings as any
      });
    }

    return mockInspections;
  } catch (error) {
    console.error(`Error fetching inspections for inspector ${inspectorId}:`, error);
    throw error;
  }
};

// Fetch recent alerts for an inspector
export const fetchRecentAlerts = async (inspectorId: string): Promise<Alert[]> => {
  try {
    // For real implementation we would fetch from Firestore
    // First check if there's data in the collection
    const alertsCollection = collection(db, 'alerts');
    const q = query(
      alertsCollection,
      where('assignedTo', '==', inspectorId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const alertsSnapshot = await getDocs(q);

    // If the collection exists and has data, use that
    if (!alertsSnapshot.empty) {
      const alerts: Alert[] = [];
      alertsSnapshot.forEach(doc => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          machineId: data.machineId || '',
          machineName: data.machineName || '',
          plantId: data.plantId || '',
          plantName: data.plantName || '',
          timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toISOString() : '',
          type: data.type || 'maintenance',
          message: data.message || '',
          status: data.status || 'new',
          priority: data.priority || 'medium',
          assignedTo: data.assignedTo || null
        });
      });
      return alerts;
    }

    // Otherwise create mock data
    // Generate random timestamps in the past week
    const getRandomTimestamp = () => {
      const now = new Date();
      const pastHours = Math.floor(Math.random() * 168); // Past week (7 days * 24 hours)
      const date = new Date(now);
      date.setHours(date.getHours() - pastHours);
      return date.toISOString();
    };

    // Generate 5-10 mock alerts
    const mockAlerts: Alert[] = [];
    const alertTypes: ('maintenance' | 'breakdown' | 'performance' | 'safety')[] = [
      'maintenance', 'breakdown', 'performance', 'safety'
    ];
    const priorities: ('critical' | 'high' | 'medium' | 'low')[] = [
      'critical', 'high', 'medium', 'low'
    ];
    const statuses: ('new' | 'acknowledged' | 'resolved')[] = [
      'new', 'acknowledged', 'resolved'
    ];
    const plantNames = ['Airbus A380', 'Boeing 777', 'Airbus A320', 'Boeing 747'];
    const plantIds = ['east', 'west', 'north', 'south'];
    const machineIds = ['E001', 'E002', 'W001', 'W002', 'N001', 'N002', 'S001', 'S002'];
    const machineNames = [
      'APU System E1', 'APU System E2', 'APU System W1', 'APU System W2',
      'APU System N1', 'APU System N2', 'APU System S1', 'APU System S2'
    ];

    const numAlerts = Math.floor(Math.random() * 5) + 5; // 5-10 alerts

    for (let i = 0; i < numAlerts; i++) {
      const randomPlantIndex = Math.floor(Math.random() * plantNames.length);
      const randomMachineIndex = Math.floor(Math.random() * machineIds.length);
      const randomTypeIndex = Math.floor(Math.random() * alertTypes.length);
      const randomPriorityIndex = Math.floor(Math.random() * priorities.length);
      const randomStatusIndex = Math.floor(Math.random() * statuses.length);

      // Generate a message based on the alert type
      let message = '';
      const alertType = alertTypes[randomTypeIndex];
      if (alertType === 'maintenance') {
        message = `Regular maintenance due for ${machineNames[randomMachineIndex]}`;
      } else if (alertType === 'breakdown') {
        message = `${machineNames[randomMachineIndex]} has stopped working. Requires immediate attention.`;
      } else if (alertType === 'performance') {
        message = `${machineNames[randomMachineIndex]} showing decreased performance metrics.`;
      } else if (alertType === 'safety') {
        message = `Safety concern detected with ${machineNames[randomMachineIndex]}. Inspection required.`;
      }

      mockAlerts.push({
        id: `alert-${i}`,
        machineId: machineIds[randomMachineIndex],
        machineName: machineNames[randomMachineIndex],
        plantId: plantIds[randomPlantIndex],
        plantName: plantNames[randomPlantIndex],
        timestamp: getRandomTimestamp(),
        type: alertTypes[randomTypeIndex],
        message,
        status: statuses[randomStatusIndex],
        priority: priorities[randomPriorityIndex],
        assignedTo: inspectorId
      });
    }

    // Sort by timestamp (most recent first)
    return mockAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error(`Error fetching alerts for inspector ${inspectorId}:`, error);
    throw error;
  }
}; 