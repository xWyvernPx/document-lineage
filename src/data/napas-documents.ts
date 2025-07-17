export interface DocumentMetadata {
  id: string;
  name: string;
  type: 'BRD' | 'Policy' | 'SRS' | 'Regulatory' | 'Contract' | 'Technical' | 'API' | 'Process';
  service: 'DPG' | 'Transaction Payment' | 'Internal Portal' | 'Core Banking' | 'Napas Gateway';
  size: number; // in bytes
  pages: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'completed' | 'processing' | 'failed';
  classification: {
    domain: string;
    sections: string[];
    confidence: number;
  };
  extractedTerms: {
    term: string;
    definition: string;
    category: string;
    confidence: number;
    sourceSection: string;
    context: string;
  }[];
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    confidence: number;
  }[];
}

export const napasDocuments: DocumentMetadata[] = [
  // DPG Service Documents
  {
    id: 'dpg-001',
    name: 'DPG Middleware Integration Specification v2.1.pdf',
    type: 'Technical',
    service: 'DPG',
    size: 2847392,
    pages: 45,
    uploadedAt: '2024-01-15T09:30:00Z',
    uploadedBy: 'Technical Architecture Team',
    status: 'completed',
    classification: {
      domain: 'Integration Architecture',
      sections: [
        'System Overview',
        'Message Routing',
        'Error Handling',
        'Security Protocols',
        'Performance Requirements',
        'Monitoring & Logging'
      ],
      confidence: 0.94
    },
    extractedTerms: [
      {
        term: 'Message Routing Engine',
        definition: 'Core component responsible for directing ACH messages between internal services and NAPAS based on transaction type and routing rules',
        category: 'System Component',
        confidence: 0.96,
        sourceSection: 'System Overview',
        context: 'The Message Routing Engine acts as the central hub for all ACH transaction flows, ensuring proper message delivery and transformation between NAPAS and internal banking systems.'
      },
      {
        term: 'Transaction Correlation ID',
        definition: 'Unique identifier that tracks a single ACH transaction across all system components and services throughout its lifecycle',
        category: 'Data Element',
        confidence: 0.93,
        sourceSection: 'Message Routing',
        context: 'Each ACH transaction is assigned a correlation ID at initiation to enable end-to-end tracking and reconciliation across DPG, payment services, and core banking.'
      },
      {
        term: 'Circuit Breaker Pattern',
        definition: 'Fault tolerance mechanism that prevents cascading failures by temporarily blocking requests to failing downstream services',
        category: 'Design Pattern',
        confidence: 0.89,
        sourceSection: 'Error Handling',
        context: 'DPG implements circuit breakers for NAPAS connectivity to maintain system stability during network issues or NAPAS maintenance windows.'
      },
      {
        term: 'Message Transformation Layer',
        definition: 'Service component that converts internal bank message formats to NAPAS-compliant ISO 20022 XML structures',
        category: 'System Component',
        confidence: 0.91,
        sourceSection: 'Message Routing',
        context: 'All outbound ACH messages pass through the transformation layer to ensure compliance with NAPAS message standards and field mappings.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'dpg_middleware',
        tableName: 'message_routing',
        columnName: 'correlation_id',
        confidence: 0.95
      },
      {
        schemaName: 'dpg_middleware',
        tableName: 'circuit_breaker_state',
        columnName: 'service_endpoint',
        confidence: 0.88
      }
    ]
  },
  {
    id: 'dpg-002',
    name: 'NAPAS Connectivity Requirements and SLA v1.3.docx',
    type: 'SRS',
    service: 'DPG',
    size: 1456789,
    pages: 28,
    uploadedAt: '2024-01-14T14:20:00Z',
    uploadedBy: 'Infrastructure Team',
    status: 'completed',
    classification: {
      domain: 'Infrastructure Requirements',
      sections: [
        'Network Connectivity',
        'Security Requirements',
        'Performance SLA',
        'Disaster Recovery',
        'Monitoring Requirements'
      ],
      confidence: 0.92
    },
    extractedTerms: [
      {
        term: 'NAPAS Dedicated Line',
        definition: 'Secure, dedicated network connection between bank infrastructure and NAPAS data centers with guaranteed bandwidth and latency',
        category: 'Infrastructure',
        confidence: 0.94,
        sourceSection: 'Network Connectivity',
        context: 'Banks must maintain redundant dedicated lines to NAPAS with minimum 10Mbps bandwidth and sub-100ms latency for real-time ACH processing.'
      },
      {
        term: 'Message Processing SLA',
        definition: 'Service level agreement requiring 99.9% uptime and maximum 2-second response time for ACH message processing',
        category: 'Performance Metric',
        confidence: 0.87,
        sourceSection: 'Performance SLA',
        context: 'DPG middleware must meet strict SLA requirements to ensure timely ACH transaction processing and settlement within NAPAS operating windows.'
      },
      {
        term: 'HSM Integration',
        definition: 'Hardware Security Module integration for cryptographic operations including message signing and encryption for NAPAS communication',
        category: 'Security Component',
        confidence: 0.91,
        sourceSection: 'Security Requirements',
        context: 'All NAPAS messages require HSM-based digital signatures and encryption to ensure message integrity and non-repudiation.'
      }
    ]
  },

  // Transaction Payment Service Documents
  {
    id: 'tps-001',
    name: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
    type: 'BRD',
    service: 'Transaction Payment',
    size: 3245678,
    pages: 67,
    uploadedAt: '2024-01-16T10:15:00Z',
    uploadedBy: 'Payment Product Team',
    status: 'completed',
    classification: {
      domain: 'Payment Processing',
      sections: [
        'Business Overview',
        'Payment Types',
        'Workflow Requirements',
        'Risk Management',
        'Compliance Requirements',
        'Integration Points'
      ],
      confidence: 0.95
    },
    extractedTerms: [
      {
        term: 'Payment Orchestration Engine',
        definition: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services',
        category: 'System Component',
        confidence: 0.96,
        sourceSection: 'Business Overview',
        context: 'The orchestration engine manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions processed through NAPAS.'
      },
      {
        term: 'Same-Day ACH',
        definition: 'Expedited ACH processing service that enables same-business-day settlement for qualifying transactions through NAPAS infrastructure',
        category: 'Payment Type',
        confidence: 0.93,
        sourceSection: 'Payment Types',
        context: 'Same-day ACH requires special handling with earlier cutoff times and higher fees, processed through dedicated NAPAS same-day settlement windows.'
      },
      {
        term: 'Payment Routing Rules',
        definition: 'Business logic that determines optimal payment path based on transaction amount, type, destination bank, and cost optimization',
        category: 'Business Rule',
        confidence: 0.89,
        sourceSection: 'Workflow Requirements',
        context: 'Routing rules evaluate factors like transaction fees, processing speed, and success rates to select between NAPAS and alternative payment rails.'
      },
      {
        term: 'Transaction Enrichment',
        definition: 'Process of adding additional data elements to ACH transactions including risk scores, customer context, and regulatory flags',
        category: 'Process',
        confidence: 0.88,
        sourceSection: 'Workflow Requirements',
        context: 'Payment transactions are enriched with customer data, risk assessments, and compliance flags before submission to NAPAS for processing.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'payment_orchestration',
        tableName: 'payment_routes',
        columnName: 'routing_rule_id',
        confidence: 0.92
      },
      {
        schemaName: 'payment_orchestration',
        tableName: 'transaction_enrichment',
        columnName: 'risk_score',
        confidence: 0.85
      }
    ]
  },
  {
    id: 'tps-002',
    name: 'Third Party Payment Provider Integration Guide v2.5.pdf',
    type: 'Technical',
    service: 'Transaction Payment',
    size: 2156789,
    pages: 52,
    uploadedAt: '2024-01-13T16:45:00Z',
    uploadedBy: 'Integration Team',
    status: 'completed',
    classification: {
      domain: 'Third Party Integration',
      sections: [
        'Provider Onboarding',
        'API Specifications',
        'Message Formats',
        'Error Handling',
        'Reconciliation Process'
      ],
      confidence: 0.91
    },
    extractedTerms: [
      {
        term: 'Provider Certification Process',
        definition: 'Formal validation process ensuring third-party payment providers meet technical and compliance standards for ACH processing',
        category: 'Process',
        confidence: 0.94,
        sourceSection: 'Provider Onboarding',
        context: 'New payment providers must complete certification including API testing, security validation, and NAPAS connectivity verification before production use.'
      },
      {
        term: 'Webhook Notification System',
        definition: 'Real-time event notification mechanism that informs payment orchestration of transaction status changes from third-party providers',
        category: 'Integration Pattern',
        confidence: 0.87,
        sourceSection: 'API Specifications',
        context: 'Providers send webhook notifications for payment status updates, enabling real-time transaction tracking and customer notification.'
      }
    ]
  },

  // Internal Portal Documents
  {
    id: 'portal-001',
    name: 'Business User Portal Requirements v1.8.docx',
    type: 'BRD',
    service: 'Internal Portal',
    size: 1876543,
    pages: 34,
    uploadedAt: '2024-01-15T11:30:00Z',
    uploadedBy: 'Business Operations Team',
    status: 'completed',
    classification: {
      domain: 'User Interface',
      sections: [
        'User Roles',
        'Dashboard Requirements',
        'Transaction Monitoring',
        'Reporting Features',
        'Access Control'
      ],
      confidence: 0.88
    },
    extractedTerms: [
      {
        term: 'Transaction Dashboard',
        definition: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails',
        category: 'User Interface',
        confidence: 0.92,
        sourceSection: 'Dashboard Requirements',
        context: 'Business users require comprehensive dashboards to monitor ACH transaction flows, identify issues, and track performance metrics in real-time.'
      },
      {
        term: 'Exception Management Workflow',
        definition: 'Business process for handling failed or rejected ACH transactions including investigation, resolution, and customer communication',
        category: 'Business Process',
        confidence: 0.89,
        sourceSection: 'Transaction Monitoring',
        context: 'Portal provides tools for business users to research transaction failures, initiate corrections, and communicate with customers about ACH issues.'
      },
      {
        term: 'Regulatory Reporting Module',
        definition: 'Portal component that generates compliance reports for ACH transaction volumes, suspicious activity, and regulatory submissions',
        category: 'System Component',
        confidence: 0.86,
        sourceSection: 'Reporting Features',
        context: 'Business users generate various regulatory reports including BSA/AML reporting, transaction volume reports, and NAPAS settlement reconciliation.'
      }
    ]
  },
  {
    id: 'portal-002',
    name: 'ACH Transaction Monitoring User Guide v2.0.pdf',
    type: 'Process',
    service: 'Internal Portal',
    size: 1234567,
    pages: 28,
    uploadedAt: '2024-01-12T09:15:00Z',
    uploadedBy: 'Training Team',
    status: 'completed',
    classification: {
      domain: 'User Training',
      sections: [
        'Portal Navigation',
        'Transaction Search',
        'Status Monitoring',
        'Report Generation',
        'Troubleshooting'
      ],
      confidence: 0.85
    },
    extractedTerms: [
      {
        term: 'Transaction Lifecycle View',
        definition: 'Portal feature that displays complete ACH transaction journey from initiation through NAPAS processing to final settlement',
        category: 'User Interface',
        confidence: 0.91,
        sourceSection: 'Status Monitoring',
        context: 'Users can track individual ACH transactions through each processing stage including DPG routing, NAPAS submission, and core banking settlement.'
      },
      {
        term: 'Bulk Transaction Upload',
        definition: 'Portal functionality allowing business users to upload multiple ACH transactions via CSV or Excel files for batch processing',
        category: 'Feature',
        confidence: 0.88,
        sourceSection: 'Portal Navigation',
        context: 'Business departments can upload large volumes of ACH transactions for processing, with validation and error reporting before NAPAS submission.'
      }
    ]
  },

  // Core Banking Documents
  {
    id: 'core-001',
    name: 'Core Banking ACH Settlement Integration v4.2.pdf',
    type: 'Technical',
    service: 'Core Banking',
    size: 3567890,
    pages: 78,
    uploadedAt: '2024-01-16T08:45:00Z',
    uploadedBy: 'Core Banking Team',
    status: 'completed',
    classification: {
      domain: 'Settlement Processing',
      sections: [
        'Settlement Architecture',
        'Account Processing',
        'Reconciliation Logic',
        'Exception Handling',
        'Audit Trail',
        'Performance Optimization'
      ],
      confidence: 0.96
    },
    extractedTerms: [
      {
        term: 'Settlement Engine',
        definition: 'Core banking component responsible for executing final account debits and credits for ACH transactions cleared through NAPAS',
        category: 'System Component',
        confidence: 0.97,
        sourceSection: 'Settlement Architecture',
        context: 'The settlement engine processes NAPAS settlement files to update customer accounts, ensuring accurate and timely posting of ACH transactions.'
      },
      {
        term: 'Nostro Account Reconciliation',
        definition: 'Process of matching bank\'s NAPAS settlement account movements with internal records to ensure accurate cash position',
        category: 'Process',
        confidence: 0.94,
        sourceSection: 'Reconciliation Logic',
        context: 'Daily reconciliation of nostro account ensures all NAPAS settlements are properly recorded and any discrepancies are identified and resolved.'
      },
      {
        term: 'Real-Time Gross Settlement',
        definition: 'Immediate settlement mechanism for high-value ACH transactions processed individually rather than in batches',
        category: 'Settlement Type',
        confidence: 0.91,
        sourceSection: 'Settlement Architecture',
        context: 'RTGS processing ensures immediate finality for large-value ACH transactions, reducing settlement risk and improving liquidity management.'
      },
      {
        term: 'Settlement Cut-off Time',
        definition: 'Specific time deadline for ACH transaction submission to ensure same-day settlement through NAPAS processing windows',
        category: 'Business Rule',
        confidence: 0.89,
        sourceSection: 'Settlement Architecture',
        context: 'Transactions submitted after cut-off times are queued for next business day processing, affecting customer expectations and cash flow.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'core_banking',
        tableName: 'settlement_transactions',
        columnName: 'napas_settlement_id',
        confidence: 0.96
      },
      {
        schemaName: 'core_banking',
        tableName: 'nostro_reconciliation',
        columnName: 'settlement_amount',
        confidence: 0.93
      }
    ]
  },
  {
    id: 'core-002',
    name: 'ACH Exception Processing Procedures v1.9.docx',
    type: 'Process',
    service: 'Core Banking',
    size: 987654,
    pages: 22,
    uploadedAt: '2024-01-14T13:20:00Z',
    uploadedBy: 'Operations Team',
    status: 'completed',
    classification: {
      domain: 'Exception Management',
      sections: [
        'Exception Types',
        'Investigation Process',
        'Resolution Procedures',
        'Customer Communication',
        'Escalation Matrix'
      ],
      confidence: 0.87
    },
    extractedTerms: [
      {
        term: 'Return Code Processing',
        definition: 'Automated handling of ACH return codes received from NAPAS indicating transaction rejections or failures',
        category: 'Process',
        confidence: 0.93,
        sourceSection: 'Exception Types',
        context: 'Core banking system processes NAPAS return codes to reverse transactions, update account status, and trigger customer notifications.'
      },
      {
        term: 'Insufficient Funds Handling',
        definition: 'Procedure for managing ACH debits that cannot be processed due to inadequate account balance',
        category: 'Exception Type',
        confidence: 0.90,
        sourceSection: 'Exception Types',
        context: 'NSF transactions are returned to NAPAS with appropriate return codes and may trigger overdraft processing or account restrictions.'
      }
    ]
  },

  // NAPAS Gateway Documents
  {
    id: 'napas-001',
    name: 'NAPAS ACH Message Format Specification v5.1.pdf',
    type: 'Technical',
    service: 'Napas Gateway',
    size: 4567890,
    pages: 156,
    uploadedAt: '2024-01-15T07:30:00Z',
    uploadedBy: 'NAPAS Integration Team',
    status: 'completed',
    classification: {
      domain: 'Message Standards',
      sections: [
        'ISO 20022 Implementation',
        'Message Types',
        'Field Specifications',
        'Validation Rules',
        'Error Codes',
        'Sample Messages'
      ],
      confidence: 0.98
    },
    extractedTerms: [
      {
        term: 'ISO 20022 XML Schema',
        definition: 'International standard message format used by NAPAS for ACH transaction messaging, ensuring interoperability across financial institutions',
        category: 'Technical Standard',
        confidence: 0.97,
        sourceSection: 'ISO 20022 Implementation',
        context: 'All NAPAS ACH messages must conform to ISO 20022 XML schema definitions, including proper namespace declarations and field validations.'
      },
      {
        term: 'Customer Credit Transfer',
        definition: 'NAPAS message type (pacs.008) used for initiating ACH credit transactions from originating bank to beneficiary bank',
        category: 'Message Type',
        confidence: 0.95,
        sourceSection: 'Message Types',
        context: 'Credit transfer messages contain originator details, beneficiary information, and payment instructions for NAPAS processing.'
      },
      {
        term: 'Payment Status Report',
        definition: 'NAPAS response message (pacs.002) providing transaction processing status and any error conditions',
        category: 'Message Type',
        confidence: 0.94,
        sourceSection: 'Message Types',
        context: 'Status reports inform originating banks of transaction acceptance, rejection, or processing delays within NAPAS infrastructure.'
      },
      {
        term: 'Business Identifier Code',
        definition: 'Unique bank identification code used in NAPAS messages to identify financial institutions in ACH transactions',
        category: 'Data Element',
        confidence: 0.92,
        sourceSection: 'Field Specifications',
        context: 'BIC codes ensure proper routing of ACH messages between banks through NAPAS, following international banking standards.'
      },
      {
        term: 'Settlement Instruction',
        definition: 'NAPAS message component specifying how and when ACH transaction settlement should occur',
        category: 'Message Component',
        confidence: 0.90,
        sourceSection: 'Field Specifications',
        context: 'Settlement instructions include settlement date, settlement method, and clearing system identification for proper NAPAS processing.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'napas_gateway',
        tableName: 'message_definitions',
        columnName: 'iso20022_schema_version',
        confidence: 0.97
      },
      {
        schemaName: 'napas_gateway',
        tableName: 'institution_codes',
        columnName: 'bic_code',
        confidence: 0.95
      }
    ]
  },
  {
    id: 'napas-002',
    name: 'NAPAS API Integration Guide v3.4.pdf',
    type: 'API',
    service: 'Napas Gateway',
    size: 2345678,
    pages: 89,
    uploadedAt: '2024-01-13T15:10:00Z',
    uploadedBy: 'API Development Team',
    status: 'completed',
    classification: {
      domain: 'API Integration',
      sections: [
        'Authentication',
        'Endpoint Specifications',
        'Request/Response Formats',
        'Rate Limiting',
        'Error Handling',
        'Testing Procedures'
      ],
      confidence: 0.93
    },
    extractedTerms: [
      {
        term: 'OAuth 2.0 Authentication',
        definition: 'Security protocol used for authenticating API requests to NAPAS services, ensuring secure access to ACH processing functions',
        category: 'Security Protocol',
        confidence: 0.96,
        sourceSection: 'Authentication',
        context: 'Banks must implement OAuth 2.0 client credentials flow to obtain access tokens for NAPAS API authentication and authorization.'
      },
      {
        term: 'API Rate Limiting',
        definition: 'NAPAS-imposed restrictions on the number of API requests per time period to ensure system stability and fair usage',
        category: 'Technical Constraint',
        confidence: 0.91,
        sourceSection: 'Rate Limiting',
        context: 'NAPAS enforces rate limits of 1000 requests per minute per institution to prevent system overload and ensure equitable access.'
      },
      {
        term: 'Idempotency Key',
        definition: 'Unique identifier included in API requests to prevent duplicate transaction processing in case of network retries',
        category: 'Technical Pattern',
        confidence: 0.89,
        sourceSection: 'Request/Response Formats',
        context: 'Each ACH transaction submission must include an idempotency key to ensure duplicate requests do not result in multiple payments.'
      }
    ]
  },
  {
    id: 'napas-003',
    name: 'NAPAS Compliance and Regulatory Requirements v2.7.pdf',
    type: 'Regulatory',
    service: 'Napas Gateway',
    size: 1987654,
    pages: 43,
    uploadedAt: '2024-01-11T12:00:00Z',
    uploadedBy: 'Compliance Team',
    status: 'completed',
    classification: {
      domain: 'Regulatory Compliance',
      sections: [
        'BSA/AML Requirements',
        'Data Privacy',
        'Audit Requirements',
        'Reporting Obligations',
        'Sanctions Screening'
      ],
      confidence: 0.94
    },
    extractedTerms: [
      {
        term: 'Suspicious Activity Monitoring',
        definition: 'Automated surveillance system that identifies potentially suspicious ACH transactions for BSA/AML compliance reporting',
        category: 'Compliance Process',
        confidence: 0.95,
        sourceSection: 'BSA/AML Requirements',
        context: 'Banks must monitor ACH transactions processed through NAPAS for suspicious patterns and file SARs when required by regulation.'
      },
      {
        term: 'OFAC Sanctions Screening',
        definition: 'Real-time screening of ACH transaction parties against Office of Foreign Assets Control sanctions lists',
        category: 'Compliance Process',
        confidence: 0.93,
        sourceSection: 'Sanctions Screening',
        context: 'All ACH transactions must be screened against OFAC lists before NAPAS submission to ensure compliance with sanctions regulations.'
      },
      {
        term: 'Data Retention Policy',
        definition: 'Regulatory requirement to maintain ACH transaction records and audit trails for specified time periods',
        category: 'Compliance Requirement',
        confidence: 0.88,
        sourceSection: 'Audit Requirements',
        context: 'Banks must retain NAPAS ACH transaction data for minimum 5 years to support regulatory examinations and audit requirements.'
      }
    ]
  }
];

