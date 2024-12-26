import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    // Check if the current user is an admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: adminCheck, error: adminError } = await supabase
      .from('profiles')
      .select('isAdmin')
      .eq('userId', session.user.id)
      .single();

    if (adminError || !adminCheck?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the user ID and approval status from the request
    const { userId, isApproved } = await request.json();

    // Update the user's approval status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ isApproved, updatedAt: new Date().toISOString() })
      .eq('userId', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}