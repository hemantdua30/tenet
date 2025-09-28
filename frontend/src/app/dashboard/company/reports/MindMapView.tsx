'use client';

import React, { useState, useRef } from 'react';
import styles from './reports.module.css';
import { 
  ArrowLeft,
  Ruler,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface MindMapViewProps {
  reportId?: string;
}

const MindMapView: React.FC<MindMapViewProps> = ({ reportId }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Random data for the mindmap
  const randomMeasurements = {
    "Vibration": {
      "Bearing 1": { value: 45, status: "normal", unit: "mm/s" },
      "Bearing 2": { value: 78, status: "warning", unit: "mm/s" },
      "Motor": { value: 22, status: "good", unit: "mm/s" },
      "Fan": { value: 90, status: "critical", unit: "mm/s" }
    },
    "Temperature": {
      "Ambient": { value: 24, status: "normal", unit: "°C" },
      "Motor": { value: 85, status: "warning", unit: "°C" },
      "Bearing": { value: 65, status: "normal", unit: "°C" },
      "Control Box": { value: 32, status: "good", unit: "°C" }
    },
    "Pressure": {
      "Inlet": { value: 3.2, status: "normal", unit: "bar" },
      "Outlet": { value: 5.6, status: "normal", unit: "bar" },
      "Differential": { value: 2.4, status: "good", unit: "bar" }
    },
    "Electrical": {
      "Voltage": { value: 398, status: "normal", unit: "V" },
      "Current": { value: 24.5, status: "warning", unit: "A" },
      "Power Factor": { value: 0.92, status: "good", unit: "" },
      "Frequency": { value: 50.2, status: "normal", unit: "Hz" }
    },
    "Lubrication": {
      "Oil Level": { value: 85, status: "good", unit: "%" },
      "Oil Quality": { value: 40, status: "warning", unit: "%" },
      "Oil Pressure": { value: 2.1, status: "normal", unit: "bar" }
    }
  };
  
  // Zoom controls
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Get status color
  const getStatusColor = (value: any): string => {
    if (!value) return '#6b7280'; // neutral
    
    let status: string;
    
    if (typeof value === 'object' && value.status) {
      status = value.status.toLowerCase();
    } else if (typeof value === 'string') {
      status = value.toLowerCase();
    } else {
      return '#6b7280'; // neutral
    }
    
    if (status.includes('good')) {
      return '#22c55e'; // green
    } else if (status.includes('normal')) {
      return '#3b82f6'; // blue
    } else if (status.includes('warning')) {
      return '#f59e0b'; // amber
    } else if (status.includes('critical') || status.includes('danger') || status.includes('bad')) {
      return '#ef4444'; // red
    }
    
    return '#6b7280'; // neutral
  };

  // Handle node selection
  const handleNodeClick = (id: string, data: any) => {
    setSelectedNode(id === selectedNode ? null : id);
    setNodeDetails(data);
  };

  // Render mindmap
  const renderMindMap = () => {
    const containerWidth = svgRef.current?.clientWidth || 800;
    const containerHeight = svgRef.current?.clientHeight || 600;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const mainRadius = Math.min(containerWidth, containerHeight) * 0.4;
    
    const measurementCategories = Object.keys(randomMeasurements);
    const elements: React.ReactNode[] = [];
    
    // Add central node
    elements.push(
      <g key="root" className={styles.rootNode}>
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={60} 
          fill="url(#rootGradient)" 
          filter="url(#glow)"
        />
        <text 
          x={centerX} 
          y={centerY} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="#ffffff"
          fontWeight="bold"
          fontSize="14px"
        >
          Measurements
        </text>
      </g>
    );
    
    // Add category nodes (Level 1)
    measurementCategories.forEach((category, index) => {
      const angle = (index * 2 * Math.PI / measurementCategories.length) - Math.PI / 2;
      const x = centerX + mainRadius * Math.cos(angle);
      const y = centerY + mainRadius * Math.sin(angle);
      
      // Add connector line from center to category
      elements.push(
        <line 
          key={`line-${category}`}
          x1={centerX} 
          y1={centerY} 
          x2={x} 
          y2={y} 
          stroke="#6a26cd" 
          strokeWidth={2} 
          strokeOpacity={0.6}
        />
      );
      
      // Add category node
      elements.push(
        <g 
          key={category} 
          transform={`translate(${x}, ${y})`}
          onClick={() => handleNodeClick(category, randomMeasurements[category as keyof typeof randomMeasurements])}
          className={styles.mindMapNode}
          style={{ cursor: 'pointer' }}
        >
          <circle 
            r={40} 
            fill={selectedNode === category ? '#6a26cd' : '#2a2a2a'} 
            stroke="#4a4a4a"
            strokeWidth={2}
            filter={selectedNode === category ? "url(#glow)" : undefined}
          />
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#ffffff"
            fontSize="12px"
            fontWeight={selectedNode === category ? "bold" : "normal"}
          >
            {category}
          </text>
        </g>
      );
      
      // Add measurement values (Level 2)
      const measurementValues = Object.entries(randomMeasurements[category as keyof typeof randomMeasurements]);
      measurementValues.forEach(([key, value], valueIndex) => {
        const spreadFactor = 0.5;
        const valueAngle = angle + (valueIndex - (measurementValues.length - 1) / 2) * spreadFactor;
        const subRadius = mainRadius * 0.8;
        const valueX = centerX + subRadius * Math.cos(valueAngle);
        const valueY = centerY + subRadius * Math.sin(valueAngle);
        
        // Determine status color
        const statusColor = getStatusColor(value);
        
        // Add connector line from category to value
        elements.push(
          <line 
            key={`line-${category}-${key}`}
            x1={x} 
            y1={y} 
            x2={valueX} 
            y2={valueY} 
            stroke={statusColor} 
            strokeWidth={1.5} 
            strokeOpacity={0.6}
            strokeDasharray={selectedNode === category ? undefined : "3,3"}
          />
        );
        
        // Format display value
        const displayValue = value.value ? String(value.value) : '';
        
        // Add value node
        const nodeId = `${category}-${key}`;
        elements.push(
          <g 
            key={nodeId}
            transform={`translate(${valueX}, ${valueY})`}
            onClick={() => handleNodeClick(nodeId, { key, value })}
            className={styles.mindMapNode}
            style={{ cursor: 'pointer' }}
          >
            <circle 
              r={30} 
              fill={selectedNode === nodeId ? statusColor : '#2a2a2a'} 
              stroke={statusColor}
              strokeWidth={2}
              opacity={0.9}
              filter={selectedNode === nodeId ? "url(#glow)" : undefined}
            />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#ffffff"
              fontSize="10px"
              fontWeight={selectedNode === nodeId ? "bold" : "normal"}
            >
              <tspan x="0" dy="-6">{key}</tspan>
              {displayValue && (
                <tspan x="0" dy="12" fontSize="9px">{displayValue} {value.unit}</tspan>
              )}
            </text>
          </g>
        );
      });
    });
    
    return elements;
  };
  
  // Render node details
  const renderNodeDetails = () => {
    if (!nodeDetails) return null;
    
    if (typeof nodeDetails === 'object' && nodeDetails.key && nodeDetails.value) {
      // Showing leaf node details
      const { key, value } = nodeDetails;
      const status = value.status || '';
      const actualValue = value.value ? String(value.value) : '';
      const unit = value.unit || '';
      
      return (
        <div className={styles.nodeDetailsPanel}>
          <h3 className={styles.nodeDetailsTitle}>
            <Ruler size={16} /> Measurement Details
          </h3>
          <div className={styles.nodeDetailsList}>
            <div className={styles.nodeDetailItem}>
              <span className={styles.nodeDetailKey}>Parameter:</span>
              <span className={styles.nodeDetailValue}>{key}</span>
            </div>
            <div className={styles.nodeDetailItem}>
              <span className={styles.nodeDetailKey}>Value:</span>
              <span className={styles.nodeDetailValue}>{actualValue} {unit}</span>
            </div>
            {status && (
              <div className={styles.nodeDetailItem}>
                <span className={styles.nodeDetailKey}>Status:</span>
                <span 
                  className={styles.nodeDetailValue}
                  style={{ color: getStatusColor(value) }}
                >
                  {status}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Showing category details
      const category = selectedNode || '';
      const measurementCount = Object.keys(nodeDetails || {}).length;
      
      return (
        <div className={styles.nodeDetailsPanel}>
          <h3 className={styles.nodeDetailsTitle}>
            <Ruler size={16} /> {category} Measurements
          </h3>
          <div className={styles.nodeDetailsList}>
            <div className={styles.nodeDetailItem}>
              <span className={styles.nodeDetailKey}>Category:</span>
              <span className={styles.nodeDetailValue}>{category}</span>
            </div>
            <div className={styles.nodeDetailItem}>
              <span className={styles.nodeDetailKey}>Number of values:</span>
              <span className={styles.nodeDetailValue}>{measurementCount}</span>
            </div>
            <div className={styles.measurementSummary}>
              {Object.entries(nodeDetails || {}).map(([key, value]) => {
                return (
                  <div key={key} className={styles.summaryItem}>
                    <span className={styles.summaryKey}>{key}:</span>
                    <span 
                      className={styles.summaryValue} 
                      style={{ color: getStatusColor(value) }}
                    >
                      {(value as any).value} {(value as any).unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className={styles.reportsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/dashboard/company/reports" className={styles.backButton}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageIcon}>
              <Ruler size={20} />
            </span>
            Measurements Mindmap
          </h1>
        </div>
        
        <div className={styles.mindMapButtons}>
          <button 
            className={styles.mindMapButton} 
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className={styles.mindMapButton} 
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            className={styles.mindMapButton} 
            onClick={resetZoom}
            title="Reset Zoom"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      <div className={styles.mindMapContainer} style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
        <svg 
          ref={svgRef}
          width="100%" 
          height="700" 
          className={styles.mindMapSvg}
        >
          <defs>
            <radialGradient id="rootGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#8955e0" />
              <stop offset="100%" stopColor="#6a26cd" />
            </radialGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#242424" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" rx="8" />
          {renderMindMap()}
        </svg>
      </div>
      
      {selectedNode && renderNodeDetails()}
      
      <div className={styles.mindMapLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#22c55e' }}></div>
          <span>Good</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Normal</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Warning</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
};

export default MindMapView; 