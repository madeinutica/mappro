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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const userClient = await fetchUserClient(session.user.id);
        setClient(userClient);
      } else {
        setUser(null);
        setClient(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const userClient = await fetchUserClient(session.user.id);
          setClient(userClient);
        } else {
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
    return { data, error };
  };

  const signUp = async (email, password, clientId = null) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // If signup successful and we have a clientId, create the user_client relationship
    if (data.user && !error && clientId) {
      try {
        const { error: clientError } = await supabase
          .from('user_clients')
          .insert({
            user_id: data.user.id,
            client_id: clientId,
            role: 'admin'
          });

        if (clientError) {
          console.error('Error creating user-client relationship:', clientError);
        }
      } catch (clientError) {
        console.error('Error creating user-client relationship:', clientError);
      }
    }

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