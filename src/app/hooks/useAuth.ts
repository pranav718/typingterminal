'use client'

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCallback, useState, useEffect } from "react";

type AppUser = {
  _id?: string;
  email?: string;
  name?: string;
  image?: string;
  isGuest?: boolean;
};

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const dbUser = useQuery(api.users.getCurrentUser);
  const [isGuest, setIsGuest] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem('terminaltype_guest');
    if (guestMode === 'true') {
      setIsGuest(true);
    }
    setIsInitialized(true);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    localStorage.removeItem('terminaltype_guest');
    setIsGuest(false);
    await signIn("google");
  }, [signIn]);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    localStorage.removeItem('terminaltype_guest');
    setIsGuest(false);
    await signIn("password", { email, password, flow: "signIn" });
  }, [signIn]);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    localStorage.removeItem('terminaltype_guest');
    setIsGuest(false);
    await signIn("password", { 
      email, 
      password, 
      flow: "signUp",
      ...(name && { name })
    });
  }, [signIn]);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem('terminaltype_guest', 'true');
    setIsGuest(true);
  }, []);

  const logout = useCallback(async () => {
    if (isGuest) {
      localStorage.removeItem('terminaltype_guest');
      setIsGuest(false);
    } else {
      await signOut();
    }
  }, [signOut, isGuest]);

  const user: AppUser | null = isGuest 
    ? { 
        email: 'guest@terminaltype.temp', 
        name: 'Guest User',
        image: undefined,
        isGuest: true 
      }
    : dbUser 
    ? {
        ...dbUser,
        isGuest: false
      }
    : null;

  return {
    user,
    dbUser: isGuest ? null : dbUser,
    isLoading: !isInitialized || (dbUser === undefined && !isGuest),
    isAuthenticated: !!user,
    isGuest,
    loginWithGoogle,
    loginWithCredentials,
    signup,
    continueAsGuest,
    logout,
  };
}