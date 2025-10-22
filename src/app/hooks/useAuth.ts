'use client'

import { useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const { signOut } = useConvexAuthActions();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const localStorageGuest = localStorage.getItem('terminaltype_guest') === 'true';
    const userIsAnonymous = user?.isAnonymous === true;
    
    setIsGuest(userIsAnonymous || (isAuthenticated && localStorageGuest));
    
  }, [user, isAuthenticated]);

  const logout = async () => {
    await signOut();
    localStorage.removeItem('terminaltype_guest');
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isGuest,
    logout,
  };
}

export function useAuthActions() {
  const { signIn } = useConvexAuthActions();

  return {
    signInWithGoogle: () => signIn("google"),
    signInWithTwitter: () => signIn("twitter"),
    signInWithCredentials: async (email: string, password: string) => {
      await signIn("password", { email, password, flow: "signIn" });
    },
    signUp: async (email: string, password: string, name?: string) => {
      const options: Record<string, any> = { email, password, flow: "signUp" };
      if (name !== undefined) {
        options.name = name;
      }
      await signIn("password", options);
    },
    continueAsGuest: async () => {
      await signIn("anonymous");
      localStorage.setItem('terminaltype_guest', 'true');
    },
  };
}