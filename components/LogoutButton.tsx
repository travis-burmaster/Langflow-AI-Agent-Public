'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear all cookies
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }

      // Clear local storage
      localStorage.clear();
      
      // Force a hard refresh to clear all cache
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className={`w-full bg-white hover:bg-gray-50 text-gray-800 ${className}`}
    >
      Logout
    </Button>
  );
}
