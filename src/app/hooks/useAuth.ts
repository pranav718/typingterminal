'use client'

import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCallback } from "react";

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const createGuestUser = useMutation(api.users.createGuestUser);

  const loginWithGoogle = useCallback(async () => {
    await signIn("google");
  }, [signIn]);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    await signIn("password", { email, password, flow: "signIn" });
  }, [signIn]);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    await signIn("password", { 
      email, 
      password, 
      flow: "signUp",
      ...(name && { name })
    });
  }, [signIn]);

  const continueAsGuest = useCallback(async () => {
    await createGuestUser();
  }, [createGuestUser]);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    user,
    dbUser: user,
    isLoading: user === undefined,
    isAuthenticated: !!user,
    isGuest: user?.role === 'guest' || user?.isAnonymous === true,
    loginWithGoogle,
    loginWithCredentials,
    signup,
    continueAsGuest,
    logout,
  };
}