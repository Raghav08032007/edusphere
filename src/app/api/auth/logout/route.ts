import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Clears HTTP-only session cookies and signs out on Supabase server
 */
export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return NextResponse.json({ success: true }, { status: 200 });
}
