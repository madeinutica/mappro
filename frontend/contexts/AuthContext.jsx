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
      console.log('Starting fetchUserClient for userId:', userId);
      // Add timeout to session fetch
      const sessionTimeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timedOut: true }), 10000)
      );
      const sessionPromise = supabase.auth.getSession();
      const sessionResult = await Promise.race([sessionPromise, sessionTimeoutPromise]);
      if (sessionResult.timedOut) {
        console.warn('fetchUserClient: getSession timed out after 10 seconds');
        return null;
      }
      const { data: { session }, error: sessionError } = sessionResult;
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }
      console.log('Current Supabase session:', session);
      // Add timeout to query
      const queryTimeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timedOut: true }), 5000)
      );
      const queryPromise = supabase
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
      const result = await Promise.race([queryPromise, queryTimeoutPromise]);
      if (result.timedOut) {
        console.warn('fetchUserClient: query timed out after 5 seconds');
        return null;
      }
      const { data, error, status, statusText } = result;
      console.log('fetchUserClient result:', { data, error, status, statusText });
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user client:', error);
        return null;
      }
      console.log('fetchUserClient completed successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserClient:', error);
      return null;
    }
  };

  const createUserClientRelationship = async (userId) => {
    try {
      console.log('Creating user-client relationship for userId:', userId);
      
      // For development, associate admin user with the default client
      const defaultClientId = '550e8400-e29b-41d4-a716-446655440000';
      
      const { data, error } = await supabase
        .from('user_clients')
        .insert({
          user_id: userId,
          client_id: defaultClientId,
          role: 'admin'
        })
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
        .single();

      if (error) {
        console.error('Error creating user-client relationship:', error);
        return null;
      }

      console.log('User-client relationship created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createUserClientRelationship:', error);
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
            const userClient = await fetchUserClient(result.data.session.user.id);
            if (userClient) {
              setUser(result.data.session.user);
              setClient(userClient);
            } else {
              // No client association - sign out
              console.warn('Initial session user has no client association - signing out');
              await supabase.auth.signOut();
              setUser(null);
              setClient(null);
            }
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
            let userClient = await fetchUserClient(session.user.id);
            if (!userClient) {
              // User is authenticated but not associated with any client - sign out
              console.warn('User authenticated but no client association found - signing out');
              await supabase.auth.signOut();
              setUser(null);
              setClient(null);
            } else {
              console.log('User and client data loaded successfully');
              setUser(session.user);
              setClient(userClient);
            }
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