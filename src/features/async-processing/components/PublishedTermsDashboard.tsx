import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Database, 
  Calendar,
  User,
  ChevronDown,
  Eye,
  ExternalLink,
  BookOpen,
  GitBranch,
  Star,
  Tag,
  Network,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { DataLineageViewer } from '../../lineage/components/DataLineageViewer';

interface PublishedTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  domain: string;
  documentName: string;
  documentId: string;
  sourceSection: string;
  publishedAt: string;
  publishedBy: string;
  confidence: number;
  isPreferred: boolean;
  status: 'preferred' | 'pending' | 'published' | 'flagged';
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
  };
  relatedTerms: string[];
  tags: string[];
  lastUpdated: string;
  updatedBy: string;
}

// NAPAS ACH Business Terms Data
const napasPublishedTerms: PublishedTerm[] = [
  {
    id: '1',
    term: 'Message Routing Engine',
    definition: 'Core component responsible for directing ACH messages between internal services and NAPAS based on transaction type and routing rules. Ensures proper message delivery and transformation between NAPAS and internal banking systems.',
    category: 'System Component',
    domain: 'Integration Architecture',
    documentName: 'DPG Middleware Integration Specification v2.1.pdf',
    documentId: 'dpg-001',
    sourceSection: 'Section 3.1 – System Architecture',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Technical Architecture Team',
    confidence: 0.96,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'routing_config',
    },
    relatedTerms: ['Message Router', 'Transaction Router', 'ACH Router', 'Payment Router'],
    tags: ['dpg', 'routing', 'preferred', 'middleware'],
    lastUpdated: '2024-01-16T15:30:00Z',
    updatedBy: 'Technical Architecture Team'
  },
  {
    id: '2',
    term: 'Transaction Correlation ID',
    definition: 'Unique identifier that tracks a single ACH transaction across all system components and services throughout its lifecycle. Enables end-to-end tracking and reconciliation across DPG, payment services, and core banking.',
    category: 'Data Element',
    domain: 'Message Tracking',
    documentName: 'DPG Middleware Integration Specification v2.1.pdf',
    documentId: 'dpg-001',
    sourceSection: 'Section 4.2 – Message Tracking',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Technical Architecture Team',
    confidence: 0.93,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'correlation_id',
    },
    relatedTerms: ['Trace ID', 'Transaction ID', 'Correlation Key', 'ACH Trace Number'],
    tags: ['tracking', 'correlation', 'dpg'],
    lastUpdated: '2024-01-16T14:20:00Z',
    updatedBy: 'Technical Architecture Team'
  },
  {
    id: '3',
    term: 'Clearing Cycle',
    definition: 'Scheduled time window during which NAPAS processes and settles ACH transactions. Banks must submit transactions within specific clearing cycles to ensure same-day or next-day settlement.',
    category: 'Operational Process',
    domain: 'Settlement Processing',
    documentName: 'DPG Middleware Integration Specification v2.1.pdf',
    documentId: 'dpg-001',
    sourceSection: 'Section 6.2 – Processing Schedule',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Technical Architecture Team',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'processing_schedules',
      columnName: 'clearing_cycle_config',
    },
    relatedTerms: ['Settlement Window', 'Processing Cycle', 'ACH Cycle', 'Clearing Window'],
    tags: ['clearing', 'settlement', 'preferred', 'processing'],
    lastUpdated: '2024-01-16T15:30:00Z',
    updatedBy: 'Technical Architecture Team'
  },
  {
    id: '4',
    term: 'NAPAS Dedicated Line',
    definition: 'Secure, dedicated network connection between bank infrastructure and NAPAS data centers with guaranteed bandwidth and latency. Banks must maintain redundant dedicated lines with minimum 10Mbps bandwidth and sub-100ms latency.',
    category: 'Infrastructure',
    domain: 'Network Connectivity',
    documentName: 'NAPAS Connectivity Requirements and SLA v1.3.docx',
    documentId: 'dpg-002',
    sourceSection: 'Section 2.1 – Network Connectivity',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Infrastructure Team',
    confidence: 0.94,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'network_config',
      columnName: 'dedicated_line_config',
    },
    relatedTerms: ['Dedicated Connection', 'Private Line', 'NAPAS Link', 'Secure Connection'],
    tags: ['network', 'connectivity', 'infrastructure'],
    lastUpdated: '2024-01-15T10:45:00Z',
    updatedBy: 'Infrastructure Team'
  },
  {
    id: '5',
    term: 'HSM Integration',
    definition: 'Hardware Security Module integration for cryptographic operations including message signing and encryption for NAPAS communication. All NAPAS messages require HSM-based digital signatures and encryption.',
    category: 'Security Component',
    domain: 'Security Requirements',
    documentName: 'NAPAS Connectivity Requirements and SLA v1.3.docx',
    documentId: 'dpg-002',
    sourceSection: 'Section 4.1 – Security Requirements',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Infrastructure Team',
    confidence: 0.91,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'security_config',
      columnName: 'hsm_config',
    },
    relatedTerms: ['Hardware Security', 'Cryptographic Module', 'Message Signing', 'Encryption Module'],
    tags: ['security', 'hsm', 'preferred', 'encryption'],
    lastUpdated: '2024-01-15T11:20:00Z',
    updatedBy: 'Infrastructure Team'
  },
  {
    id: '6',
    term: 'Payment Orchestration Engine',
    definition: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services. Manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions.',
    category: 'System Component',
    domain: 'Payment Processing',
    documentName: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
    documentId: 'tps-001',
    sourceSection: 'Section 2.1 – Business Overview',
    publishedAt: '2024-01-14T09:45:00Z',
    publishedBy: 'Payment Product Team',
    confidence: 0.96,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'payment_orchestration',
      tableName: 'orchestration_engine',
      columnName: 'orchestration_config',
    },
    relatedTerms: ['Payment Coordinator', 'Transaction Orchestrator', 'Payment Manager', 'ACH Orchestrator'],
    tags: ['payment', 'orchestration', 'preferred', 'processing'],
    lastUpdated: '2024-01-14T09:45:00Z',
    updatedBy: 'Payment Product Team'
  },
  {
    id: '7',
    term: 'Same-Day ACH',
    definition: 'Expedited ACH processing service that enables same-business-day settlement for qualifying transactions through NAPAS infrastructure. Requires special handling with earlier cutoff times and higher fees.',
    category: 'Payment Type',
    domain: 'Payment Processing',
    documentName: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
    documentId: 'tps-001',
    sourceSection: 'Section 3.2 – Payment Types',
    publishedAt: '2024-01-14T09:45:00Z',
    publishedBy: 'Payment Product Team',
    confidence: 0.93,
    isPreferred: false,
    status: 'pending',
    relatedTerms: ['Expedited ACH', 'Fast ACH', 'Same-Day Settlement', 'Rapid ACH'],
    tags: ['ach', 'same-day', 'expedited', 'settlement'],
    lastUpdated: '2024-01-14T09:45:00Z',
    updatedBy: 'Payment Product Team'
  },
  {
    id: '8',
    term: 'Provider Certification Process',
    definition: 'Formal validation process ensuring third-party payment providers meet technical and compliance standards for ACH processing. New providers must complete certification including API testing and security validation.',
    category: 'Process',
    domain: 'Third Party Integration',
    documentName: 'Third Party Payment Provider Integration Guide v2.5.pdf',
    documentId: 'tps-002',
    sourceSection: 'Section 3.1 – Provider Onboarding',
    publishedAt: '2024-01-13T16:30:00Z',
    publishedBy: 'Integration Team',
    confidence: 0.94,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'third_party_integration',
      tableName: 'provider_management',
      columnName: 'certification_process',
    },
    relatedTerms: ['Provider Validation', 'Certification Process', 'Provider Testing', 'Integration Certification'],
    tags: ['provider', 'certification', 'preferred', 'integration'],
    lastUpdated: '2024-01-13T16:30:00Z',
    updatedBy: 'Integration Team'
  },
  {
    id: '9',
    term: 'Transaction Dashboard',
    definition: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails. Business users require comprehensive dashboards to monitor ACH transaction flows.',
    category: 'User Interface',
    domain: 'Business Intelligence',
    documentName: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
    documentId: 'tps-001',
    sourceSection: 'Section 3.1 – Dashboard Requirements',
    publishedAt: '2024-01-13T14:15:00Z',
    publishedBy: 'Business Intelligence Team',
    confidence: 0.92,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'business_portal',
      tableName: 'dashboard_config',
      columnName: 'transaction_dashboard',
    },
    relatedTerms: ['Transaction Monitor', 'ACH Dashboard', 'Payment Dashboard', 'Transaction View'],
    tags: ['dashboard', 'monitoring', 'business-intelligence'],
    lastUpdated: '2024-01-13T14:15:00Z',
    updatedBy: 'Business Intelligence Team'
  },
  {
    id: '10',
    term: 'ACH File Format',
    definition: 'Standardized file structure for ACH transactions including header records, batch headers, entry details, and control totals. NAPAS requires specific file formats with mandatory fields and validation rules.',
    category: 'Data Format',
    domain: 'Data Standards',
    documentName: 'NAPAS ACH File Format Specification v2.0.pdf',
    documentId: 'napas-001',
    sourceSection: 'Section 2.1 – File Structure',
    publishedAt: '2024-01-12T10:30:00Z',
    publishedBy: 'Data Standards Team',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'data_standards',
      tableName: 'file_formats',
      columnName: 'ach_format_spec',
    },
    relatedTerms: ['File Structure', 'ACH Record', 'Batch Header', 'Entry Detail'],
    tags: ['file-format', 'data-standards', 'preferred', 'ach'],
    lastUpdated: '2024-01-12T10:30:00Z',
    updatedBy: 'Data Standards Team'
  },
  {
    id: '11',
    term: 'Return Code Processing',
    definition: 'Automated handling of ACH return codes indicating failed transactions, insufficient funds, or invalid account information. System must process return codes within specified timeframes and update transaction status.',
    category: 'Operational Process',
    domain: 'Exception Handling',
    documentName: 'ACH Exception Handling Procedures v1.8.pdf',
    documentId: 'ach-001',
    sourceSection: 'Section 4.2 – Return Processing',
    publishedAt: '2024-01-12T09:20:00Z',
    publishedBy: 'Operations Team',
    confidence: 0.93,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'operations',
      tableName: 'exception_handling',
      columnName: 'return_code_config',
    },
    relatedTerms: ['Return Code', 'Exception Handling', 'Failed Transaction', 'Reject Processing'],
    tags: ['returns', 'exceptions', 'operations'],
    lastUpdated: '2024-01-12T09:20:00Z',
    updatedBy: 'Operations Team'
  },
  {
    id: '12',
    term: 'Settlement Reconciliation',
    definition: 'Daily process of matching NAPAS settlement reports with internal transaction records to ensure accuracy and identify discrepancies. Critical for financial reporting and audit compliance.',
    category: 'Operational Process',
    domain: 'Financial Operations',
    documentName: 'ACH Settlement and Reconciliation Procedures v2.2.pdf',
    documentId: 'fin-001',
    sourceSection: 'Section 3.1 – Daily Reconciliation',
    publishedAt: '2024-01-11T16:45:00Z',
    publishedBy: 'Financial Operations Team',
    confidence: 0.94,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'financial_operations',
      tableName: 'settlement_reconciliation',
      columnName: 'reconciliation_config',
    },
    relatedTerms: ['Settlement Report', 'Transaction Matching', 'Financial Reconciliation', 'Audit Trail'],
    tags: ['settlement', 'reconciliation', 'preferred', 'financial'],
    lastUpdated: '2024-01-11T16:45:00Z',
    updatedBy: 'Financial Operations Team'
  },
  {
    id: '13',
    term: 'ACH Network Monitoring',
    definition: 'Real-time monitoring of NAPAS network connectivity, message delivery, and system performance metrics. Includes alerting for network outages, latency issues, and processing delays.',
    category: 'System Component',
    domain: 'Infrastructure Monitoring',
    documentName: 'NAPAS Network Monitoring and Alerting v1.5.pdf',
    documentId: 'infra-001',
    sourceSection: 'Section 2.1 – Monitoring Requirements',
    publishedAt: '2024-01-11T14:30:00Z',
    publishedBy: 'Infrastructure Team',
    confidence: 0.91,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'network_monitoring',
      columnName: 'ach_monitoring_config',
    },
    relatedTerms: ['Network Monitoring', 'Performance Metrics', 'System Alerting', 'Connectivity Monitoring'],
    tags: ['monitoring', 'network', 'infrastructure'],
    lastUpdated: '2024-01-11T14:30:00Z',
    updatedBy: 'Infrastructure Team'
  },
  {
    id: '14',
    term: 'Transaction Fee Calculation',
    definition: 'Automated calculation of ACH transaction fees based on transaction type, volume, and provider agreements. Includes same-day ACH premiums, volume discounts, and third-party provider fees.',
    category: 'Business Logic',
    domain: 'Pricing and Billing',
    documentName: 'ACH Transaction Pricing Model v2.1.pdf',
    documentId: 'pricing-001',
    sourceSection: 'Section 3.2 – Fee Structure',
    publishedAt: '2024-01-10T11:15:00Z',
    publishedBy: 'Product Management Team',
    confidence: 0.92,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'pricing',
      tableName: 'fee_calculation',
      columnName: 'ach_fee_rules',
    },
    relatedTerms: ['Transaction Fee', 'Pricing Model', 'Volume Discount', 'Provider Fee'],
    tags: ['pricing', 'fees', 'preferred', 'billing'],
    lastUpdated: '2024-01-10T11:15:00Z',
    updatedBy: 'Product Management Team'
  },
  {
    id: '15',
    term: 'Compliance Reporting',
    definition: 'Automated generation of regulatory reports for ACH transactions including volume reports, error summaries, and compliance metrics required by banking regulators and NAPAS.',
    category: 'Process',
    domain: 'Regulatory Compliance',
    documentName: 'ACH Regulatory Compliance Framework v1.9.pdf',
    documentId: 'compliance-001',
    sourceSection: 'Section 4.1 – Reporting Requirements',
    publishedAt: '2024-01-10T09:45:00Z',
    publishedBy: 'Compliance Team',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'compliance',
      tableName: 'regulatory_reporting',
      columnName: 'ach_compliance_config',
    },
    relatedTerms: ['Regulatory Report', 'Compliance Metrics', 'Volume Report', 'Error Summary'],
    tags: ['compliance', 'reporting', 'preferred', 'regulatory'],
    lastUpdated: '2024-01-10T09:45:00Z',
    updatedBy: 'Compliance Team'
  },
  {
    id: '16',
    term: 'ACH Message Encryption',
    definition: 'End-to-end encryption of ACH messages using industry-standard cryptographic algorithms to ensure data confidentiality and integrity during transmission between bank systems and NAPAS.',
    category: 'Security Component',
    domain: 'Data Protection',
    documentName: 'ACH Security and Encryption Standards v2.3.pdf',
    documentId: 'security-001',
    sourceSection: 'Section 3.1 – Message Encryption',
    publishedAt: '2024-01-09T15:20:00Z',
    publishedBy: 'Security Team',
    confidence: 0.94,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'security',
      tableName: 'encryption_config',
      columnName: 'ach_encryption_rules',
    },
    relatedTerms: ['Message Encryption', 'Data Protection', 'Cryptographic Security', 'Secure Transmission'],
    tags: ['encryption', 'security', 'data-protection'],
    lastUpdated: '2024-01-09T15:20:00Z',
    updatedBy: 'Security Team'
  },
  {
    id: '17',
    term: 'Transaction Volume Limits',
    definition: 'Configurable limits on ACH transaction volumes and amounts to manage risk exposure and comply with regulatory requirements. Includes daily, monthly, and per-transaction limits.',
    category: 'Risk Management',
    domain: 'Risk Controls',
    documentName: 'ACH Risk Management Framework v1.7.pdf',
    documentId: 'risk-001',
    sourceSection: 'Section 2.2 – Volume Controls',
    publishedAt: '2024-01-09T13:10:00Z',
    publishedBy: 'Risk Management Team',
    confidence: 0.93,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'risk_management',
      tableName: 'volume_limits',
      columnName: 'ach_limit_config',
    },
    relatedTerms: ['Volume Limits', 'Risk Controls', 'Transaction Limits', 'Exposure Management'],
    tags: ['risk', 'limits', 'preferred', 'controls'],
    lastUpdated: '2024-01-09T13:10:00Z',
    updatedBy: 'Risk Management Team'
  },
  {
    id: '18',
    term: 'ACH Audit Trail',
    definition: 'Comprehensive logging of all ACH transactions, system events, and user actions for compliance, troubleshooting, and forensic analysis. Includes detailed timestamps, user identification, and system state.',
    category: 'Data Element',
    domain: 'Audit and Compliance',
    documentName: 'ACH Audit and Logging Requirements v1.6.pdf',
    documentId: 'audit-001',
    sourceSection: 'Section 3.1 – Audit Trail Requirements',
    publishedAt: '2024-01-08T16:30:00Z',
    publishedBy: 'Audit Team',
    confidence: 0.96,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'audit',
      tableName: 'audit_trail',
      columnName: 'ach_audit_log',
    },
    relatedTerms: ['Audit Log', 'Transaction Log', 'System Log', 'Compliance Log'],
    tags: ['audit', 'logging', 'preferred', 'compliance'],
    lastUpdated: '2024-01-08T16:30:00Z',
    updatedBy: 'Audit Team'
  },
  {
    id: '19',
    term: 'ACH Performance Metrics',
    definition: 'Key performance indicators for ACH processing including throughput, latency, success rates, and error rates. Used for capacity planning, performance optimization, and SLA monitoring.',
    category: 'Data Element',
    domain: 'Performance Management',
    documentName: 'ACH Performance Monitoring and SLA v2.0.pdf',
    documentId: 'perf-001',
    sourceSection: 'Section 2.1 – Performance Metrics',
    publishedAt: '2024-01-08T14:45:00Z',
    publishedBy: 'Performance Engineering Team',
    confidence: 0.92,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'performance',
      tableName: 'metrics_collection',
      columnName: 'ach_performance_metrics',
    },
    relatedTerms: ['Performance Metrics', 'KPI Monitoring', 'Throughput Metrics', 'SLA Monitoring'],
    tags: ['performance', 'metrics', 'monitoring'],
    lastUpdated: '2024-01-08T14:45:00Z',
    updatedBy: 'Performance Engineering Team'
  },
  {
    id: '20',
    term: 'ACH Disaster Recovery',
    definition: 'Comprehensive disaster recovery procedures for ACH processing systems including backup systems, failover mechanisms, and recovery time objectives to ensure business continuity.',
    category: 'Operational Process',
    domain: 'Business Continuity',
    documentName: 'ACH Disaster Recovery and Business Continuity v1.4.pdf',
    documentId: 'dr-001',
    sourceSection: 'Section 2.1 – Recovery Procedures',
    publishedAt: '2024-01-08T12:20:00Z',
    publishedBy: 'Business Continuity Team',
    confidence: 0.94,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'business_continuity',
      tableName: 'disaster_recovery',
      columnName: 'ach_recovery_config',
    },
    relatedTerms: ['Disaster Recovery', 'Business Continuity', 'Failover', 'Recovery Procedures'],
    tags: ['disaster-recovery', 'business-continuity', 'preferred', 'failover'],
    lastUpdated: '2024-01-08T12:20:00Z',
    updatedBy: 'Business Continuity Team'
  },
  {
    id: '21',
    term: 'ACH Message Validation',
    definition: 'Comprehensive validation of ACH messages against NAPAS format requirements, business rules, and internal validation criteria before processing. Includes field-level validation and cross-field checks.',
    category: 'System Component',
    domain: 'Data Quality',
    documentName: 'ACH Message Validation and Quality Assurance v1.8.pdf',
    documentId: 'qa-001',
    sourceSection: 'Section 3.1 – Validation Rules',
    publishedAt: '2024-01-07T15:30:00Z',
    publishedBy: 'Quality Assurance Team',
    confidence: 0.93,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'data_quality',
      tableName: 'validation_rules',
      columnName: 'ach_validation_config',
    },
    relatedTerms: ['Message Validation', 'Data Quality', 'Field Validation', 'Business Rules'],
    tags: ['validation', 'data-quality', 'quality-assurance'],
    lastUpdated: '2024-01-07T15:30:00Z',
    updatedBy: 'Quality Assurance Team'
  },
  {
    id: '22',
    term: 'ACH Capacity Planning',
    definition: 'Strategic planning for ACH processing capacity including peak volume analysis, infrastructure scaling, and resource allocation to meet current and projected transaction volumes.',
    category: 'Operational Process',
    domain: 'Capacity Management',
    documentName: 'ACH Capacity Planning and Scaling Strategy v1.6.pdf',
    documentId: 'capacity-001',
    sourceSection: 'Section 2.1 – Capacity Analysis',
    publishedAt: '2024-01-07T13:15:00Z',
    publishedBy: 'Capacity Planning Team',
    confidence: 0.91,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'capacity_management',
      tableName: 'capacity_planning',
      columnName: 'ach_capacity_config',
    },
    relatedTerms: ['Capacity Planning', 'Peak Volume', 'Infrastructure Scaling', 'Resource Allocation'],
    tags: ['capacity', 'planning', 'preferred', 'scaling'],
    lastUpdated: '2024-01-07T13:15:00Z',
    updatedBy: 'Capacity Planning Team'
  },
  {
    id: '23',
    term: 'ACH Error Handling',
    definition: 'Systematic approach to handling ACH processing errors including error classification, retry logic, escalation procedures, and user notification mechanisms.',
    category: 'Operational Process',
    domain: 'Exception Handling',
    documentName: 'ACH Error Handling and Recovery Procedures v1.9.pdf',
    documentId: 'error-001',
    sourceSection: 'Section 3.1 – Error Classification',
    publishedAt: '2024-01-06T16:45:00Z',
    publishedBy: 'Operations Team',
    confidence: 0.94,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'operations',
      tableName: 'error_handling',
      columnName: 'ach_error_config',
    },
    relatedTerms: ['Error Handling', 'Retry Logic', 'Error Classification', 'Escalation Procedures'],
    tags: ['error-handling', 'exceptions', 'operations'],
    lastUpdated: '2024-01-06T16:45:00Z',
    updatedBy: 'Operations Team'
  },
  {
    id: '24',
    term: 'ACH Data Archival',
    definition: 'Automated archival of ACH transaction data and audit logs for long-term storage and compliance requirements. Includes data retention policies, archival schedules, and retrieval procedures.',
    category: 'Operational Process',
    domain: 'Data Management',
    documentName: 'ACH Data Retention and Archival Policy v1.7.pdf',
    documentId: 'data-001',
    sourceSection: 'Section 2.1 – Archival Requirements',
    publishedAt: '2024-01-06T14:20:00Z',
    publishedBy: 'Data Management Team',
    confidence: 0.92,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'data_management',
      tableName: 'archival_config',
      columnName: 'ach_archival_rules',
    },
    relatedTerms: ['Data Archival', 'Retention Policy', 'Long-term Storage', 'Data Retrieval'],
    tags: ['archival', 'data-management', 'preferred', 'retention'],
    lastUpdated: '2024-01-06T14:20:00Z',
    updatedBy: 'Data Management Team'
  },
  {
    id: '25',
    term: 'ACH System Integration',
    definition: 'Comprehensive integration framework for connecting ACH processing systems with core banking, payment orchestration, and third-party provider systems through standardized APIs and data formats.',
    category: 'System Component',
    domain: 'Integration Architecture',
    documentName: 'ACH System Integration Framework v2.2.pdf',
    documentId: 'integration-001',
    sourceSection: 'Section 2.1 – Integration Architecture',
    publishedAt: '2024-01-06T11:30:00Z',
    publishedBy: 'Integration Architecture Team',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'integration',
      tableName: 'system_integration',
      columnName: 'ach_integration_config',
    },
    relatedTerms: ['System Integration', 'API Integration', 'Data Integration', 'Provider Integration'],
    tags: ['integration', 'architecture', 'preferred', 'apis'],
    lastUpdated: '2024-01-06T11:30:00Z',
    updatedBy: 'Integration Architecture Team'
  },
  {
    id: '26',
    term: 'ACH User Access Control',
    definition: 'Role-based access control system for ACH processing functions including user authentication, authorization, and audit logging to ensure secure access to sensitive payment operations.',
    category: 'Security Component',
    domain: 'Access Management',
    documentName: 'ACH Security and Access Control v1.8.pdf',
    documentId: 'access-001',
    sourceSection: 'Section 3.1 – Access Control',
    publishedAt: '2024-01-05T15:45:00Z',
    publishedBy: 'Security Team',
    confidence: 0.93,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'security',
      tableName: 'access_control',
      columnName: 'ach_access_config',
    },
    relatedTerms: ['Access Control', 'User Authentication', 'Role-based Access', 'Authorization'],
    tags: ['access-control', 'security', 'authentication'],
    lastUpdated: '2024-01-05T15:45:00Z',
    updatedBy: 'Security Team'
  },
  {
    id: '27',
    term: 'ACH Business Intelligence',
    definition: 'Advanced analytics and reporting capabilities for ACH transaction data including trend analysis, performance insights, and business metrics to support strategic decision-making.',
    category: 'System Component',
    domain: 'Business Intelligence',
    documentName: 'ACH Business Intelligence and Analytics v1.9.pdf',
    documentId: 'bi-001',
    sourceSection: 'Section 2.1 – Analytics Framework',
    publishedAt: '2024-01-05T13:20:00Z',
    publishedBy: 'Business Intelligence Team',
    confidence: 0.91,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'business_intelligence',
      tableName: 'analytics_config',
      columnName: 'ach_analytics_rules',
    },
    relatedTerms: ['Business Intelligence', 'Analytics', 'Trend Analysis', 'Performance Insights'],
    tags: ['business-intelligence', 'analytics', 'preferred', 'reporting'],
    lastUpdated: '2024-01-05T13:20:00Z',
    updatedBy: 'Business Intelligence Team'
  },
  {
    id: '28',
    term: 'ACH Change Management',
    definition: 'Structured process for managing changes to ACH processing systems including change approval, testing, deployment, and rollback procedures to ensure system stability and compliance.',
    category: 'Process',
    domain: 'Change Management',
    documentName: 'ACH Change Management and Release Procedures v1.7.pdf',
    documentId: 'change-001',
    sourceSection: 'Section 2.1 – Change Process',
    publishedAt: '2024-01-05T11:10:00Z',
    publishedBy: 'Change Management Team',
    confidence: 0.94,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'change_management',
      tableName: 'change_process',
      columnName: 'ach_change_config',
    },
    relatedTerms: ['Change Management', 'Release Management', 'Deployment', 'Rollback Procedures'],
    tags: ['change-management', 'release', 'deployment'],
    lastUpdated: '2024-01-05T11:10:00Z',
    updatedBy: 'Change Management Team'
  }
];

