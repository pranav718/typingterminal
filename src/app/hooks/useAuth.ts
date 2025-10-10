'use client'

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { User } from '../types';

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  
  const createGuestUser = useMutation(api.users.createGuestUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  
  const dbUser = useQuery(
    api.users.getCurrentUser,
    user ? { email: user.email } : "skip"
  );

  useEffect(() => {
    if (session?.user) {
      setUser({
        email: session.user.email!,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        role: (session.user as any).role || 'user',
      });
    }
  }, [session]);

  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    await loginWithCredentials(email, password);
  };

  const continueAsGuest = async () => {
    const guestUser = await createGuestUser();
    setUser({
      id: guestUser,
      email: `guest_${Date.now()}@terminaltype.temp`,
      name: 'Guest User',
      role: 'guest',
    });
  };

  const logout = async () => {
    if (user?.role === 'guest') {
      setUser(null);
    } else {
      await signOut({ callbackUrl: '/' });
    }
  };

  useEffect(() => {
    if (user && !dbUser && user.role !== 'guest') {
      getOrCreateUser({
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      });
    }
  }, [user, dbUser, getOrCreateUser]);

  return {
    user,
    dbUser,
    isLoading: status === 'loading',
    isAuthenticated: !!user,
    isGuest: user?.role === 'guest',
    loginWithGoogle,
    loginWithCredentials,
    signup,
    continueAsGuest,
    logout,
  };
}
