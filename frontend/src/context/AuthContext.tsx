"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, logoutUser } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  signIn: async () => {},
  signOut: async () => {},
  getToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (e) {
          console.error("Failed to get ID token", e);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      const idToken = await loggedUser.getIdToken();
      setUser(loggedUser);
      setToken(idToken);
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) {
      // In dev mode when offline or testing without signin, allow dev token
      return token || "dev-test-token:demo-student";
    }
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      setToken(freshToken);
      return freshToken;
    } catch {
      return token || "dev-test-token:demo-student";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        signIn: handleSignIn,
        signOut: handleSignOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