// Additional NAPAS ACH Business Documents
export const additionalNapasDocuments: DocumentMetadata[] = [
  // Operational Procedures
  {
    id: 'ops-001',
    name: 'ACH Transaction Processing Operations Manual v2.3.pdf',
    type: 'Process',
    service: 'Transaction Payment',
    size: 3124567,
    pages: 89,
    uploadedAt: '2024-01-17T08:30:00Z',
    uploadedBy: 'Operations Team',
    status: 'completed',
    classification: {
      domain: 'Operational Procedures',
      sections: [
        'Daily Processing Schedule',
        'Cutoff Times',
        'Exception Handling',
        'Reconciliation Procedures',
        'Emergency Procedures',
        'Staff Training Requirements'
      ],
      confidence: 0.91
    },
    extractedTerms: [
      {
        term: 'Processing Cutoff Time',
        definition: 'Specific time each business day when ACH transactions must be submitted to NAPAS for same-day processing and settlement',
        category: 'Operational Rule',
        confidence: 0.94,
        sourceSection: 'Cutoff Times',
        context: 'Standard ACH transactions must be submitted to NAPAS by 2:00 PM local time for same-day processing, while same-day ACH requires 10:30 AM submission.'
      },
      {
        term: 'Exception Processing Window',
        definition: 'Designated time period for handling returned ACH transactions, corrections, and adjustments through NAPAS',
        category: 'Operational Process',
        confidence: 0.89,
        sourceSection: 'Exception Handling',
        context: 'Exception processing occurs between 8:00 AM and 4:00 PM daily, allowing banks to handle returned items and submit corrections to NAPAS.'
      },
      {
        term: 'End-of-Day Reconciliation',
        definition: 'Daily process of matching NAPAS settlement files with internal transaction records to ensure accuracy',
        category: 'Operational Process',
        confidence: 0.92,
        sourceSection: 'Reconciliation Procedures',
        context: 'Operations staff must complete end-of-day reconciliation by 6:00 PM to identify and resolve any discrepancies before next business day processing.'
      },
      {
        term: 'Emergency Processing Protocol',
        definition: 'Contingency procedures for handling ACH processing during system outages or NAPAS maintenance windows',
        category: 'Operational Procedure',
        confidence: 0.87,
        sourceSection: 'Emergency Procedures',
        context: 'Emergency protocols include manual transaction processing, alternative routing through backup systems, and customer communication procedures.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'operations_manual',
        tableName: 'processing_schedules',
        columnName: 'cutoff_time',
        confidence: 0.94
      },
      {
        schemaName: 'operations_manual',
        tableName: 'exception_processing',
        columnName: 'processing_window',
        confidence: 0.89
      }
    ]
  },
  {
    id: 'ops-002',
    name: 'ACH Risk Management and Fraud Prevention Policy v1.9.docx',
    type: 'Policy',
    service: 'Transaction Payment',
    size: 1876543,
    pages: 45,
    uploadedAt: '2024-01-16T14:20:00Z',
    uploadedBy: 'Risk Management Team',
    status: 'completed',
    classification: {
      domain: 'Risk Management',
      sections: [
        'Fraud Detection',
        'Transaction Limits',
        'Customer Verification',
        'Monitoring Systems',
        'Incident Response',
        'Regulatory Compliance'
      ],
      confidence: 0.93
    },
    extractedTerms: [
      {
        term: 'Real-Time Fraud Scoring',
        definition: 'Automated system that evaluates ACH transactions for fraud risk using machine learning algorithms and historical patterns',
        category: 'Risk Management Tool',
        confidence: 0.95,
        sourceSection: 'Fraud Detection',
        context: 'Each ACH transaction is scored in real-time based on factors including amount, frequency, customer history, and transaction patterns before NAPAS submission.'
      },
      {
        term: 'Velocity Limits',
        definition: 'Transaction frequency and amount restrictions applied to ACH transactions to prevent fraud and comply with regulatory limits',
        category: 'Risk Control',
        confidence: 0.91,
        sourceSection: 'Transaction Limits',
        context: 'Velocity limits include daily transaction counts, maximum amounts per transaction, and aggregate daily limits based on customer risk profiles.'
      },
      {
        term: 'Account Validation Service',
        definition: 'Real-time verification service that confirms account ownership and status before processing ACH transactions',
        category: 'Risk Management Tool',
        confidence: 0.88,
        sourceSection: 'Customer Verification',
        context: 'Account validation occurs before NAPAS submission to ensure the destination account exists and is in good standing.'
      },
      {
        term: 'Suspicious Activity Alert',
        definition: 'Automated notification system that flags potentially fraudulent ACH transactions for manual review',
        category: 'Risk Management Process',
        confidence: 0.90,
        sourceSection: 'Monitoring Systems',
        context: 'Alerts are generated for transactions exceeding risk thresholds, unusual patterns, or matches against known fraud indicators.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'risk_management',
        tableName: 'fraud_scores',
        columnName: 'risk_score',
        confidence: 0.95
      },
      {
        schemaName: 'risk_management',
        tableName: 'velocity_limits',
        columnName: 'daily_limit',
        confidence: 0.91
      }
    ]
  },
  {
    id: 'ops-003',
    name: 'Customer ACH Onboarding and Setup Guide v3.1.pdf',
    type: 'Process',
    service: 'Internal Portal',
    size: 2345678,
    pages: 67,
    uploadedAt: '2024-01-15T16:45:00Z',
    uploadedBy: 'Customer Success Team',
    status: 'completed',
    classification: {
      domain: 'Customer Onboarding',
      sections: [
        'Onboarding Workflow',
        'Documentation Requirements',
        'Testing Procedures',
        'Go-Live Process',
        'Training Materials',
        'Support Procedures'
      ],
      confidence: 0.89
    },
    extractedTerms: [
      {
        term: 'ACH Origination Agreement',
        definition: 'Legal contract between bank and customer authorizing ACH transaction origination and establishing liability terms',
        category: 'Legal Document',
        confidence: 0.94,
        sourceSection: 'Documentation Requirements',
        context: 'All customers must sign ACH origination agreements before processing transactions, establishing rights and responsibilities for both parties.'
      },
      {
        term: 'Test Transaction Validation',
        definition: 'Process of submitting sample ACH transactions to NAPAS test environment to verify customer setup and connectivity',
        category: 'Testing Process',
        confidence: 0.91,
        sourceSection: 'Testing Procedures',
        context: 'Customers must successfully process test transactions through NAPAS test environment before being approved for production ACH processing.'
      },
      {
        term: 'Customer Risk Assessment',
        definition: 'Evaluation of customer business type, transaction volumes, and risk factors to determine ACH processing limits and monitoring requirements',
        category: 'Risk Assessment',
        confidence: 0.87,
        sourceSection: 'Onboarding Workflow',
        context: 'Risk assessment determines appropriate transaction limits, monitoring frequency, and additional verification requirements for each customer.'
      },
      {
        term: 'Go-Live Checklist',
        definition: 'Comprehensive list of requirements that must be completed before customer can begin production ACH processing',
        category: 'Process Checklist',
        confidence: 0.89,
        sourceSection: 'Go-Live Process',
        context: 'Go-live checklist includes completed agreements, successful testing, risk assessment approval, and system configuration verification.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'customer_onboarding',
        tableName: 'origination_agreements',
        columnName: 'agreement_status',
        confidence: 0.94
      },
      {
        schemaName: 'customer_onboarding',
        tableName: 'risk_assessments',
        columnName: 'risk_level',
        confidence: 0.87
      }
    ]
  },
  {
    id: 'ops-004',
    name: 'ACH Transaction Types and Processing Rules v2.8.pdf',
    type: 'Technical',
    service: 'Transaction Payment',
    size: 2987654,
    pages: 73,
    uploadedAt: '2024-01-14T11:15:00Z',
    uploadedBy: 'Product Development Team',
    status: 'completed',
    classification: {
      domain: 'Transaction Processing',
      sections: [
        'ACH Transaction Types',
        'Processing Rules',
        'Settlement Timelines',
        'Return Codes',
        'Fee Structures',
        'Compliance Requirements'
      ],
      confidence: 0.96
    },
    extractedTerms: [
      {
        term: 'PPD (Prearranged Payment and Deposit)',
        definition: 'ACH transaction type for consumer accounts, including direct deposits, bill payments, and recurring transfers',
        category: 'Transaction Type',
        confidence: 0.97,
        sourceSection: 'ACH Transaction Types',
        context: 'PPD transactions are used for consumer accounts and require explicit authorization from the account holder for recurring payments.'
      },
      {
        term: 'CCD (Corporate Credit or Debit)',
        definition: 'ACH transaction type for business accounts, typically used for B2B payments, payroll, and corporate transfers',
        category: 'Transaction Type',
        confidence: 0.95,
        sourceSection: 'ACH Transaction Types',
        context: 'CCD transactions are designed for business-to-business payments and require different authorization procedures than consumer transactions.'
      },
      {
        term: 'Return Code R01',
        definition: 'NAPAS return code indicating insufficient funds in the originator account for ACH transaction processing',
        category: 'Return Code',
        confidence: 0.93,
        sourceSection: 'Return Codes',
        context: 'R01 returns occur when the originating account lacks sufficient funds to complete the ACH transaction and must be handled within 2 business days.'
      },
      {
        term: 'Same-Day ACH Fee',
        definition: 'Additional processing fee charged by NAPAS for expedited same-day ACH transaction processing and settlement',
        category: 'Fee Structure',
        confidence: 0.89,
        sourceSection: 'Fee Structures',
        context: 'Same-day ACH transactions incur additional fees of $0.052 per transaction for credits and $0.034 for debits, in addition to standard processing fees.'
      },
      {
        term: 'ACH Network Rules',
        definition: 'Comprehensive set of rules and regulations governing ACH transaction processing established by NACHA and enforced by NAPAS',
        category: 'Regulatory Framework',
        confidence: 0.92,
        sourceSection: 'Compliance Requirements',
        context: 'ACH Network Rules define authorization requirements, processing timelines, return procedures, and compliance obligations for all participants.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'transaction_types',
        tableName: 'ach_codes',
        columnName: 'transaction_code',
        confidence: 0.97
      },
      {
        schemaName: 'transaction_types',
        tableName: 'return_codes',
        columnName: 'return_code',
        confidence: 0.93
      }
    ]
  },
  {
    id: 'ops-005',
    name: 'NAPAS Settlement and Reconciliation Procedures v2.4.docx',
    type: 'Process',
    service: 'Core Banking',
    size: 2156789,
    pages: 58,
    uploadedAt: '2024-01-13T13:30:00Z',
    uploadedBy: 'Settlement Operations Team',
    status: 'completed',
    classification: {
      domain: 'Settlement Processing',
      sections: [
        'Settlement Timelines',
        'Reconciliation Process',
        'Exception Handling',
        'Reporting Requirements',
        'Audit Procedures',
        'System Integration'
      ],
      confidence: 0.94
    },
    extractedTerms: [
      {
        term: 'Settlement File Processing',
        definition: 'Automated process of receiving and processing NAPAS settlement files to update customer accounts and nostro positions',
        category: 'Settlement Process',
        confidence: 0.96,
        sourceSection: 'Settlement Timelines',
        context: 'NAPAS settlement files are received at 8:00 AM daily and must be processed within 2 hours to ensure timely account updates and reconciliation.'
      },
      {
        term: 'Nostro Account Balancing',
        definition: 'Daily process of reconciling bank\'s NAPAS settlement account to ensure accurate cash position and identify discrepancies',
        category: 'Reconciliation Process',
        confidence: 0.93,
        sourceSection: 'Reconciliation Process',
        context: 'Nostro account balancing compares internal settlement records with NAPAS settlement files to ensure all transactions are properly accounted for.'
      },
      {
        term: 'Settlement Exception Report',
        definition: 'Daily report identifying ACH transactions that failed to settle or require manual intervention',
        category: 'Operational Report',
        confidence: 0.90,
        sourceSection: 'Exception Handling',
        context: 'Exception reports are generated daily at 10:00 AM and must be reviewed by settlement operations staff within 4 hours.'
      },
      {
        term: 'Settlement Audit Trail',
        definition: 'Comprehensive record of all settlement activities including file processing, account updates, and reconciliation results',
        category: 'Audit Requirement',
        confidence: 0.88,
        sourceSection: 'Audit Procedures',
        context: 'Settlement audit trails must be maintained for 7 years to support regulatory examinations and internal audit requirements.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'settlement_processing',
        tableName: 'settlement_files',
        columnName: 'processing_status',
        confidence: 0.96
      },
      {
        schemaName: 'settlement_processing',
        tableName: 'nostro_balances',
        columnName: 'balance_amount',
        confidence: 0.93
      }
    ]
  },
  {
    id: 'ops-006',
    name: 'ACH System Performance Monitoring and Optimization v2.1.pdf',
    type: 'Technical',
    service: 'DPG',
    size: 1876543,
    pages: 42,
    uploadedAt: '2024-01-12T15:45:00Z',
    uploadedBy: 'Performance Engineering Team',
    status: 'completed',
    classification: {
      domain: 'System Performance',
      sections: [
        'Performance Metrics',
        'Monitoring Tools',
        'Capacity Planning',
        'Optimization Strategies',
        'Alert Thresholds',
        'Incident Response'
      ],
      confidence: 0.91
    },
    extractedTerms: [
      {
        term: 'Transaction Processing Latency',
        definition: 'Time measurement from ACH transaction submission to NAPAS response, with target of sub-500ms for 95th percentile',
        category: 'Performance Metric',
        confidence: 0.94,
        sourceSection: 'Performance Metrics',
        context: 'Processing latency is measured end-to-end from customer submission through DPG routing to NAPAS response and back to customer.'
      },
      {
        term: 'System Throughput Capacity',
        definition: 'Maximum number of ACH transactions per second that the system can process while maintaining performance standards',
        category: 'Performance Metric',
        confidence: 0.92,
        sourceSection: 'Capacity Planning',
        context: 'Current system capacity is 1000 TPS with ability to scale to 5000 TPS during peak processing periods.'
      },
      {
        term: 'Performance Alert Threshold',
        definition: 'Configurable limits that trigger alerts when system performance metrics exceed acceptable ranges',
        category: 'Monitoring Parameter',
        confidence: 0.89,
        sourceSection: 'Alert Thresholds',
        context: 'Performance alerts are triggered when latency exceeds 1 second, error rates exceed 1%, or throughput drops below 80% of capacity.'
      },
      {
        term: 'Auto-Scaling Configuration',
        definition: 'Automated system scaling rules that adjust processing capacity based on transaction volume and performance metrics',
        category: 'Performance Optimization',
        confidence: 0.87,
        sourceSection: 'Optimization Strategies',
        context: 'Auto-scaling rules automatically provision additional processing resources when transaction volumes exceed 80% of current capacity.'
      }
    ],
    schemaMapping: [
      {
        schemaName: 'performance_monitoring',
        tableName: 'latency_metrics',
        columnName: 'processing_time_ms',
        confidence: 0.94
      },
      {
        schemaName: 'performance_monitoring',
        tableName: 'throughput_metrics',
        columnName: 'transactions_per_second',
        confidence: 0.92
      }
    ]
  }
];

