import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserClient = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_clients')
        .select(`
          role,
          clients (
            id,
            name,
            domain,
            logo_url,
            primary_color
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user client:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user client:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Create a timeout promise that resolves after 10 seconds
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve({ timedOut: true }), 10000)
        );
        
        // Race between session retrieval and timeout
        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (result.timedOut) {
          console.warn('Session request timed out after 10 seconds, proceeding without session');
          setUser(null);
          setClient(null);
        } else {
          // Normal session result
          if (result.error) {
            console.error('Error getting session:', result.error);
            setUser(null);
            setClient(null);
          } else if (result.data?.session?.user) {
            setUser(result.data.session.user);
            const userClient = await fetchUserClient(result.data.session.user.id);
            setClient(userClient);
          } else {
            setUser(null);
            setClient(null);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setClient(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        try {
          if (session?.user) {
            console.log('User authenticated, fetching client data...');
            const userClient = await fetchUserClient(session.user.id);
            if (!userClient) {
              // User is authenticated but not associated with any client
              console.warn('User authenticated but not associated with any client, signing out');
              await supabase.auth.signOut();
              // The sign out will trigger this listener again with null session
              return;
            }
            console.log('User and client data loaded successfully');
            setUser(session.user);
            setClient(userClient);
          } else {
            console.log('User signed out or no session');
            setUser(null);
            setClient(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
          setClient(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Don't do client validation here - let the auth state change listener handle it
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Note: User will need to be associated with a client by an admin
    // The user_client relationship should be created through an invitation system

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    client,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};