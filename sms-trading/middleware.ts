import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const protectedRoutes = ['/dashboard', '/send', '/contacts', '/campaigns', '/admin'];
const preview = process.env.PREVIEW_MODE === 'true';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(req: NextRequest) {
  // Skip protected route checks in preview mode
  if (preview) {
    return NextResponse.next();
  }

  // Check if route is protected
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect to sign-in if not authenticated
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
