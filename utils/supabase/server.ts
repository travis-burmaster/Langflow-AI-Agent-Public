import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return Promise.resolve(cookieStore.get(name)?.value ?? '');
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            Promise.resolve(cookieStore.set(name, value, options));
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            Promise.resolve(cookieStore.delete(name));
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
};