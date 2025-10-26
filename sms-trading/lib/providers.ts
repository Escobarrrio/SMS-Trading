import { sendSMS as sendBulkSMS } from '@/lib/bulksms';
import { sendSMS as sendAT } from '@/lib/africastalking';

export type ProviderResult = { id: string; status: string; provider: 'bulksms' | 'africastalking' };

type SendParams = { to: string; body: string };

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function withRetries<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 200): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { lastErr = e; }
    const jitter = Math.floor(Math.random() * baseDelayMs);
    await sleep(baseDelayMs * Math.pow(2, i) + jitter);
  }
  throw lastErr;
}

export async function sendWithFallback(params: SendParams): Promise<ProviderResult> {
  // Primary: BulkSMS
  try {
    const r = await withRetries(() => sendBulkSMS(params), 3, 200);
    return { id: (r as any).id, status: (r as any).status ?? 'sent', provider: 'bulksms' };
  } catch (_) {
    // Fallback: Africa's Talking
    const r = await withRetries(() => sendAT(params) as any, 3, 300);
    const rec = (r as any).SMSMessageData?.Recipients?.[0];
    const status = rec?.status || 'sent';
    const id = rec?.messageId || `${Date.now()}`;
    return { id, status, provider: 'africastalking' };
  }
}
