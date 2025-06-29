import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Hash,
  FileText,
  Code,
  Play,
  Settings
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface TransactionData {
  transaction_id: string;
  customer_id: string;
  order_id: string;
  merchant_id: string;
  gateway_code: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GeneratedData {
  'dpg.ach_message_log': any[];
  'payment.transaction_payment': any[];
  'cip.portal_request_audit': any[];
  'corebank.payment_core_txn': any[];
  'napas.transaction_response_log': any[];
}

const TRANSACTION_STATUSES = {
  COMPLETED: {
    payment: 'COMPLETED',
    corebank: 'EXECUTED',
    napas: 'SUCCESS',
    dpg: 'SUCCESS'
  },
  FAILED: {
    payment: 'FAILED',
    corebank: 'REJECTED',
    napas: 'FAILED',
    dpg: 'ERROR'
  },
  PENDING: {
    payment: 'PENDING',
    corebank: 'PROCESSING',
    napas: 'PENDING',
    dpg: 'IN_PROGRESS'
  },
  CANCELLED: {
    payment: 'CANCELLED',
    corebank: 'CANCELLED',
    napas: 'CANCELLED',
    dpg: 'CANCELLED'
  }
};

const NAPAS_MESSAGE_TYPES = ['CT', 'CTF', 'ACK', 'NAK', 'ADV', 'RET'];
const GATEWAY_CODES = ['VCB_GATEWAY', 'TCB_GATEWAY', 'VTB_GATEWAY', 'ACB_GATEWAY', 'MB_GATEWAY'];
const MERCHANT_PREFIXES = ['MERCHANT', 'SHOP', 'STORE', 'VENDOR'];
const ACTION_TYPES = ['CREATE', 'APPROVE', 'REJECT', 'RETRY', 'CANCEL', 'VIEW', 'MODIFY'];

export function ACHNapasDataGenerator() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [transactionCount, setTransactionCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'json' | 'sql'>('json');
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  const generateRandomId = (prefix: string, length: number = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomAmount = () => {
    return Math.floor(Math.random() * (50000000 - 100000) + 100000);
  };

  const getRandomElement = (array: any[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateTimestamp = (daysAgo: number = 0, hoursOffset: number = 0) => {
    const now = new Date();
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() + hoursOffset);
    return now.toISOString();
  };

  const generateTransactionData = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const data: GeneratedData = {
        'dpg.ach_message_log': [],
        'payment.transaction_payment': [],
        'cip.portal_request_audit': [],
        'corebank.payment_core_txn': [],
        'napas.transaction_response_log': []
      };

      // Generate base transactions
      const baseTransactions: TransactionData[] = [];
      
      for (let i = 0; i < transactionCount; i++) {
        const transactionId = generateRandomId('TXN', 10);
        const customerId = generateRandomId('CUST', 6);
        const orderId = generateRandomId('ORD', 8);
        const merchantId = `${getRandomElement(MERCHANT_PREFIXES)}_${generateRandomId('', 6)}`;
        const gatewayCode = getRandomElement(GATEWAY_CODES);
        const amount = generateRandomAmount();
        const daysAgo = Math.floor(Math.random() * 7);
        const createdAt = generateTimestamp(daysAgo);
        const updatedAt = generateTimestamp(daysAgo, Math.random() * 24);

        // Determine transaction outcome (80% success, 15% failed, 5% pending)
        const rand = Math.random();
        let statusGroup: keyof typeof TRANSACTION_STATUSES;
        if (rand < 0.8) statusGroup = 'COMPLETED';
        else if (rand < 0.95) statusGroup = 'FAILED';
        else statusGroup = 'PENDING';

        baseTransactions.push({
          transaction_id: transactionId,
          customer_id: customerId,
          order_id: orderId,
          merchant_id: merchantId,
          gateway_code: gatewayCode,
          amount,
          currency: 'VND',
          status: statusGroup,
          created_at: createdAt,
          updated_at: updatedAt
        });
      }

      // Add some duplicate order scenarios
      if (transactionCount > 3) {
        const duplicateBase = baseTransactions[0];
        baseTransactions.push({
          ...duplicateBase,
          transaction_id: generateRandomId('TXN', 10),
          created_at: generateTimestamp(Math.floor(Math.random() * 7)),
          updated_at: generateTimestamp(Math.floor(Math.random() * 7), Math.random() * 24)
        });
      }

      // Generate data for each service
      baseTransactions.forEach((txn, index) => {
        const statuses = TRANSACTION_STATUSES[txn.status as keyof typeof TRANSACTION_STATUSES];
        
        // 1. payment.transaction_payment
        data['payment.transaction_payment'].push({
          transaction_id: txn.transaction_id,
          customer_id: txn.customer_id,
          order_id: txn.order_id,
          merchant_id: txn.merchant_id,
          gateway_code: txn.gateway_code,
          amount: txn.amount,
          currency: txn.currency,
          status: statuses.payment,
          payment_method: 'ACH_TRANSFER',
          description: `Payment for order ${txn.order_id}`,
          fee_amount: Math.floor(txn.amount * 0.001), // 0.1% fee
          created_at: txn.created_at,
          updated_at: txn.updated_at,
          processed_at: statuses.payment === 'COMPLETED' ? txn.updated_at : null
        });

        // 2. dpg.ach_message_log
        const messageTypes = statuses.dpg === 'SUCCESS' ? ['CT', 'ACK'] : ['CT', 'NAK'];
        messageTypes.forEach((msgType, msgIndex) => {
          data['dpg.ach_message_log'].push({
            message_id: generateRandomId('MSG', 12),
            correlation_id: txn.transaction_id,
            message_type: msgType,
            direction: msgIndex === 0 ? 'OUTBOUND' : 'INBOUND',
            status: msgIndex === messageTypes.length - 1 ? statuses.dpg : 'SUCCESS',
            gateway_code: txn.gateway_code,
            amount: txn.amount,
            currency: txn.currency,
            napas_reference: generateRandomId('NPR', 10),
            message_content: `{"txnId":"${txn.transaction_id}","amount":${txn.amount},"currency":"${txn.currency}"}`,
            created_at: generateTimestamp(Math.floor(Math.random() * 7), msgIndex * 0.5),
            processed_at: generateTimestamp(Math.floor(Math.random() * 7), msgIndex * 0.5 + 0.1)
          });
        });

        // 3. cip.portal_request_audit
        const auditActions = ['CREATE'];
        if (Math.random() > 0.7) auditActions.push('VIEW');
        if (statuses.payment === 'FAILED' && Math.random() > 0.5) auditActions.push('RETRY');
        if (Math.random() > 0.8) auditActions.push('APPROVE');

        auditActions.forEach((action, actionIndex) => {
          data['cip.portal_request_audit'].push({
            audit_id: generateRandomId('AUD', 10),
            transaction_id: txn.transaction_id,
            user_id: generateRandomId('USR', 6),
            action_type: action,
            request_data: `{"transactionId":"${txn.transaction_id}","action":"${action}"}`,
            response_data: `{"status":"${statuses.payment}","message":"Action completed"}`,
            ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: generateTimestamp(Math.floor(Math.random() * 7), actionIndex * 0.2),
            session_id: generateRandomId('SES', 8)
          });
        });

        // 4. corebank.payment_core_txn
        data['corebank.payment_core_txn'].push({
          core_txn_id: generateRandomId('CORE', 12),
          transaction_id: txn.transaction_id,
          account_number: generateRandomId('ACC', 10),
          routing_number: generateRandomId('RTN', 9),
          amount: txn.amount,
          currency: txn.currency,
          execution_status: statuses.corebank,
          core_reference: generateRandomId('REF', 15),
          settlement_date: statuses.corebank === 'EXECUTED' ? 
            generateTimestamp(Math.floor(Math.random() * 7) - 1) : null,
          error_code: statuses.corebank === 'REJECTED' ? 'INSUFFICIENT_FUNDS' : null,
          error_message: statuses.corebank === 'REJECTED' ? 'Insufficient account balance' : null,
          created_at: txn.created_at,
          executed_at: statuses.corebank === 'EXECUTED' ? txn.updated_at : null
        });

        // 5. napas.transaction_response_log
        data['napas.transaction_response_log'].push({
          response_id: generateRandomId('RESP', 12),
          transaction_id: txn.transaction_id,
          napas_txn_id: generateRandomId('NPT', 15),
          txn_status: statuses.napas,
          response_code: statuses.napas === 'SUCCESS' ? '00' : 
                        statuses.napas === 'FAILED' ? '05' : '01',
          response_message: statuses.napas === 'SUCCESS' ? 'Transaction approved' :
                           statuses.napas === 'FAILED' ? 'Transaction declined' : 'Transaction pending',
          settlement_amount: statuses.napas === 'SUCCESS' ? txn.amount : 0,
          settlement_currency: txn.currency,
          settlement_date: statuses.napas === 'SUCCESS' ? 
            generateTimestamp(Math.floor(Math.random() * 7) - 1) : null,
          napas_reference: generateRandomId('NPR', 10),
          gateway_response: `{"status":"${statuses.napas}","code":"${statuses.napas === 'SUCCESS' ? '00' : '05'}"}`,
          created_at: txn.updated_at,
          processed_at: generateTimestamp(Math.floor(Math.random() * 7), 0.1)
        });
      });

      setGeneratedData(data);
      setIsGenerating(false);
    }, 1500);
  };

  const generateSQLInserts = (tableName: string, records: any[]) => {
    if (records.length === 0) return '';
    
    const columns = Object.keys(records[0]);
    const values = records.map(record => {
      const valueList = columns.map(col => {
        const value = record[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        return value;
      }).join(', ');
      return `(${valueList})`;
    }).join(',\n  ');

    return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n  ${values};`;
  };

  const copyToClipboard = async (content: string, tableName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTable(tableName);
      setTimeout(() => setCopiedTable(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadData = () => {
    if (!generatedData) return;
    
    const content = outputFormat === 'json' 
      ? JSON.stringify(generatedData, null, 2)
      : Object.entries(generatedData)
          .map(([table, records]) => generateSQLInserts(table, records))
          .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ach_napas_data.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('SUCCESS') || status.includes('COMPLETED') || status.includes('EXECUTED')) {
      return <Badge variant="success">{status}</Badge>;
    }
    if (status.includes('FAILED') || status.includes('REJECTED') || status.includes('ERROR')) {
      return <Badge variant="error">{status}</Badge>;
    }
    if (status.includes('PENDING') || status.includes('PROCESSING')) {
      return <Badge variant="warning">{status}</Badge>;
    }
    return <Badge variant="default">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ACH Napas Transaction Data Generator
          </h1>
          <p className="text-gray-600">
            Generate realistic fake data for ACH transaction lifecycle across banking systems and Napas network
          </p>
        </div>

        {/* Configuration Panel */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Generation Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Transactions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={transactionCount}
                  onChange={(e) => setTransactionCount(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'json' | 'sql')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="json">JSON</option>
                  <option value="sql">SQL INSERT</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={generateTransactionData}
                  loading={isGenerating}
                  icon={Play}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Data'}
                </Button>
              </div>
            </div>

            {/* Data Rules Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Generation Rules</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Amounts: 100,000 - 50,000,000 VND</li>
                <li>• Timestamps: Distributed over last 7 days</li>
                <li>• Status Coherence: Consistent across all services</li>
                <li>• Realistic Scenarios: 80% success, 15% failed, 5% pending</li>
                <li>• Includes duplicate orders and retry scenarios</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Generated Data Display */}
        {generatedData && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Data Summary</h2>
                  <Button onClick={downloadData} icon={Download} variant="secondary">
                    Download {outputFormat.toUpperCase()}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(generatedData).map(([tableName, records]) => (
                    <div key={tableName} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                      <div className="text-sm text-gray-600">{tableName.split('.')[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Service Data Tables */}
            {Object.entries(generatedData).map(([tableName, records]) => (
              <Card key={tableName}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      {tableName} ({records.length} records)
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={copiedTable === tableName ? CheckCircle : Copy}
                        onClick={() => {
                          const content = outputFormat === 'json'
                            ? JSON.stringify(records, null, 2)
                            : generateSQLInserts(tableName, records);
                          copyToClipboard(content, tableName);
                        }}
                      >
                        {copiedTable === tableName ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  {/* Sample Records Preview */}
                  <div className="overflow-x-auto">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-mono">
                        {outputFormat === 'json' ? (
                          <pre className="text-gray-800 max-h-64 overflow-y-auto">
                            {JSON.stringify(records.slice(0, 2), null, 2)}
                            {records.length > 2 && '\n... and ' + (records.length - 2) + ' more records'}
                          </pre>
                        ) : (
                          <pre className="text-gray-800 max-h-64 overflow-y-auto">
                            {generateSQLInserts(tableName, records.slice(0, 2))}
                            {records.length > 2 && '\n-- ... and ' + (records.length - 2) + ' more records'}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Distribution for relevant tables */}
                  {(tableName.includes('payment') || tableName.includes('napas') || tableName.includes('corebank')) && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Status Distribution</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(records.map(r => r.status || r.txn_status || r.execution_status)))
                          .map(status => {
                            const count = records.filter(r => 
                              (r.status || r.txn_status || r.execution_status) === status
                            ).length;
                            return (
                              <div key={status} className="flex items-center space-x-2">
                                {getStatusBadge(status)}
                                <span className="text-sm text-gray-600">({count})</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Service Architecture Info */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  name: 'DPG ACH Message Log',
                  description: 'Middleware logging Napas protocol messages',
                  icon: <FileText className="w-5 h-5 text-blue-500" />
                },
                {
                  name: 'Payment Transaction',
                  description: 'Central orchestration of all payments',
                  icon: <DollarSign className="w-5 h-5 text-green-500" />
                },
                {
                  name: 'Portal Request Audit',
                  description: 'Internal user actions on payments',
                  icon: <Clock className="w-5 h-5 text-purple-500" />
                },
                {
                  name: 'Core Banking Transaction',
                  description: 'Final execution in core banking',
                  icon: <Database className="w-5 h-5 text-red-500" />
                },
                {
                  name: 'Napas Response Log',
                  description: 'Napas response and settlement',
                  icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
                }
              ].map((service, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {service.icon}
                    <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}