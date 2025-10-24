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

import { supabase } from './supabaseClient';

export const getClientId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user is associated with any client
    const { data: userClient, error } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single();

    if (error || !userClient) {
      console.warn('User not associated with any client');
      return null;
    }

    return userClient.client_id;
  } catch (error) {
    console.error('Error getting client ID:', error);
    return null;
  }
};

// Synchronous version for backward compatibility (returns cached value)
let cachedClientId = null;
export const getClientIdSync = () => cachedClientId;
export const setClientId = (clientId) => { cachedClientId = clientId; };

// Initialize client ID on auth state change
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const clientId = await getClientId();
    setClientId(clientId);
  } else if (event === 'SIGNED_OUT') {
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