import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'docs', 'openapi.yaml');
    const data = fs.readFileSync(p, 'utf-8');
    return new NextResponse(data, { status: 200, headers: { 'content-type': 'application/yaml' } });
  } catch (e: any) {
    return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
  }
}
