import React, { useState, useEffect } from 'react';

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Automatically authenticate for development purposes
    const autoLogin = async () => {
      try {
        const response = await signInWithPassword({
          email: 'erick@erick.com',
          password: 'devpassword',
        });
        if (response.data?.user) {
          onAuthSuccess(response.data.user);
        }
      } catch (err) {
        console.error('Auto-login failed:', err.message);
      }
    };

    autoLogin();
  }, [onAuthSuccess]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await signInWithPassword({ email, password });
      if (response.error) throw response.error;
      if (response.data?.user) {
        onAuthSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

import { auth } from '../config/firebase.config';
import { supabase } from './supabaseClient';

export const getClientId = async () => {
  try {
    // Get current Firebase user
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    // For demo purposes, hardcode the association for the demo user
    // In production, this would come from the clients table with firebase_uid
    if (firebaseUser.uid === 'ibEEqGoyOOXeAbBg7QIREWmWa523') { // New York Sash Firebase UID
      return '550e8400-e29b-41d4-a716-446655440000'; // New York Sash client ID placeholder
    }

    // Query clients table directly using firebase_uid
    // This is simpler if each client has only one Firebase user
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('id')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (!error && client) {
        return client.id;
      }
    } catch (err) {
      console.warn('Firebase UID lookup in clients table failed:', err.message);
    }

    console.warn('User not associated with any client');
    return null;
  } catch (error) {
    console.error('Error getting client ID:', error);
    return null;
  }
};

// Synchronous version for backward compatibility (returns cached value)
let cachedClientId = null;
export const getClientIdSync = () => cachedClientId;
export const setClientId = (clientId) => { cachedClientId = clientId; };

// Initialize client ID on Firebase auth state change
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const clientId = await getClientId();
    setClientId(clientId);
  } else {
    setClientId(null);
  }
});

// Mock authentication bypass for development purposes
export const bypassAuth = () => {
  return {
    id: 'mock-user-id',
    email: 'mockuser@example.com',
    name: 'Mock User',
  };
};

// Remove authentication logic
export const disableAuth = (navigateToDashboard) => {
  navigateToDashboard(bypassAuth());
};

export const bypassLoginPage = (navigateToDashboard) => {
  // Directly navigate to the dashboard, skipping the login page
  navigateToDashboard({
    id: 'mock-user-id',
    email: 'mockuser@example.com',
    name: 'Mock User',
  });
};

export const goToDashboardDirectly = (navigateToDashboard) => {
  // Directly navigate to the dashboard with a mock user
  navigateToDashboard({
    id: 'mock-user-id',
    email: 'mockuser@example.com',
    name: 'Mock User',
  });
};

export default Auth;