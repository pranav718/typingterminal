'use client'

import { useState } from 'react';
import { useAuthActions } from '../../hooks/useAuth';

export default function LoginForm() {
  const { signInWithGoogle, signInWithTwitter, signInWithCredentials } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithCredentials(email, password);
    } catch (err: any) {
      if (err.message?.includes('InvalidAccountId')) {
        setError('No account found with this email. Please sign up first.');
      } else if (err.message?.includes('InvalidPassword')) {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Failed to login with Google');
      setIsLoading(false);
    }
  };

  const handleXLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithTwitter();
    } catch (err: any) {
      setError('Failed to login with X');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-all border-2 border-gray-300 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <button
        onClick={handleXLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all border-2 border-black hover:border-gray-800 disabled:opacity-50 shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Continue with X
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-matrix-primary/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-matrix-bg-darker text-matrix-light">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-4 py-3.5 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary placeholder:text-matrix-light/50 rounded-lg focus:outline-none focus:border-matrix-primary focus:bg-matrix-primary/10 transition-all disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="w-full px-4 py-3.5 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary placeholder:text-matrix-light/50 rounded-lg focus:outline-none focus:border-matrix-primary focus:bg-matrix-primary/10 transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3.5 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:-translate-y-1 hover:shadow-glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}