const ITEMS_PER_PAGE = 6;

export function TermDictionary() {
  const [terms] = useState<PublishedTerm[]>(napasPublishedTerms);
  const [selectedTerm, setSelectedTerm] = useState<PublishedTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLineageViewer, setShowLineageViewer] = useState(false);
  const [lineageTerm, setLineageTerm] = useState<PublishedTerm | null>(null);

  const documents = Array.from(new Set(terms.map(term => term.documentName)));
  const categories = Array.from(new Set(terms.map(term => term.category)));
  const domains = Array.from(new Set(terms.map(term => term.domain)));
  const statuses = ['preferred', 'published', 'pending', 'flagged'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocument = documentFilter === 'all' || term.documentName === documentFilter;
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesDomain = domainFilter === 'all' || term.domain === domainFilter;
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesDocument && matchesCategory && matchesDomain && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTerms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTerms = filteredTerms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preferred':
        return <Badge variant="warning">Preferred</Badge>;
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'flagged':
        return <Badge variant="error">Flagged</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleExportTerms = () => {
    const csvContent = [
      ['Term', 'Definition', 'Category', 'Domain', 'Document', 'Section', 'Status', 'Confidence', 'Last Updated'].join(','),
      ...filteredTerms.map(term => [
        `"${term.term}"`,
        `"${term.definition}"`,
        term.category,
        term.domain,
        `"${term.documentName}"`,
        `"${term.sourceSection}"`,
        term.status,
        Math.round(term.confidence * 100) + '%',
        formatDate(term.lastUpdated)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banking-term-dictionary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewLineage = (term: PublishedTerm) => {
    setLineageTerm(term);
    setShowLineageViewer(true);
  };

  const handleCloseLineage = () => {
    setShowLineageViewer(false);
    setLineageTerm(null);
  };

  const handleTogglePreferred = (termId: string) => {
    // In a real app, this would make an API call
    console.log('Toggle preferred for term:', termId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show lineage viewer if requested
  if (showLineageViewer && lineageTerm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with close button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Data Lineage for "{lineageTerm.term}"
              </h1>
              <p className="text-gray-600 mt-1">
                Explore data flow and dependencies for this NAPAS ACH business term
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleCloseLineage}
            >
              Back to Dictionary
            </Button>
          </div>
        </div>
        
        {/* Lineage Viewer */}
        <div className="flex-1">
          <DataLineageViewer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banking Term Dictionary</h1>
            <p className="text-gray-600 mt-1">
              Browse and manage business terms across multiple banking systems and domains
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportTerms}
            >
              Export Dictionary ({filteredTerms.length})
            </Button>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search banking terms, definitions, or documents across all systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative">
              <select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Documents</option>
                {documents.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Search & Filters */}
     

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredTerms.length} Banking Terms Found
            </h2>
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTerms.length)} of {filteredTerms.length} terms
            </p>
          </div>
          
          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Terms List */}
        <div className="space-y-4 mb-8">
          {paginatedTerms.map(term => (
            <Card key={term.id} className="hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Term Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                      {term.isPreferred && (
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                      )}
                      {getStatusBadge(term.status)}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3 line-clamp-2">
                      {term.definition}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(term.confidence)}`}>
                      {Math.round(term.confidence * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={MoreHorizontal}
                      onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                    />
                  </div>
                </div>

                {/* Term Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{term.documentName}</div>
                      <div className="text-xs text-gray-500">{term.sourceSection}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{term.category}</div>
                      <div className="text-xs text-gray-500">{term.domain}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {term.schemaMapping ? 'Mapped' : 'Not Mapped'}
                      </div>
                      {term.schemaMapping && (
                        <div className="text-xs text-gray-500 font-mono">
                          {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(term.lastUpdated)}</div>
                      <div className="text-xs text-gray-500">by {term.updatedBy}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={term.isPreferred}
                        onChange={() => handleTogglePreferred(term.id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">Preferred</span>
                    </label>
                    
                    {term.relatedTerms.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {term.relatedTerms.length} related
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Network}
                      onClick={() => handleViewLineage(term)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Lineage
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                    >
                      {selectedTerm?.id === term.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedTerm?.id === term.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {/* Full Definition */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Full Definition</h4>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {term.definition}
                      </p>
                    </div>

                    {/* Schema Mapping Details */}
                    {term.schemaMapping && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Database className="w-4 h-4 mr-2" />
                          Schema Mapping
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <code className="text-sm font-mono text-gray-800">
                            {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}.{term.schemaMapping.columnName}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {term.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Related Terms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {term.relatedTerms.map(relatedTerm => (
                            <Badge key={relatedTerm} variant="default" size="sm">
                              {relatedTerm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {term.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {term.tags.map(tag => (
                            <Badge key={tag} variant="info" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTerms.length)} of {filteredTerms.length} terms
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Banking Terms Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || documentFilter !== 'all' || categoryFilter !== 'all' || domainFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No banking terms have been published to the dictionary yet.'}
            </p>
            <Button variant="primary">
              Process Banking Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}