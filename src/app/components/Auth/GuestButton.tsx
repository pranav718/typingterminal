'use client'

import { useAuth } from '../../hooks/useAuth';

export default function GuestButton() {
  const { continueAsGuest } = useAuth();

  return (
    <button
      onClick={continueAsGuest}
      className="w-full px-6 py-3.5 border-2 border-matrix-primary/50 text-matrix-primary rounded-lg hover:bg-matrix-primary/10 hover:border-matrix-primary transition-all font-semibold"
    >
      Continue as Guest
    </button>
  );
}