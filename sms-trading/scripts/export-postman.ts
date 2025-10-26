import fs from 'fs';
import path from 'path';

// Generate Postman collection from OpenAPI spec
const collection = {
  info: {
    name: 'SMS Trading API',
    description: 'Comprehensive SMS platform API',
    version: '1.0.0',
  },
  auth: {
    type: 'apiKey',
    apiKey: [{ key: 'X-Api-Key', value: '{{API_KEY}}', type: 'string' }],
  },
  item: [
    {
      name: 'SMS',
      item: [
        {
          name: 'Send SMS',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Idempotency-Key', value: '{{$timestamp}}' },
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ to: '+27123456789', message: 'Hello' }, null, 2),
            },
            url: { raw: '{{BASE_URL}}/api/v1/sms', path: ['api', 'v1', 'sms'] },
          },
        },
        {
          name: 'Test Send',
          request: {
            method: 'POST',
            body: { mode: 'raw', raw: JSON.stringify({ phone: '+27123456789', message: 'Test' }, null, 2) },
            url: { raw: '{{BASE_URL}}/api/v1/sms/test', path: ['api', 'v1', 'sms', 'test'] },
          },
        },
      ],
    },
    {
      name: 'Contacts',
      item: [
        { name: 'List Contacts', request: { method: 'GET', url: { raw: '{{BASE_URL}}/api/v1/contacts', path: ['api', 'v1', 'contacts'] } } },
        { name: 'Create Contact', request: { method: 'POST', url: { raw: '{{BASE_URL}}/api/v1/contacts', path: ['api', 'v1', 'contacts'] } } },
        { name: 'Export Contacts', request: { method: 'GET', url: { raw: '{{BASE_URL}}/api/v1/contacts/export?format=csv', path: ['api', 'v1', 'contacts', 'export'] } } },
      ],
    },
    {
      name: 'Campaigns',
      item: [
        { name: 'List Campaigns', request: { method: 'GET', url: { raw: '{{BASE_URL}}/api/v1/campaigns', path: ['api', 'v1', 'campaigns'] } } },
        { name: 'Create Campaign', request: { method: 'POST', url: { raw: '{{BASE_URL}}/api/v1/campaigns', path: ['api', 'v1', 'campaigns'] } } },
      ],
    },
  ],
  variable: [
    { key: 'BASE_URL', value: 'http://localhost:3000' },
    { key: 'API_KEY', value: '' },
  ],
};

const output = path.join(__dirname, '../public/SMS-Trading-API.postman_collection.json');
fs.writeFileSync(output, JSON.stringify(collection, null, 2));
console.log(`✓ Postman collection exported to ${output}`);
