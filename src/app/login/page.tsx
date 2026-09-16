'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate Google OAuth provider.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1420] text-[#E8EAF0] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[#161D2C] border border-[#2A3346] rounded p-6 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#E8EAF0]">Burnly</h1>
          <p className="text-xs text-[#8B92A8]">Financial Model & Runway Sandbox</p>
        </div>

        <div className="border-t border-[#2A3346] pt-4">
          <h2 className="text-sm font-semibold text-[#E8EAF0] mb-1">Sign in to your account</h2>
          <p className="text-xs text-[#8B92A8]">Enter your credentials to access your financial scenarios</p>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-[#B4694A]/10 border border-[#B4694A]/40 rounded text-xs text-[#B4694A]">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2 bg-[#0E1420] hover:bg-[#1a2336] border border-[#2A3346] text-[#E8EAF0] text-xs font-semibold rounded flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#2A3346] w-full" />
          <span className="bg-[#161D2C] px-2 text-[11px] text-[#8B92A8] absolute">or</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="block text-xs text-[#8B92A8] mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@startup.com"
              className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-3 py-1.5 text-xs text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8B92A8] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0E1420] border border-[#2A3346] rounded px-3 py-1.5 text-xs text-[#E8EAF0] focus:outline-none focus:border-[#C9A15D]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-[#C9A15D] hover:bg-[#b58e4b] text-[#0E1420] font-semibold text-xs rounded transition disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#8B92A8]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#C9A15D] hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
