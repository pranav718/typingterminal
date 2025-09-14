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
    <div className="login-modal">
      <form onSubmit={handleSubmit}>
        <h2>Welcome to TerminalType</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="terminal-input"
        />
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="terminal-input"
        />
        <button type="submit" className="terminal-btn">
          Start Typing
        </button>
      </form>
    </div>
  );
}