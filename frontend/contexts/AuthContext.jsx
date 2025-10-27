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
            // First try simple query without join
            const { data: simpleData, error: simpleError } = await supabase
              .from('user_clients')
              .select('role, client_id')
              .eq('user_id', result.data.session.user.id)
              .single();
            
            if (!simpleError && simpleData) {
              // Now get client data
              const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('id, name, domain, logo_url, primary_color')
                .eq('id', simpleData.client_id)
                .single();
              
              if (!clientError && clientData) {
                setUser(result.data.session.user);
                setClient({
                  role: simpleData.role,
                  clients: clientData
                });
              } else {
                console.warn('Initial session: failed to get client data - signing out');
                await supabase.auth.signOut();
                setUser(null);
                setClient(null);
              }
            } else {
              console.warn('Initial session: no user_clients association - signing out');
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
            console.log('Querying user_clients for userId:', session.user.id);
            // First try simple query without join
            const { data: simpleData, error: simpleError } = await supabase
              .from('user_clients')
              .select('role, client_id')
              .eq('user_id', session.user.id)
              .single();
            
            console.log('Simple query result:', { simpleData, simpleError });
            
            if (!simpleError && simpleData) {
              // Now get client data
              const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('id, name, domain, logo_url, primary_color')
                .eq('id', simpleData.client_id)
                .single();
              
              console.log('Client query result:', { clientData, clientError });
              
              if (!clientError && clientData) {
                const userClientData = {
                  role: simpleData.role,
                  clients: clientData
                };
                console.log('User and client data loaded successfully');
                setUser(session.user);
                setClient(userClientData);
              } else {
                console.warn('Failed to get client data:', clientError);
                await supabase.auth.signOut();
                setUser(null);
                setClient(null);
              }
            } else {
              console.warn('No user_clients association found:', simpleError);
              await supabase.auth.signOut();
              setUser(null);
              setClient(null);
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