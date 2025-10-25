import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/favicon(.*)',
    '/api/(.*)',
  ],
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
  ],
};
