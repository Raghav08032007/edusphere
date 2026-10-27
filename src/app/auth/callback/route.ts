import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase OAuth Authorization Code Callback Handler
 *
 * Handles redirect from Google OAuth (and other providers).
 * Excludes Google client secret and Supabase service-role key from browser code.
 * Validates errors, completes the code exchange, sets HTTP-only cookies if session is established,
 * and defends against open-redirect vulnerabilities.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // 1. Check for provider error parameters (e.g. user canceled Google prompt)
  if (error) {
    const errorMsg =
      errorDescription ||
      error ||
      'Google sign-in was cancelled or encountered an error.';
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });

        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error(
            '[Supabase OAuth Callback] Authorization code exchange error:',
            exchangeError.message
          );
          const errorRedirect = new URL('/', requestUrl.origin);
          errorRedirect.searchParams.set('authError', exchangeError.message);
          return NextResponse.redirect(errorRedirect);
        }

        // Successfully exchanged authorization code for session
        if (data?.session) {
          const response = NextResponse.redirect(
            new URL(safeDestination, requestUrl.origin)
          );

          // Establish secure HTTP-only session cookies
          const isProduction = process.env.NODE_ENV === 'production';
          const maxAge = data.session.expires_in || 3600;

          response.cookies.set('sb-access-token', data.session.access_token, {
            path: '/',
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge,
          });

          if (data.session.refresh_token) {
            response.cookies.set(
              'sb-refresh-token',
              data.session.refresh_token,
              {
                path: '/',
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
              }
            );
          }

          return response;
        }
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
  }

  // Safe redirect to application
  return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
}
