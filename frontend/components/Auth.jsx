import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Auth = ({ onBackToMarketing, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, client } = useAuth();

  // Listen for auth state changes to handle client validation errors
  useEffect(() => {
    console.log('Auth component useEffect:', { user: user?.email, client: client?.name, loading });
    if (!user) {
      // User is not authenticated - reset loading state and handle errors
      console.log('User not authenticated, resetting state');
      setLoading(false);
      // Clear any existing error if it was a successful logout
      if (error === 'Access denied. You are not authorized to access this admin panel.') {
        // Keep the error message for access denied
      } else {
        setError('');
      }
    } else if (user && client) {
      // User successfully signed in and has client association
      console.log('User has client association');
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else if (user && !client) {
      // User signed in but doesn't have client association
      console.log('User signed in without client association - allowing access for development');
      setError(''); // Clear any error
      setLoading(false);
    }
  }, [user, client, loading, error, onLoginSuccess]);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setError('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called with:', { email, password });
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      console.log('Calling signIn...');
      const { error, data } = await signIn(email, password);
      console.log('signIn result:', { error, data });
      if (error) {
        setError(error.message);
        setLoading(false); // Set loading to false if there's an immediate error
      } else if (data && data.session) {
        console.log('Sign in successful, session:', data.session);
      } else {
        console.log('Sign in returned no error and no session. Data:', data);
      }
    } catch (error) {
      console.log('Sign in error (catch):', error);
      setError(error.message || 'Sign in failed');
      setLoading(false);
    }
    // Add a final log to confirm function exit
    console.log('handleSubmit finished');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your admin panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Forgot Password?
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToMarketing}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              join the wait list
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;