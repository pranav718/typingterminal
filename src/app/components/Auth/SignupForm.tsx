'use client'

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup, loginWithGoogle, loginWithTwitter } = useAuth();
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
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  const handleTwitterSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithTwitter();
    } catch (err: any) {
      setError('Failed to sign up with Twitter');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={handleGoogleSignup}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-all border-2 border-gray-300 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>
      
      <button
        onClick={handleTwitterSignup}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1DA1F2] text-white font-semibold rounded-lg hover:bg-[#1a8cd8] transition-all disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        Sign up with Twitter
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
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3.5 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary placeholder:text-matrix-light/50 rounded-lg focus:outline-none focus:border-matrix-primary focus:bg-matrix-primary/10 transition-all disabled:opacity-50"
        />

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
          placeholder="Password (min. 8 characters)"
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
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-matrix-light">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-matrix-primary font-semibold hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}