'use client'

import { useState } from 'react';
import { useAuthActions } from '../../hooks/useAuth';

export default function SignupForm() {
  const { signInWithGoogle, signInWithTwitter, signUp } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 8) {
      setError('PASSWORD TOO SHORT (MIN 8 CHARS)');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
    } catch (err: any) {
      setError(err.message || 'SIGNUP FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('GOOGLE AUTH FAILED');
      setIsLoading(false);
    }
  };

  const handleXSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithTwitter();
    } catch (err: any) {
      setError('X AUTH FAILED');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button 
        onClick={handleGoogleSignup} 
        disabled={isLoading} 
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 font-semibold rounded border-2 border-gray-300 hover:bg-gray-100 transition-all disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        SIGN UP WITH GOOGLE
      </button>

      <button
        onClick={handleXSignup}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black text-white font-semibold rounded border-2 border-black hover:bg-gray-900 hover:border-gray-800 transition-all disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        SIGN UP WITH X
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#41ff5f20]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#001a0f] text-[#7bff9a]/60 font-mono">OR CREATE ACCOUNT</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#ff5f4110] border border-[#ff5f4180] rounded text-[#ff5f41] text-sm font-mono">
            ERROR: {error}
          </div>
        )}

        <input
          type="text"
          placeholder="NAME (OPTIONAL)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#003018]/30 border-2 border-[#41ff5f30] text-[#41ff5f] placeholder:text-[#41ff5f50] rounded focus:outline-none focus:border-[#41ff5f] transition-all disabled:opacity-50 font-mono"
        />

        <input
          type="email"
          placeholder="EMAIL ADDRESS"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#003018]/30 border-2 border-[#41ff5f30] text-[#41ff5f] placeholder:text-[#41ff5f50] rounded focus:outline-none focus:border-[#41ff5f] transition-all disabled:opacity-50 font-mono"
        />

        <input
          type="password"
          placeholder="PASSWORD (MIN 8 CHARS)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#003018]/30 border-2 border-[#41ff5f30] text-[#41ff5f] placeholder:text-[#41ff5f50] rounded focus:outline-none focus:border-[#41ff5f] transition-all disabled:opacity-50 font-mono"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full terminal-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
        </button>
      </form>
    </div>
  );
}