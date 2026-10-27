import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Clears HTTP-only session cookies upon logout
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return NextResponse.json({ success: true }, { status: 200 });
}
