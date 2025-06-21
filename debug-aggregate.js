import { evaluateFormula } from './formula-compiler.js';

const relationshipContext = {
  tableName: 'submission',
  columnList: {
    'amount': 'number',
    'revenue': 'number',
    'cost': 'number',
    'created_date': 'date',
    'updated_date': 'date',
    'status': 'string',
    'closed': 'boolean',
    'syndication': 'boolean',
    'open_approval': 'boolean'
  },
  relationshipInfo: {
    'merchant': {
      tableName: 'merchant',
      joinColumn: 'merchant_id',
      columnList: {
        'business_name': 'string',
        'fee_rate': 'number'
      }
    },
    'funder': {
      tableName: 'funder',
      joinColumn: 'funder_id',
      columnList: {
        'name': 'string',
        'rate': 'number'
      }
    }
  },
  inverseRelationshipInfo: {
    'rep_links_submission': {
      tableName: 'rep_link',
      joinColumn: 'submission',
      columnList: {
        'commission_percentage': 'number',
        'rep': 'number'
      },
      relationshipInfo: {
        'rep': {
          tableName: 'rep',
          joinColumn: 'rep',
          columnList: {
            'name': 'string',
            'rate': 'number'
          }
        }
      }
    },
    'documents_submission': {
      tableName: 'document',
      joinColumn: 'submission',
      columnList: {
        'filename': 'string',
        'size': 'number',
        'created_date': 'date'
      }
    }
  }
};

try {
  const result = evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, ",")', relationshipContext);
  console.log('Result type:', typeof result);
  console.log('Result keys:', Object.keys(result));
  console.log('Result structure:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Error:', error.message);
  console.log('Stack:', error.stack);
} 