// Combine existing and additional documents
export const allNapasDocuments: DocumentMetadata[] = [
  ...napasDocuments,
  ...additionalNapasDocuments
];

// Helper function to get documents by service
export const getDocumentsByService = (service: string) => {
  return allNapasDocuments.filter(doc => doc.service === service);
};

// Helper function to get all unique terms across documents
export const getAllTerms = () => {
  const allTerms = allNapasDocuments.flatMap(doc => doc.extractedTerms);
  return allTerms.reduce((unique, term) => {
    if (!unique.find(t => t.term === term.term)) {
      unique.push(term);
    }
    return unique;
  }, [] as typeof allTerms);
};

// Helper function to get documents by type
export const getDocumentsByType = (type: string) => {
  return allNapasDocuments.filter(doc => doc.type === type);
};

// Statistics
export const getDocumentStats = () => {
  return {
    totalDocuments: allNapasDocuments.length,
    totalTerms: getAllTerms().length,
    serviceBreakdown: {
      'DPG': getDocumentsByService('DPG').length,
      'Transaction Payment': getDocumentsByService('Transaction Payment').length,
      'Internal Portal': getDocumentsByService('Internal Portal').length,
      'Core Banking': getDocumentsByService('Core Banking').length,
      'Napas Gateway': getDocumentsByService('Napas Gateway').length,
    },
    typeBreakdown: {
      'Technical': getDocumentsByType('Technical').length,
      'BRD': getDocumentsByType('BRD').length,
      'Process': getDocumentsByType('Process').length,
      'SRS': getDocumentsByType('SRS').length,
      'API': getDocumentsByType('API').length,
      'Regulatory': getDocumentsByType('Regulatory').length,
    }
  };
};