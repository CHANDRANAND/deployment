import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { hashMpin } from '../utils/crypto.js';

const SUPABASE_URL = 'https://zqaswazhdzjkmgbjbmja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXN3YXpoZHpqa21nYmpibWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTYyNTYsImV4cCI6MjEwMzQ5MjI1Nn0.v_qkPtbVe3cHtzVnUcY1jUwgv9qqMbsMrwMUEpUr8gg';
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authStage, setAuthStage] = useState('credentials'); // 'credentials' | 'setup' | 'mpin'
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authError, setAuthError] = useState('');
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const sessionTimeoutRef = useRef(null);

  const unlockStorageKey = (userId) => `lab-workspace-unlocked-${userId}`;
  const getStoredUnlock = (userId) => {
    try {
      const storedAt = Number(sessionStorage.getItem(unlockStorageKey(userId)) || 0);
      return storedAt > 0 && Date.now() - storedAt < SESSION_TIMEOUT_MS;
    } catch (err) {
      return false;
    }
  };
  const rememberUnlock = (userId) => {
    try { sessionStorage.setItem(unlockStorageKey(userId), String(Date.now())); } catch (err) {}
  };
  const clearRememberedUnlock = (userId) => {
    try { sessionStorage.removeItem(unlockStorageKey(userId)); } catch (err) {}
  };

  // Initialize Supabase
  useEffect(() => {
    if (getStoredUnlock('guest')) {
      setCurrentUser({ id: 'guest', email: 'guest@lab.local' });
      setIsUnlocked(true);
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabaseClient(client);

        client.auth.getSession().then(({ data }) => {
          if (data?.session?.user) {
            handleUserAuthenticated(data.session.user, client);
          }
        });

        client.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            handleUserAuthenticated(session.user, client);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setIsUnlocked(false);
            setAuthStage('credentials');
          }
        });
      }
    } catch (err) {
      console.warn('Supabase initialization fallback to offline mode:', err);
    }
  }, []);

  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (isUnlocked) {
      sessionTimeoutRef.current = setTimeout(() => {
        setIsUnlocked(false);
        setAuthStage('mpin');
      }, SESSION_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => resetSessionTimer();
    events.forEach((ev) => window.addEventListener(ev, handler));
    resetSessionTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler));
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [isUnlocked]);

  const loadUserProfile = async (user, client) => {
    const localKey = `lab-user-profile-${user.id}`;
    let profile = null;

    if (client) {
      try {
        const { data } = await client
          .from('lab_user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) profile = data;
      } catch (err) {
        console.warn('Could not fetch cloud user profile:', err);
      }
    }

    if (!profile) {
      const local = localStorage.getItem(localKey);
      if (local) {
        try { profile = JSON.parse(local); } catch (e) {}
      }
    }

    setUserProfile(profile);
    return profile;
  };

  const handleUserAuthenticated = async (user, client) => {
    setCurrentUser(user);
    const profile = await loadUserProfile(user, client);
    if (!profile?.mpin_hash) {
      setAuthStage('setup');
    } else if (getStoredUnlock(user.id)) {
      setIsUnlocked(true);
    } else {
      setAuthStage('mpin');
    }
  };

  const signIn = async (email, password) => {
    setAuthError('');
    if (!supabaseClient) {
      // Offline mock authentication
      const mockUser = { id: 'offline-user', email };
      setCurrentUser(mockUser);
      setIsUnlocked(true);
      rememberUnlock(mockUser.id);
      return;
    }
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    await handleUserAuthenticated(data.user, supabaseClient);
  };

  const signUp = async (email, password, logoData, backgroundData) => {
    setAuthError('');
    if (!supabaseClient) {
      const mockUser = { id: 'offline-user', email };
      setCurrentUser(mockUser);
      setAuthStage('setup');
      return;
    }
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    if (data.user) {
      if (logoData || backgroundData) {
        try {
          await supabaseClient.from('lab_user_profiles').upsert({
            id: data.user.id,
            logo_data: logoData || null,
            background_data: backgroundData || null
          });
        } catch (e) {}
      }
      await handleUserAuthenticated(data.user, supabaseClient);
    }
  };

  const verifyMpin = async (mpin) => {
    setAuthError('');
    if (!currentUser) return false;
    const computedHash = await hashMpin(currentUser.id, mpin);
    
    if (userProfile?.mpin_hash && userProfile.mpin_hash !== computedHash) {
      setAuthError('Incorrect MPIN. Please try again.');
      return false;
    }

    setIsUnlocked(true);
    rememberUnlock(currentUser.id);
    return true;
  };

  const saveMpin = async (mpin) => {
    setAuthError('');
    if (!currentUser) return false;
    const hashed = await hashMpin(currentUser.id, mpin);

    const updatedProfile = {
      ...(userProfile || {}),
      id: currentUser.id,
      mpin_hash: hashed,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(`lab-user-profile-${currentUser.id}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);

    if (supabaseClient) {
      try {
        await supabaseClient.from('lab_user_profiles').upsert(updatedProfile);
      } catch (err) {
        console.warn('Failed to sync profile MPIN to cloud:', err);
      }
    }

    setIsUnlocked(true);
    rememberUnlock(currentUser.id);
    return true;
  };

  const signOut = async () => {
    if (supabaseClient) {
      try { await supabaseClient.auth.signOut(); } catch (e) {}
    }
    setCurrentUser(null);
    setIsUnlocked(false);
    clearRememberedUnlock(currentUser?.id);
    setUserProfile(null);
    setAuthStage('credentials');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isUnlocked,
        authStage,
        setAuthStage,
        authMode,
        setAuthMode,
        authError,
        setAuthError,
        supabaseClient,
        userProfile,
        signIn,
        signUp,
        verifyMpin,
        saveMpin,
        signOut,
        unlockGuest: () => {
          const guestUser = { id: 'guest', email: 'guest@lab.local' };
          setCurrentUser(guestUser);
          setIsUnlocked(true);
          rememberUnlock(guestUser.id);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
