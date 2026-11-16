import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth Authorization Code Callback Handler
 *
 * Handles redirect from Google OAuth (and other providers).
 * Completes PKCE code exchange using @supabase/ssr createServerClient,
 * which sets standard session cookies, and defends against open-redirect vulnerabilities.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // 1. Check for provider error parameters (e.g. user canceled OAuth prompt)
  if (error) {
    const errorMsg =
      errorDescription ||
      error ||
      'Authentication was cancelled or encountered an error.';
    const errorRedirect = new URL('/', requestUrl.origin);
    errorRedirect.searchParams.set('authError', errorMsg);
    return NextResponse.redirect(errorRedirect);
  }

  // 2. Prevent Open-Redirect vulnerabilities
  // Allow only valid relative paths starting with a single '/'
  const isSafeRedirect =
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/\\') &&
    !next.includes('\\');
  const safeDestination = isSafeRedirect ? next : '/';

  // 3. Exchange authorization code for session
  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error(
          '[Supabase OAuth Callback] Authorization code exchange error:',
          exchangeError.message
        );
        const errorRedirect = new URL('/', requestUrl.origin);
        errorRedirect.searchParams.set('authError', exchangeError.message);
        return NextResponse.redirect(errorRedirect);
      }

      return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Authentication code exchange failed';
      console.error(
        '[Supabase OAuth Callback] Unexpected error during code exchange:',
        err
      );
      const errorRedirect = new URL('/', requestUrl.origin);
      errorRedirect.searchParams.set('authError', errorMsg);
      return NextResponse.redirect(errorRedirect);
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
}
