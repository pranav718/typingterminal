'use client'

import { useAuthActions } from '../../hooks/useAuth';
import { useState } from 'react';

export default function GuestButton() {
  const { continueAsGuest } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestClick = async () => {
    try {
      setIsLoading(true);
      await continueAsGuest();
    } catch (error) {
      console.error('Failed to continue as guest:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGuestClick}
      disabled={isLoading}
      className="w-full px-6 py-3.5 border-2 border-matrix-primary/50 text-matrix-primary rounded-lg hover:bg-matrix-primary/10 hover:border-matrix-primary transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Loading...' : 'Continue as Guest'}
    </button>
  );
}