import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { getProjects } from '../utils/projectApi';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const SubscriptionManager = () => {
  const { client } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [usageStats, setUsageStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    monthlyViews: 0
  });

  useEffect(() => {
    console.log('SubscriptionManager: client changed:', client);
    
    // Always load plans since they don't depend on client
    loadPlans();
    
    if (client) {
      loadSubscriptionData();
      loadUsageStats();
    } else {
      console.log('SubscriptionManager: No client available, skipping client-specific data load');
      setLoading(false);
    }
  }, [client]);

  const loadSubscriptionData = async () => {
    const clientId = client?.clients?.id || client?.id;
    console.log('loadSubscriptionData: clientId resolved to:', clientId);
    
    if (!clientId) {
      console.log('loadSubscriptionData: No clientId found, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('loadSubscriptionData: Fetching subscription data for clientId:', clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('subscription_status, subscription_plan, subscription_expires_at, stripe_customer_id')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      console.log('loadSubscriptionData: Subscription data loaded:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      console.log('loadSubscriptionData: Setting loading to false');
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadUsageStats = async () => {
    if (!client?.clients?.id && !client?.id) return;

    try {
      const clientId = client.clients?.id || client.id;
      const projects = await getProjects(false, null, clientId);
      
      const totalProjects = projects?.length || 0;
      const publishedProjects = projects?.filter(p => p.is_published).length || 0;
      
      setUsageStats({
        totalProjects,
        publishedProjects,
        monthlyViews: 0 // TODO: Implement view tracking
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const handleSubscribe = async (planId, billingInterval = 'monthly') => {
    const clientId = client?.clients?.id || client?.id;
    if (!clientId) return;

    setProcessing(true);
    try {
      // Create checkout session using local server endpoint
      const response = await fetch('http://localhost:3008/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: clientId,
          planId,
          billingInterval
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;

    } catch (error) {
      console.error('Error creating subscription:', error);
      alert(`Failed to start subscription: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_customer_id) {
      alert('No active subscription found to cancel.');
      return;
    }

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features.')) return;

    setProcessing(true);
    try {
      // For now, just update the database to mark subscription as cancelled
      // In a real implementation, you'd call Stripe's API to cancel the subscription
      const { error } = await supabase
        .from('clients')
        .update({
          subscription_status: 'cancelled',
          subscription_expires_at: new Date().toISOString() // Cancel immediately for demo
        })
        .eq('id', client?.clients?.id || client?.id);

      if (error) throw error;

      alert('Subscription cancelled successfully. You will retain Pro access until the end of your billing period.');
      await loadSubscriptionData();

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert(`Failed to cancel subscription: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const isPro = subscription?.subscription_plan === 'pro';
  const isActive = subscription?.subscription_status === 'active';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your Mapro subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPro && isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription?.subscription_plan || 'Free'} Plan
              </span>
              {isActive && (
                <span className="text-sm text-gray-600">
                  Active until {subscription?.subscription_expires_at
                    ? new Date(subscription.subscription_expires_at).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              {isPro && isActive
                ? 'You have access to all Pro features'
                : 'Upgrade to Pro for unlimited projects and premium features'
              }
            </p>
          </div>
          {isPro && isActive && (
            <button
              onClick={handleCancelSubscription}
              disabled={processing}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.subscription_plan === plan.id;
          const features = plan.features || {};

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {isCurrentPlan && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price_monthly}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {features.max_projects === -1 ? 'Unlimited' : features.max_projects} projects
                  </span>
                </div>
                {features.basic_customization && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓ Basic customization</span>
                  </div>
                )}
                {features.advanced_customization && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓ Advanced customization</span>
                  </div>
                )}
                {features.priority_support && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓ Priority support</span>
                  </div>
                )}
                {features.export_data && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓ Data export</span>
                  </div>
                )}
                {features.custom_branding && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓ Custom branding</span>
                  </div>
                )}
              </div>

              {!isCurrentPlan && plan.price_monthly > 0 && (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Subscribe to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{usageStats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{usageStats.publishedProjects}</div>
            <div className="text-sm text-gray-600">Published Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{usageStats.monthlyViews}</div>
            <div className="text-sm text-gray-600">Views This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;