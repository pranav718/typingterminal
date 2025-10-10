'use client'

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import GuestButton from "./GuestButton"

interface AuthModalProps {
  onClose?: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-matrix-bg-darker border-2 border-matrix-primary rounded-2xl p-8 shadow-2xl animate-slide-up relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-error text-error hover:bg-error hover:text-matrix-bg transition-all"
          >
            ✕
          </button>
        )}
        
        <h1 className="text-3xl font-bold text-matrix-primary text-center mb-8 drop-shadow-glow">
          TerminalType
        </h1>

        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        )}

        <div className="mt-6">
          <GuestButton />
        </div>
      </div>
    </div>
  );
}