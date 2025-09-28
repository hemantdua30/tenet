'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  Activity,
  Settings,
  Save,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import styles from './inspect.module.css';

interface InspectionResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  value: string;
  unit: string;
  notes: string;
}

export default function InspectPage() {
  const params = useParams();
  const router = useRouter();
  const machineId = params.machineId as string;
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading machine details
    setTimeout(() => {
      setMachine({
        id: machineId,
        name: `APU System ${machineId}`,
        status: 'operational',
        location: 'Hangar A, Bay 1',
        manufacturer: 'Honeywell',
        model: 'GTCP131-9A'
      });
      
      // Initialize inspection results
      setInspectionResults([
        {
          id: 'temp',
          name: 'Operating Temperature',
          status: 'pass',
          value: '85',
          unit: '°C',
          notes: 'Within normal range'
        },
        {
          id: 'pressure',
          name: 'Oil Pressure',
          status: 'pass',
          value: '45',
          unit: 'PSI',
          notes: 'Optimal pressure'
        },
        {
          id: 'vibration',
          name: 'Vibration Level',
          status: 'warning',
          value: '2.3',
          unit: 'mm/s',
          notes: 'Slightly elevated, monitor'
        },
        {
          id: 'fuel',
          name: 'Fuel Flow Rate',
          status: 'pass',
          value: '95',
          unit: 'GPH',
          notes: 'Normal consumption'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [machineId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} className={styles.statusPass} />;
      case 'fail':
        return <XCircle size={16} className={styles.statusFail} />;
      case 'warning':
        return <AlertTriangle size={16} className={styles.statusWarning} />;
      default:
        return <Clock size={16} className={styles.statusPending} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return 'Pass';
      case 'fail':
        return 'Fail';
      case 'warning':
        return 'Warning';
      default:
        return 'Pending';
    }
  };

  const updateInspectionResult = (id: string, field: string, value: string) => {
    setInspectionResults(prev => 
      prev.map(result => 
        result.id === id 
          ? { ...result, [field]: value }
          : result
      )
    );
  };

  const completeInspection = () => {
    setIsComplete(true);
    // Here you would typically save the inspection results
    console.log('Inspection completed:', inspectionResults);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading inspection...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className={styles.errorContainer}>
        <h2>Machine not found</h2>
        <Link href="/dashboard/inspector/machine" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Machines
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.inspectPage}>
      <div className={styles.header}>
        <Link href={`/dashboard/inspector/machine/${machineId}`} className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Machine
        </Link>
        <h1>Inspect {machine.name}</h1>
        <div className={styles.inspectionStatus}>
          {isComplete ? (
            <span className={styles.completed}>Inspection Complete</span>
          ) : (
            <span className={styles.inProgress}>Inspection In Progress</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.machineInfo}>
          <h3>Machine Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Manufacturer:</label>
              <span>{machine.manufacturer}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Model:</label>
              <span>{machine.model}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Location:</label>
              <span>{machine.location}</span>
            </div>
          </div>
        </div>

        <div className={styles.inspectionResults}>
          <h3>Inspection Results</h3>
          <div className={styles.resultsGrid}>
            {inspectionResults.map((result) => (
              <div key={result.id} className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h4>{result.name}</h4>
                  <div className={styles.statusBadge}>
                    {getStatusIcon(result.status)}
                    <span>{getStatusText(result.status)}</span>
                  </div>
                </div>
                
                <div className={styles.resultContent}>
                  <div className={styles.valueInput}>
                    <label>Value:</label>
                    <input
                      type="text"
                      value={result.value}
                      onChange={(e) => updateInspectionResult(result.id, 'value', e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>{result.unit}</span>
                  </div>
                  
                  <div className={styles.notesInput}>
                    <label>Notes:</label>
                    <textarea
                      value={result.notes}
                      onChange={(e) => updateInspectionResult(result.id, 'notes', e.target.value)}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={completeInspection}
            className={styles.primaryButton}
            disabled={isComplete}
          >
            <Save size={16} />
            {isComplete ? 'Inspection Complete' : 'Complete Inspection'}
          </button>
          <button className={styles.secondaryButton}>
            <FileText size={16} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
