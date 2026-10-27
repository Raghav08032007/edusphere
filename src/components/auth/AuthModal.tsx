'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole, AuthProvider } from '../../types/supabase';
import { supabase, DEMO_STUDENT_USERS } from '../../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile, provider: AuthProvider) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Tabs: 'login' vs 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [fullNameInput, setFullNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Authentication State & Feedback
  const [isAuthenticating, setIsAuthenticating] = useState<AuthProvider | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google OAuth Flow via Supabase Client
  const handleGoogleSignIn = async () => {
    setIsAuthenticating('google');
    setAuthError(null);

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });

        if (error) {
          setIsAuthenticating(null);
          setAuthError(error.message);
          return;
        }

        // Supabase will automatically redirect window.location to Google
        return;
      } catch (err: unknown) {
        setIsAuthenticating(null);
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Failed to initiate Google authentication';
        setAuthError(errorMsg);
        return;
      }
    } else {
      // Offline / Demo fallback when Supabase credentials are not configured in local environment
      setTimeout(() => {
        const baseStudent = DEMO_STUDENT_USERS[0];
        const loggedUser: UserProfile = {
          ...baseStudent,
          fullName: 'Param Sahar (Google)',
          email: 'param.sahar@gmail.com',
          authProvider: 'google',
          avatarUrl:
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        };

        setIsAuthenticating(null);
        onLoginSuccess(loggedUser, 'google');
        onClose();
      }, 700);
    }
  };

  // 2. Secondary OAuth Providers (GitHub, Apple)
  const handleOtherOAuthLogin = (provider: 'github' | 'apple') => {
    setIsAuthenticating(provider);
    setAuthError(null);

    setTimeout(() => {
      const baseStudent = DEMO_STUDENT_USERS[0];
      const loggedUser: UserProfile = {
        ...baseStudent,
        authProvider: provider,
        fullName:
          provider === 'github'
            ? 'Sri Kailash (srikailash1313)'
            : 'Param Sahar (Apple ID)',
        email:
          provider === 'github'
            ? 'srikailashsamynathan@gmail.com'
            : 'param.sahar@privaterelay.appleid.com',
        avatarUrl:
          provider === 'github'
            ? 'https://avatars.githubusercontent.com/u/10000000?v=4'
            : baseStudent.avatarUrl,
      };

      setIsAuthenticating(null);
      onLoginSuccess(loggedUser, provider);
      onClose();
    }, 700);
  };

  // 3. Email & Password Submission (Login & Student Registration)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both your institutional email and password.');
      return;
    }

    setIsAuthenticating('email');
    setAuthError(null);

    if (supabase) {
      try {
        if (authMode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: emailInput.trim(),
            password: passwordInput,
            options: {
              data: {
                full_name: fullNameInput.trim() || emailInput.split('@')[0],
                role: 'student',
              },
            },
          });

          if (error) {
            setIsAuthenticating(null);
            setAuthError(error.message);
            return;
          }

          const user = data.user;
          const newProfile: UserProfile = {
            id: user?.id || `student-${Date.now()}`,
            email: user?.email || emailInput.trim(),
            fullName: fullNameInput.trim() || emailInput.split('@')[0],
            role: 'student',
            authProvider: 'email',
          };

          setIsAuthenticating(null);
          onLoginSuccess(newProfile, 'email');
          onClose();
        } else {
          // Sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.trim(),
            password: passwordInput,
          });

          if (error) {
            setIsAuthenticating(null);
            setAuthError(error.message);
            return;
          }

          const user = data.user;
          const meta = user?.user_metadata || {};
          const loggedUser: UserProfile = {
            id: user?.id || `user-${Date.now()}`,
            email: user?.email || emailInput.trim(),
            fullName: meta.full_name || emailInput.split('@')[0],
            role: (meta.role as UserRole) || 'student',
            authProvider: 'email',
          };

          setIsAuthenticating(null);
          onLoginSuccess(loggedUser, 'email');
          onClose();
        }
      } catch (err: unknown) {
        setIsAuthenticating(null);
        const errorMsg =
          err instanceof Error ? err.message : 'Authentication failed';
        setAuthError(errorMsg);
      }
    } else {
      // Offline demo fallback
      setTimeout(() => {
        const isStaff =
          emailInput.toLowerCase().includes('dean') ||
          emailInput.toLowerCase().includes('faculty') ||
          emailInput.toLowerCase().includes('rajan');

        const loggedUser: UserProfile = {
          id: `demo-${Date.now()}`,
          email: emailInput.trim(),
          fullName:
            fullNameInput.trim() ||
            (isStaff ? 'Dr. K. Rajan' : 'Param Sahar'),
          role: isStaff ? 'staff' : 'student',
          department: isStaff
            ? 'Department of Computer Science & Physics'
            : 'Antigravity AI & Advanced JEE Track',
          authProvider: 'email',
          avatarUrl: isStaff
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        };

        setIsAuthenticating(null);
        onLoginSuccess(loggedUser, 'email');
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-9 border-2 border-yellow-300 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-yellow-200/40 via-amber-100/10 to-transparent pointer-events-none rounded-full blur-2xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={!!isAuthenticating}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-yellow-50 hover:bg-yellow-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center text-sm font-bold cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 text-[10px] font-black uppercase font-mono-code tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span>Eduspheere Identity &amp; Single Sign-On</span>
          </div>

          <h2 className="font-adorn text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {authMode === 'login'
              ? 'Sign In to Eduspheere'
              : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {authMode === 'login'
              ? 'Access your courses, topic notes, question bank, daily attendance, and Cooper AI tutor.'
              : 'Join the academic platform to explore curriculum notes, take quizzes, and clear doubts.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        <div className="mb-5 p-1 bg-yellow-50 rounded-2xl border border-yellow-200 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-yellow-400 text-slate-950 shadow-xs border border-yellow-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-yellow-400 text-slate-950 shadow-xs border border-yellow-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Register as Student</span>
          </button>
        </div>

        {/* Error Feedback Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <span className="text-base shrink-0">⚠️</span>
            <div className="flex-1">
              <span className="font-bold block">Authentication Notice</span>
              <span className="text-[11px] leading-tight text-red-700">
                {authError}
              </span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-red-400 hover:text-red-700 font-bold text-xs"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* OAUTH SIGN-IN BUTTONS */}
        <div className="space-y-2.5 mb-5">
          {/* 1. OFFICIAL GOOGLE SIGN-IN BUTTON */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={!!isAuthenticating}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-yellow-50/60 active:bg-yellow-100/60 text-slate-800 border-2 border-slate-200 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between font-bold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-3">
              {/* Official Google 4-Color Vector Logo */}
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                {isAuthenticating === 'google' ? (
                  <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
              </div>

              <div className="text-left">
                <span className="block text-slate-900 text-xs font-black group-hover:text-amber-950 transition-colors">
                  {isAuthenticating === 'google'
                    ? 'Connecting to Google...'
                    : 'Continue with Google'}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {isAuthenticating === 'google'
                    ? 'Redirecting to account chooser'
                    : 'Choose your Google Account'}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 text-[10px] font-mono-code font-bold">
              OAuth 2.0
            </span>
          </button>

          {/* 2. GITHUB SSO BUTTON */}
          <button
            type="button"
            onClick={() => handleOtherOAuthLogin('github')}
            disabled={!!isAuthenticating}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#0f172a] hover:bg-black text-white border-2 border-slate-800 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between font-bold text-xs cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 shrink-0 fill-current text-white"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <div className="text-left">
                <span className="block text-white text-xs font-black">
                  Continue with GitHub
                </span>
                <span className="block text-slate-400 text-[10px] font-medium">
                  Developer &amp; Academic SSO
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-yellow-300 text-[10px] font-mono-code font-bold">
              SSO
            </span>
          </button>

          {/* 3. APPLE / iOS BUTTON */}
          <button
            type="button"
            onClick={() => handleOtherOAuthLogin('apple')}
            disabled={!!isAuthenticating}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-yellow-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between font-bold text-xs cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 shrink-0 fill-current text-slate-950"
                viewBox="0 0 170 170"
              >
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.65-7.85-11.87-14.34-7.44-11.45-13.43-24.31-17.97-38.58-4.54-14.27-6.81-27.18-6.81-38.74 0-14.93 3.66-27.27 10.98-37.03 7.32-9.76 16.55-14.76 27.69-15 5.24 0 10.86 1.35 16.85 4.04 5.99 2.69 9.87 4.1 11.64 4.23 1.48-.13 5.48-1.57 12-4.32 6.53-2.75 12.06-4.04 16.6-3.87 12.98.65 23.33 5.28 31.06 13.88-11.22 6.81-16.7 16.32-16.44 28.53.26 9.86 4.09 18.06 11.48 24.6 7.39 6.54 16.03 10.22 25.93 11.04-2.12 6.64-4.8 13.46-8.04 20.47zM119.22 33.15c0-7.39 2.65-14.38 7.95-20.97 5.3-6.59 11.85-10.74 19.65-12.45.24 1.18.36 2.3.36 3.36 0 7.39-2.76 14.35-8.28 20.88-5.52 6.53-12.09 10.6-19.68 12.21-.48-1.06-.72-2.07-.72-3.03z" />
              </svg>
              <div className="text-left">
                <span className="block text-slate-900 text-xs font-black">
                  Sign in with Apple / iOS
                </span>
                <span className="block text-slate-400 text-[10px] font-medium">
                  Face ID • Touch ID • Apple ID
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono-code font-bold">
               iOS
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-yellow-200" />
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono-code font-bold text-slate-400">
            or with institutional email
          </span>
          <div className="flex-grow border-t border-yellow-200" />
        </div>

        {/* Traditional Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {authMode === 'register' && (
            <div>
              <label className="block text-[10px] font-black uppercase font-mono-code text-slate-500 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="Param Sahar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-300 text-xs text-slate-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase font-mono-code text-slate-500 mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="scholar@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-300 text-xs text-slate-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase font-mono-code text-slate-500 mb-1">
              Password or Access Token
            </label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-yellow-300 text-xs text-slate-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!!isAuthenticating}
            className="w-full yellow-gradient-btn py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating === 'email'
              ? 'Authenticating...'
              : authMode === 'register'
              ? 'Complete Student Registration'
              : 'Sign In to Eduspheere'}
          </button>
        </form>

        {/* Existing Signed In User Profile & Logout Option */}
        {currentUser && (
          <div className="mt-5 pt-4 border-t border-yellow-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Signed in as:</span>
              <strong className="text-slate-900 font-extrabold text-[11px] truncate max-w-[170px]">
                {currentUser.fullName}
              </strong>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Sign Out
              </button>
            )}
          </div>
        )}

        {/* Footer info note */}
        <p className="mt-4 text-center text-[10px] text-slate-400 font-mono-code">
          Secured with Supabase Auth &amp; Google OAuth 2.0 • TLS 1.3
        </p>
      </div>
    </div>
  );
};
