import { NextRequest, NextResponse } from 'next/server';

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export interface LogContext {
  correlationId: string;
  userId?: string;
  clientId?: string;
  method: string;
  path: string;
  timestamp: string;
}

export function createLogContext(req: NextRequest, correlationId?: string): LogContext {
  return {
    correlationId: correlationId || generateCorrelationId(),
    method: req.method,
    path: req.nextUrl.pathname,
    timestamp: new Date().toISOString(),
  };
}

export function logRequest(ctx: LogContext, level: 'info' | 'warn' | 'error' = 'info', message: string, meta?: any) {
  const log = {
    level,
    timestamp: ctx.timestamp,
    correlationId: ctx.correlationId,
    message,
    method: ctx.method,
    path: ctx.path,
    userId: ctx.userId,
    clientId: ctx.clientId,
    ...meta,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(log, null, 2));
  }

  // In production, send to Sentry or logging service
  if (process.env.SENTRY_DSN && level === 'error') {
    // Sentry integration would go here
  }

  return log;
}
