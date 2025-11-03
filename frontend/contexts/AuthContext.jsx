import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
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

  // Development mode bypass for testing
  const DEV_MODE = process.env.NODE_ENV === 'development' && window.location.search.includes('dev=true');

  // Fetch user-client association from Supabase
  const fetchUserClient = async (firebaseUid) => {
    try {
      console.log('AuthContext: Fetching user-client association for Firebase UID:', firebaseUid);

      // For demo purposes, hardcode the association for the demo user
      // In production, this would come from the database
      console.log('AuthContext: Checking Firebase UID:', firebaseUid);

      // First, try to find client association in database
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, domain, logo_url, primary_color, subscription_status, subscription_plan, subscription_id, subscription_expires_at, stripe_customer_id')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (data) {
        console.log('AuthContext: Found client association in database:', data);
        return {
          role: 'admin',
          clients: data
        };
      }

      // If no database association, check for demo users
      if (firebaseUid === 'ibEEqGoyOOXeAbBg7QIREWmWa523') { // eflorez@newyorksash.com Firebase UID
        console.log('AuthContext: Demo user detected, associating with New York Sash client');
        return {
          role: 'admin',
          clients: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'New York Sash',
            domain: 'newyorksash.com',
            logo_url: null,
            primary_color: '#3B82F6',
            subscription_status: 'active',
            subscription_plan: 'pro',
            subscription_id: 'demo-subscription-123',
            subscription_expires_at: null,
            stripe_customer_id: 'demo-customer-123'
          }
        };
      }

      if (firebaseUid === 'tgXPDqooLxdwYw3zOT8u5KG4ssg2') { // Erick's Lawn Care Firebase UID
        console.log('AuthContext: Demo user detected, associating with Erick\'s Lawn Care client');
        return {
          role: 'admin',
          clients: {
            id: 'f2bbc15b-3ded-41bd-b636-84f3ac688a93',
            name: 'Erick\'s Lawn Care',
            domain: 'erickslawncare.com',
            logo_url: null,
            primary_color: '#10B981'
          }
        };
      }

      // No client association found
      console.warn('AuthContext: No client association found for Firebase UID:', firebaseUid);
      return null;
    } catch (error) {
      console.error('Error in fetchUserClient:', error);
      return null;
    }
  };

  useEffect(() => {
    // Development mode bypass
    if (DEV_MODE) {
      console.log('AuthContext: Development mode enabled - bypassing Firebase auth');
      setUser({
        uid: 'dev-user-123',
        email: 'dev@example.com',
        displayName: 'Development User'
      });
      
      // Set up demo client for New York Sash
      setClient({
        role: 'admin',
        clients: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'New York Sash',
          domain: 'newyorksash.com',
          logo_url: null,
          primary_color: '#3B82F6',
          subscription_status: 'active',
          subscription_plan: 'pro',
          subscription_id: 'dev-subscription-123',
          subscription_expires_at: null,
          stripe_customer_id: 'dev-customer-123'
        }
      });
      
      setLoading(false);
      return;
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: Firebase auth state change:', firebaseUser?.email || 'signed out', 'UID:', firebaseUser?.uid);

      try {
        if (firebaseUser) {
          console.log('AuthContext: Firebase user authenticated - UID:', firebaseUser.uid, 'Email:', firebaseUser.email);

          // Set the user state immediately
          setUser(firebaseUser);

          // For demo purposes, don't try to set Supabase session with Firebase token
          // Supabase will use anonymous access for data operations
          console.log('AuthContext: Using anonymous Supabase access for demo');

          // Get client association data from Supabase
          const clientData = await fetchUserClient(firebaseUser.uid);

          if (clientData) {
            console.log('AuthContext: Setting client data:', clientData);
            setClient(clientData);
          } else {
            console.log('AuthContext: No client association found');
            setClient(null);
          }
        } else {
          console.log('AuthContext: Firebase user signed out');
          setUser(null);
          setClient(null);
        }
      } catch (error) {
        console.error('AuthContext: Error in Firebase auth state change:', error);
        setUser(null);
        setClient(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      // Add a small delay to prevent rapid retries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful:', userCredential.user.email);

      // Return a session-like object that matches what Auth.jsx expects
      return {
        data: {
          user: userCredential.user,
          session: {
            user: userCredential.user,
            access_token: await userCredential.user.getIdToken(),
            refresh_token: userCredential.user.refreshToken
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Firebase sign in error:', error);
      
      // Handle rate limiting specifically
      if (error.code === 'auth/too-many-requests') {
        return {
          data: null,
          error: {
            message: 'Too many sign-in attempts. Please wait a few minutes before trying again, or try signing in from a different device/browser.'
          }
        };
      }
      
      return { data: null, error };
    }
  };

  const signUp = async (email, password, companyName, domain) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign up successful:', userCredential.user.email);

      // Generate a unique client name from email domain if not provided
      const baseName = companyName || email.split('@')[1]?.split('.')[0] || 'My Company';
      const clientName = `${baseName} ${Date.now()}`; // Add timestamp to ensure uniqueness
      
      // Don't use generic email domains as unique client domains
      const emailDomain = email.split('@')[1];
      const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com'];
      const clientDomain = (!genericDomains.includes(emailDomain) && domain) ? domain : null;

      // Create new client in Supabase
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientName,
          domain: clientDomain, // Only set domain if it's not a generic email domain
          firebase_uid: userCredential.user.uid
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        // If client creation fails, we should still allow the user to be created
        // They can try again or contact support
        return {
          data: {
            user: userCredential.user,
            client: null
          },
          error: { message: 'Account created but client setup failed. Please contact support.' }
        };
      }

      console.log('New client created:', newClient);

      return {
        data: {
          user: userCredential.user,
          client: {
            role: 'admin',
            clients: newClient
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Firebase sign up error:', error);

      // Handle email already in use - try to sign in and associate with client
      if (error.code === 'auth/email-already-in-use') {
        console.log('Email already exists, attempting to sign in and associate with client...');

        try {
          // Try to sign in with the provided credentials
          const signInResult = await signInWithEmailAndPassword(auth, email, password);
          console.log('Sign in successful for existing user:', signInResult.user.email);

          // Check if user already has a client
          const { data: existingClient, error: fetchError } = await supabase
            .from('clients')
            .select('*')
            .eq('firebase_uid', signInResult.user.uid)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking for existing client:', fetchError);
            return {
              data: {
                user: signInResult.user,
                client: null
              },
              error: { message: 'Account exists but client association failed. Please contact support.' }
            };
          }

          if (existingClient) {
            console.log('User already has client:', existingClient);
            return {
              data: {
                user: signInResult.user,
                client: {
                  role: 'admin',
                  clients: existingClient
                }
              },
              error: null
            };
          }

          // User exists but no client - create one
          console.log('User exists but no client found, creating new client...');
          const baseName = companyName || email.split('@')[1]?.split('.')[0] || 'My Company';
          const clientName = `${baseName} ${Date.now()}`; // Add timestamp to ensure uniqueness
          
          // Don't use generic email domains as unique client domains
          const emailDomain = email.split('@')[1];
          const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com'];
          const clientDomain = (!genericDomains.includes(emailDomain) && domain) ? domain : null;

          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              domain: clientDomain, // Only set domain if it's not a generic email domain
              firebase_uid: signInResult.user.uid
            })
            .select()
            .single();

          if (clientError) {
            console.error('Error creating client for existing user:', clientError);
            return {
              data: {
                user: signInResult.user,
                client: null
              },
              error: { message: 'Account exists but client setup failed. Please contact support.' }
            };
          }

          console.log('New client created for existing user:', newClient);
          return {
            data: {
              user: signInResult.user,
              client: {
                role: 'admin',
                clients: newClient
              }
            },
            error: null
          };

        } catch (signInError) {
          console.error('Failed to sign in existing user:', signInError);
          return {
            data: null,
            error: { message: 'This email is already registered. Please sign in with your existing password or reset your password.' }
          };
        }
      }

      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (DEV_MODE) {
      console.log('AuthContext: Development mode sign out');
      setUser(null);
      setClient(null);
      return { error: null };
    }

    try {
      await firebaseSignOut(auth);
      console.log('Firebase sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Firebase sign out error:', error);
      return { error };
    }
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