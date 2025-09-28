export const sampleReportData = {
  id: "report-123456",
  reportName: "Pump Station #4 Inspection",
  status: "completed",
  timestamp: new Date("2023-11-28T14:30:00"),
  machineName: "Centrifugal Pump Assembly",
  userName: "John Engineer",
  
  machineDetails: {
    specs: {
      "Model": "CP-5000X",
      "Manufacturer": "Industrial Pumps Co.",
      "Year": "2019",
      "Capacity": "500 gal/min",
      "Motor Power": "75 HP"
    },
    conditions: {
      "Motor": { status: "good", notes: "Running within temperature parameters" },
      "Impeller": { status: "warning", notes: "Signs of cavitation damage" },
      "Seals": { status: "good", notes: "Recently replaced" },
      "Bearing Assembly": { status: "requires attention", notes: "Unusual vibration detected" },
      "Control Panel": { status: "good", notes: "All systems functional" }
    },
    maintenanceHistory: [
      {
        date: "2023-08-15",
        description: "Routine Maintenance",
        tasks: ["Oil change", "Filter replacement", "Control system check"]
      },
      {
        date: "2023-05-02",
        description: "Seal Replacement",
        tasks: ["Mechanical seal replacement", "Gasket inspection"]
      },
      {
        date: "2022-12-10",
        description: "Emergency Repair",
        tasks: ["Impeller repair", "Alignment correction"]
      }
    ]
  },
  
  findings: {
    issues: [
      {
        title: "Bearing Vibration",
        description: "Excessive vibration detected in the main bearing assembly",
        severity: "high",
        location: "Drive end bearing"
      },
      {
        title: "Impeller Cavitation",
        description: "Signs of cavitation damage on the impeller vanes",
        severity: "medium",
        location: "Pump impeller"
      },
      {
        title: "Minor Oil Leak",
        description: "Small oil leak observed at the rear seal",
        severity: "low",
        location: "Rear seal housing"
      }
    ],
    recommendations: [
      {
        title: "Replace Bearings",
        description: "Schedule replacement of the drive end bearings within 2 weeks",
        priority: "high",
        estimatedCost: "$2,500"
      },
      {
        title: "Impeller Inspection",
        description: "Conduct detailed inspection of impeller and replace if necessary",
        priority: "medium",
        estimatedCost: "$1,800"
      },
      {
        title: "Seal Maintenance",
        description: "Replace rear oil seal during next scheduled maintenance",
        priority: "low",
        estimatedCost: "$350"
      },
      {
        title: "Suction Conditions",
        description: "Review suction line configuration to minimize cavitation risk",
        priority: "medium",
        estimatedCost: "$500"
      }
    ],
    compliance: {
      "ISO 14001": { status: "compliant", lastAudit: "2023-09-15" },
      "ISO 9001": { status: "compliant", lastAudit: "2023-09-15" },
      "OSHA Standards": { status: "non-compliant", issues: ["Guard rail missing on platform"] },
      "API 610": { status: "compliant", lastAudit: "2023-09-15" }
    }
  },
  
  categories: {
    "Mechanical": [
      { name: "Shaft Alignment", status: "good", notes: "Within tolerance" },
      { name: "Coupling", status: "good", notes: "No visible wear" },
      { name: "Base Plate", status: "good", notes: "Properly secured" },
      { name: "Vibration", status: "requires attention", notes: "Above normal levels" }
    ],
    "Electrical": [
      { name: "Power Supply", status: "good", notes: "Stable voltage" },
      { name: "Motor Winding", status: "good", notes: "Insulation intact" },
      { name: "Controls", status: "good", notes: "All functions operational" },
      { name: "Safety Systems", status: "good", notes: "Emergency stops tested" }
    ],
    "Hydraulic": [
      { name: "Suction Pressure", status: "warning", notes: "Fluctuating readings" },
      { name: "Discharge Pressure", status: "good", notes: "Stable at designed levels" },
      { name: "Flow Rate", status: "good", notes: "Meeting specifications" },
      { name: "Efficiency", status: "warning", notes: "5% below rated efficiency" }
    ]
  }
}; 