import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { logoutAccount } from "@/lib/tandemy-db";
import type { PrivateAccount, UserProfile } from "@/lib/tandemy-types";

interface TandemyAuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  privateAccount: PrivateAccount | null;
  loading: boolean;
  needsOnboarding: boolean;
  signOut: () => Promise<void>;
}

const TandemyAuthContext = createContext<TandemyAuthContextValue>({
  user: null,
  profile: null,
  privateAccount: null,
  loading: true,
  needsOnboarding: false,
  signOut: async () => {},
});

export function useTandemyAuth() {
  return useContext(TandemyAuthContext);
}

export function useStudentSession(): User | null {
  return useContext(TandemyAuthContext).user;
}

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateAccount, setPrivateAccount] = useState<PrivateAccount | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthResolved(true);
      if (!firebaseUser) {
        setProfile(null);
        setPrivateAccount(null);
        setProfileResolved(true);
      } else {
        setProfileResolved(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const unsubProfile = onSnapshot(
      doc(db, "profiles", user.uid),
      (snap) => {
        if (!active) return;
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setProfileResolved(true);
      },
      (error) => {
        if (!active) return;
        setProfileResolved(true);
        handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
      },
    );

    const unsubPrivate = onSnapshot(
      doc(db, "privateAccounts", user.uid),
      (snap) => {
        if (!active) return;
        setPrivateAccount(snap.exists() ? (snap.data() as PrivateAccount) : null);
      },
      (error) => {
        if (!active) return;
        console.warn("Private account listener:", error);
      },
    );

    return () => {
      active = false;
      unsubProfile();
      unsubPrivate();
    };
  }, [user]);

  const signOut = useCallback(async () => {
    await logoutAccount();
  }, []);

  const loading = !authResolved || (Boolean(user) && !profileResolved);
  const needsOnboarding = Boolean(user) && profileResolved && !profile;

  return (
    <TandemyAuthContext.Provider
      value={{
        user,
        profile,
        privateAccount,
        loading,
        needsOnboarding,
        signOut,
      }}
    >
      {children}
    </TandemyAuthContext.Provider>
  );
}
