import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/map';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error.message);
      } else {
        navigate('/map');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoMode(true);
    setLoading(true);
    setError('');

    try {
      // Use development mode bypass instead of Firebase auth
      window.location.href = '/?dev=true';
    } catch (err) {
      setError('Demo mode failed. Please try regular login.');
      setLoading(false);
      setDemoMode(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter">
  <div className="max-w-md w-full space-y-8 font-lato">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome to MapPro</h1>
          <p className="text-neutral-600">
            Sign in to your account
          </p>
        </div>

        {/* Demo Button */}
        <div className="text-center">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {demoMode ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Demo...
              </span>
            ) : (
              '🚀 Try Free Demo'
            )}
          </button>
          <p className="text-sm text-neutral-500 mt-2">No signup required • See MapPro in action</p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-primary-50 to-blue-100 text-neutral-500">Or continue with</span>
          </div>
        </div>

        {/* Auth Form */}
          <div className="bg-neutral-cream py-8 px-6 shadow-lg rounded-lg font-inter">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-accent-50 border border-accent-200 text-accent-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;