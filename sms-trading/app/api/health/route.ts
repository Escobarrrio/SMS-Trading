import { json, ok } from '@/lib/api';

export async function GET() {
  return json(ok({ status: 'live', timestamp: new Date().toISOString() }));
}
