import React, { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { useAuth } from '../contexts/AuthContext';

const Auth = ({ onBackToMarketing, onLoginSuccess, isLogin: initialIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, user, client } = useAuth();

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
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called with:', { email, password, isLogin, companyName, domain });
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      if (isLogin) {
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
      } else {
        console.log('Calling signUp...');
        const { error, data } = await signUp(email, password, companyName, domain);
        console.log('signUp result:', { error, data });
        if (error) {
          setError(error.message);
          setLoading(false);
        } else if (data) {
          console.log('Sign up successful:', data);
          // Registration successful, user should be automatically logged in
        }
      }
    } catch (error) {
      console.log('Auth error (catch):', error);
      setError(error.message || `${isLogin ? 'Sign in' : 'Sign up'} failed`);
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
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Access your admin panel' : 'Start your solar project map'}
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
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${isLogin ? 'rounded-b-md' : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="companyName" className="sr-only">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="domain" className="sr-only">
                    Website Domain
                  </label>
                  <input
                    id="domain"
                    name="domain"
                    type="text"
                    autoComplete="url"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="yourwebsite.com (optional)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </>
            )}
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
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;