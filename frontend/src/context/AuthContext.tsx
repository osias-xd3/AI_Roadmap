"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  signInWithGoogleRedirect,
  logoutUser,
} from "../lib/firebase";
import { AlertTriangle, ExternalLink, UserCheck, X, RefreshCw } from "lucide-react";

interface AuthErrorDetails {
  code: string;
  title: string;
  message: string;
  actionTip: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  authError: AuthErrorDetails | null;
  clearAuthError: () => void;
  signIn: () => Promise<void>;
  signInRedirect: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  authError: null,
  clearAuthError: () => {},
  signIn: async () => {},
  signInRedirect: async () => {},
  continueAsGuest: () => {},
  signOut: async () => {},
  getToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);

  // Check redirect result and auth state listener
  useEffect(() => {
    // 1. Capture redirect login if returned from redirect flow
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          const idToken = await result.user.getIdToken();
          setToken(idToken);
          setAuthError(null);
        }
      })
      .catch((err) => {
        console.warn("Firebase redirect auth result notice:", err);
      });

    // 2. Auth state observer
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (e) {
          console.error("Failed to get ID token", e);
          setToken(null);
        }
      } else {
        // Only reset if not in demo student session
        setUser((prev) => {
          if (prev && prev.uid.startsWith("guest-")) return prev;
          return null;
        });
        setToken((prev) => {
          if (prev && prev.startsWith("dev-test-token:")) return prev;
          return null;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const loggedUser = await signInWithGoogle();
      const idToken = await loggedUser.getIdToken();
      setUser(loggedUser);
      setToken(idToken);
    } catch (err: any) {
      console.error("Sign in failed:", err);
      const code = err?.code || "unknown";
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "your domain";

      if (code === "auth/unauthorized-domain") {
        setAuthError({
          code,
          title: "Firebase Unauthorized Domain",
          message: `The domain "${currentHost}" is not listed in your Firebase Authorized Domains list. Google OAuth terminates the popup immediately when the domain is unauthorized.`,
          actionTip: `Go to Firebase Console → Authentication → Settings → Authorized domains, and click "Add domain" to add "${currentHost}".`,
        });
      } else if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setAuthError({
          code,
          title: "Sign-In Popup Closed or Blocked",
          message:
            "The Google authentication popup closed before completing the sign-in flow. This is commonly caused by browser popup blockers, Cross-Origin Opener Policy (COOP), or third-party cookie restrictions.",
          actionTip:
            "Click 'Sign In with Redirect' below to bypass popup restrictions, or 'Continue as Demo Student' to start exploring immediately.",
        });
      } else if (code === "auth/operation-not-allowed") {
        setAuthError({
          code,
          title: "Google Sign-In Provider Disabled",
          message:
            "Google Authentication is not enabled in your Firebase project.",
          actionTip:
            "Go to Firebase Console → Authentication → Sign-in method, and enable Google.",
        });
      } else {
        setAuthError({
          code,
          title: "Authentication Notice",
          message: err?.message || "Failed to complete Google Sign-In.",
          actionTip:
            "You can try 'Sign In with Redirect' or 'Continue as Demo Student' below.",
        });
      }
    }
  };

  const handleSignInRedirect = async () => {
    setAuthError(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      console.error("Redirect sign in failed:", err);
      setAuthError({
        code: err?.code || "redirect-error",
        title: "Redirect Sign-In Notice",
        message: err?.message || "Failed to initiate redirect sign-in.",
        actionTip: "You can continue as Demo Student below.",
      });
    }
  };

  const continueAsGuest = () => {
    const guestUser = {
      uid: "guest-" + Date.now(),
      displayName: "Student Scholar",
      email: "guest@roadmap.ai",
      photoURL: null,
    } as unknown as User;
    setUser(guestUser);
    setToken("dev-test-token:demo-student");
    setAuthError(null);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      setAuthError(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) {
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
        authError,
        clearAuthError: () => setAuthError(null),
        signIn: handleSignIn,
        signInRedirect: handleSignInRedirect,
        continueAsGuest,
        signOut: handleSignOut,
        getToken,
      }}
    >
      {children}

      {/* Auth Error / Guidance Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setAuthError(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{authError.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {authError.code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {authError.message}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-amber-300 block">How to resolve:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                {authError.actionTip}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={handleSignInRedirect}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sign In via Redirect</span>
              </button>

              <button
                onClick={continueAsGuest}
                className="w-full sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Demo Student</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

