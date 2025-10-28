// Test login with fixed AuthContext
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

function TestLogin() {
  const { signIn, user, client, loading } = useAuth();

  const handleTestLogin = async () => {
    console.log('Testing login...');
    const result = await signIn('eflorez@newyorksash.com', 'password123');
    console.log('Login result:', result);
  };

  return (
    <div>
      <h1>Test Login</h1>
      <button onClick={handleTestLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Test Login'}
      </button>
      <div>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Client: {client ? client.clients?.name : 'No client'}</p>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <AuthProvider>
    <TestLogin />
  </AuthProvider>
);