import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validates session cookies and returns current authenticated user profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { user: null, session: null },
      { status: 200 }
    );
  }
}
