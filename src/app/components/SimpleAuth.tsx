'use client'

import { useState, useEffect } from 'react';

export function useSimpleAuth() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('terminaltype_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, name?: string) => {
    const userData = { email, name };
    localStorage.setItem('terminaltype_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('terminaltype_user');
    setUser(null);
  };

  return { user, login, logout };
}

export function LoginModal({ onLogin }: { onLogin: (email: string, name?: string) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email, name);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 md:p-10 bg-matrix-primary/10 border-2 border-matrix-primary rounded-2xl backdrop-blur-sm shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold text-matrix-primary text-center mb-8 drop-shadow-[0_0_20px_rgba(0,255,136,0.3)]">
          Welcome to TerminalType
        </h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3.5 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary placeholder:text-matrix-light/50 rounded-lg font-mono text-sm focus:outline-none focus:border-matrix-primary focus:bg-matrix-primary/10 focus:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all"
        />  
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary placeholder:text-matrix-light/50 rounded-lg font-mono text-sm focus:outline-none focus:border-matrix-primary focus:bg-matrix-primary/10 focus:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all"
        />
        
        <button
          type="submit"
          className="w-full px-6 py-3.5 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,255,136,0.5)] transition-all mt-6"
        >
          Start Typing
        </button>
      </form>
    </div>
  );
}