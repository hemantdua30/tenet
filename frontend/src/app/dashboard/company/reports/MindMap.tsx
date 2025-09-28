'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './reports.module.css';

// Define the node types for our mindmap
interface MindMapNode {
  id: string;
  label: string;
  type: string;
  children: MindMapNode[];
  data?: any;
  status?: string;
}

interface MindMapProps {
  reportData: any;
  onNodeSelect?: (node: MindMapNode) => void;
}

const MindMap: React.FC<MindMapProps> = ({ reportData, onNodeSelect }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Convert the report data to a mindmap structure
  useEffect(() => {
    if (!reportData) return;

    // Process the JSON data directly from the reportData.json
    const processData = () => {
      // Create the root node
      const rootNode: MindMapNode = {
        id: 'root',
        label: reportData.reportName || 'Inspection Report',
        type: 'root',
        children: [],
        status: reportData.status
      };

      // Get the JSON data directly
      const jsonData = reportData.json;
      
      if (!jsonData) {
        // If no JSON data is available, return a simple structure
        rootNode.children.push({
          id: 'no-data',
          label: 'No detailed data available',
          type: 'category',
          children: []
        });
        return [rootNode];
      }

      // Create nodes for each major section in the JSON
      Object.entries(jsonData).forEach(([key, value]) => {
        if (!value || typeof value !== 'object') return;
        
        // Create a category node for each top-level key
        const categoryNode: MindMapNode = {
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          type: 'category',
          children: []
        };

        // Process the data for this category
        processCategory(categoryNode, value as object);
        
        // Only add if it has children
        if (categoryNode.children.length > 0) {
          rootNode.children.push(categoryNode);
        }
      });

      return [rootNode];
    };

    // Helper to process a category's data and add children
    const processCategory = (parentNode: MindMapNode, data: object) => {
      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        // Skip null or undefined values
        if (value === null || value === undefined) return;

        // Handle different types of data differently
        if (Array.isArray(value)) {
          // Array of items - create a subcategory and add array items as children
          const subcategoryNode: MindMapNode = {
            id: `${parentNode.id}-${key}`,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            type: 'subcategory',
            children: []
          };
          
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              // Extract a label from the item if possible
              const itemObj = item as Record<string, any>;
              const label = itemObj.name || itemObj.title || itemObj.description || 
                            itemObj.id || `Item ${index + 1}`;
              
              // Extract a status if available
              const status = itemObj.status || itemObj.severity || itemObj.priority || itemObj.condition;
              
              subcategoryNode.children.push({
                id: `${subcategoryNode.id}-item-${index}`,
                label,
                type: 'data',
                children: [],
                data: item,
                status
              });
            } else {
              // Simple value
              subcategoryNode.children.push({
                id: `${subcategoryNode.id}-item-${index}`,
                label: String(item),
                type: 'data',
                children: [],
                data: item
              });
            }
          });
          
          // Only add subcategory if it has children
          if (subcategoryNode.children.length > 0) {
            parentNode.children.push(subcategoryNode);
          }
        } else if (typeof value === 'object' && value !== null) {
          // Object - create a subcategory
          const subcategoryNode: MindMapNode = {
            id: `${parentNode.id}-${key}`,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            type: 'subcategory',
            children: []
          };
          
          // Process this object's properties
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue === null || subValue === undefined) return;
            
            let nodeLabel: string;
            let nodeStatus: string | undefined;
            
            if (typeof subValue === 'object' && subValue !== null) {
              // Extract meaningful information from the object
              const subValueObj = subValue as Record<string, any>;
              nodeLabel = subValueObj.name || subValueObj.title || subValueObj.description || 
                          subKey;
              nodeStatus = subValueObj.status || subValueObj.severity || subValueObj.priority || 
                          subValueObj.condition;
              
              subcategoryNode.children.push({
                id: `${subcategoryNode.id}-${subKey}`,
                label: nodeLabel,
                type: 'data',
                children: [],
                data: subValue,
                status: nodeStatus
              });
            } else {
              // Simple key-value pair
              subcategoryNode.children.push({
                id: `${subcategoryNode.id}-${subKey}`,
                label: `${subKey}: ${subValue}`,
                type: 'data',
                children: [],
                data: subValue
              });
            }
          });
          
          // Only add subcategory if it has children
          if (subcategoryNode.children.length > 0) {
            parentNode.children.push(subcategoryNode);
          }
        } else {
          // Simple value - add directly to parent
          parentNode.children.push({
            id: `${parentNode.id}-${key}`,
            label: `${key}: ${value}`,
            type: 'data',
            children: [],
            data: value
          });
        }
      });
    };

    const mindmapData = processData();
    setNodes(mindmapData);
  }, [reportData]);

  // Resize observer to make the mindmap responsive
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: Math.max(600, container.clientWidth * 0.6)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle node selection
  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Get status color based on the status
  const getStatusColor = (status?: string) => {
    if (!status) return '#6b7280'; // neutral color
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('good') || 
        statusLower.includes('normal') || 
        statusLower.includes('ok') || 
        statusLower.includes('complete') || 
        statusLower.includes('pass') || 
        statusLower.includes('low') ||
        statusLower === 'compliant') {
      return '#22c55e'; // success color
    }
    
    if (statusLower.includes('warn') || 
        statusLower.includes('medium') || 
        statusLower.includes('pending') ||
        statusLower.includes('caution')) {
      return '#f59e0b'; // warning color
    }
    
    if (statusLower.includes('critical') || 
        statusLower.includes('high') || 
        statusLower.includes('attention') || 
        statusLower.includes('fail') || 
        statusLower.includes('bad') ||
        statusLower.includes('error') ||
        statusLower === 'non-compliant') {
      return '#ef4444'; // danger color
    }
    
    return '#6b7280'; // neutral color
  };

  // Calculate node positions and render the mindmap
  const renderMindMap = () => {
    if (!nodes.length) return null;
    
    // Define layout parameters
    const rootX = dimensions.width / 2;
    const rootY = 70;
    const level1Radius = dimensions.width * 0.32;
    const level2Radius = level1Radius * 0.65;
    const level3Radius = level2Radius * 0.65;
    
    // Function to calculate node positions
    const calculateNodePositions = (
      node: MindMapNode, 
      level: number,
      startAngle: number,
      endAngle: number,
      centerX: number,
      centerY: number
    ) => {
      const renderedElements: React.ReactNode[] = [];
      
      // Node's own position
      let nodeX = centerX;
      let nodeY = centerY;
      let radius = 0;
      
      if (level === 1) {
        radius = level1Radius;
      } else if (level === 2) {
        radius = level2Radius;
      } else if (level === 3) {
        radius = level3Radius;
      }
      
      if (level > 0) {
        const angle = startAngle + (endAngle - startAngle) / 2;
        nodeX = centerX + radius * Math.cos(angle);
        nodeY = centerY + radius * Math.sin(angle);
      }
      
      // Calculate node size based on level
      const nodeSize = level === 0 ? 60 : level === 1 ? 46 : level === 2 ? 36 : 30;
      
      // Render the node
      const isSelected = node.id === selectedNode;
      const statusColor = getStatusColor(node.status);
      
      renderedElements.push(
        <g 
          key={node.id} 
          transform={`translate(${nodeX}, ${nodeY})`}
          onClick={() => handleNodeClick(node)}
          className={styles.mindMapNode}
          style={{ cursor: 'pointer' }}
        >
          <circle 
            r={nodeSize / 2} 
            fill={isSelected ? '#6a26cd' : '#242424'} 
            stroke={node.status ? statusColor : '#555555'}
            strokeWidth={isSelected ? 3 : 2}
            filter={isSelected ? 'url(#glow)' : undefined}
          />
          <text 
            textAnchor="middle" 
            dominantBaseline="middle"
            fill="#f3f4f6" 
            fontSize={level === 0 ? 14 : level === 1 ? 12 : 10}
            fontWeight={isSelected ? 'bold' : 'normal'}
          >
            {shortenLabel(node.label, level)}
          </text>
        </g>
      );
      
      // Connect to parent if not root
      if (level > 0) {
        renderedElements.push(
          <line 
            key={`line-${node.id}`} 
            x1={centerX} 
            y1={centerY} 
            x2={nodeX} 
            y2={nodeY} 
            stroke={isSelected ? '#6a26cd' : '#555555'} 
            strokeWidth={isSelected ? 2 : 1}
            strokeDasharray={level === 3 ? "3,3" : undefined}
            opacity={level === 3 ? 0.7 : 1}
          />
        );
      }
      
      // Render children
      if (node.children && node.children.length > 0) {
        const angleStep = (endAngle - startAngle) / node.children.length;
        
        node.children.forEach((child, index) => {
          const childStartAngle = startAngle + index * angleStep;
          const childEndAngle = childStartAngle + angleStep;
          
          const childElements = calculateNodePositions(
            child,
            level + 1,
            childStartAngle,
            childEndAngle,
            nodeX,
            nodeY
          );
          
          renderedElements.push(...childElements);
        });
      }
      
      return renderedElements;
    };
    
    // Helper to shorten long labels
    const shortenLabel = (label: string, level: number) => {
      const maxLength = level === 0 ? 20 : level === 1 ? 14 : level === 2 ? 12 : 10;
      return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
    };
    
    // Render the entire mindmap starting with the root node
    const rootNode = nodes[0];
    return calculateNodePositions(rootNode, 0, 0, 2 * Math.PI, rootX, rootY);
  };

  return (
    <div className={styles.mindMapContainer}>
      <svg 
        ref={svgRef}
        width={dimensions.width} 
        height={dimensions.height}
        className={styles.mindMapSvg}
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#242424" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
        <rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#bg-gradient)" rx="8" />
        {renderMindMap()}
      </svg>
    </div>
  );
};

export default MindMap; 