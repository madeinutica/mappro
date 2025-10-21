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

export const getClientId = () => {
  // Placeholder implementation for getClientId
  // Return the UUID for New York Sash
  return '550e8400-e29b-41d4-a716-446655440000'; // Fixed UUID for New York Sash
};

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