// Unified API response helpers and error handling
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, any>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
};

export function ok<T>(data: T, meta: Record<string, any> = {}): ApiSuccess<T> {
  return { success: true, data, meta };
}

export function fail(code: string, message: string, details?: any): ApiError {
  return { success: false, error: { code, message, details } };
}

export function json<T>(res: ApiSuccess<T> | ApiError, init?: ResponseInit) {
  const status = 'error' in (res as any) ? (init?.status ?? 400) : (init?.status ?? 200);
  return Response.json(res, { status, ...init });
}

export function getIdempotencyKey(headers: Headers): string | undefined {
  return headers.get('Idempotency-Key') ?? headers.get('x-idempotency-key') ?? undefined;
}
