import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await request.cookies.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        async remove(name: string, options: CookieOptions) {
          request.cookies.delete({
            name,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession();

  // Public paths that don't require authentication or approval
  const isPublicPath = request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/pending-approval' ||
    request.nextUrl.pathname === '/';

  // If not logged in and trying to access protected route, redirect to login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If logged in, check approval status for protected routes
  if (session && !isPublicPath) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('user_id', session.user.id)
        .single();

      if (!profile?.is_approved) {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}