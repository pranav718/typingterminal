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
      className="w-full px-6 py-3 border-2 border-[#41ff5f50] text-[#41ff5f] rounded hover:bg-[#41ff5f10] hover:border-[#41ff5f] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wider text-sm"
    >
      {isLoading ? 'INITIALIZING...' : '> CONTINUE AS GUEST'}
    </button>
  );
}