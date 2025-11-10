// Feature gating utility for subscription-based access control
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro'
};

export const FEATURES = {
  MAX_PROJECTS: 'max_projects',
  ADVANCED_CUSTOMIZATION: 'advanced_customization',
  PRIORITY_SUPPORT: 'priority_support',
  EXPORT_DATA: 'export_data',
  CUSTOM_BRANDING: 'custom_branding',
  ANALYTICS: 'analytics',
  API_ACCESS: 'api_access'
};

// Default feature limits for each plan
const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    [FEATURES.MAX_PROJECTS]: 5,
    [FEATURES.ADVANCED_CUSTOMIZATION]: false,
    [FEATURES.PRIORITY_SUPPORT]: false,
    [FEATURES.EXPORT_DATA]: false,
    [FEATURES.CUSTOM_BRANDING]: false,
    [FEATURES.ANALYTICS]: false,
    [FEATURES.API_ACCESS]: false
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    [FEATURES.MAX_PROJECTS]: -1, // Unlimited
    [FEATURES.ADVANCED_CUSTOMIZATION]: true,
    [FEATURES.PRIORITY_SUPPORT]: true,
    [FEATURES.EXPORT_DATA]: true,
    [FEATURES.CUSTOM_BRANDING]: true,
    [FEATURES.ANALYTICS]: true,
    [FEATURES.API_ACCESS]: true
  }
};

/**
 * Check if a client has access to a specific feature
 * @param {string} feature - The feature to check
 * @param {object} client - The client object with subscription info
 * @returns {boolean|number} - Boolean for boolean features, number for limits
 */
export const checkFeatureAccess = (feature, client) => {
  if (!client) return false;

  // Handle nested client structure from AuthContext
  const clientData = client.clients || client;
  const plan = clientData.subscription_plan || SUBSCRIPTION_PLANS.FREE;
  const isActive = clientData.subscription_status === 'active';

  // If subscription is not active, fall back to free plan
  const effectivePlan = (plan === SUBSCRIPTION_PLANS.PRO && isActive)
    ? SUBSCRIPTION_PLANS.PRO
    : SUBSCRIPTION_PLANS.FREE;

  return PLAN_FEATURES[effectivePlan][feature] || false;
};

/**
 * Check if a client can perform an action based on their current usage
 * @param {string} feature - The feature to check
 * @param {number} currentUsage - Current usage count
 * @param {object} client - The client object
 * @returns {boolean} - Whether the action is allowed
 */
export const canPerformAction = (feature, currentUsage, client) => {
  const limit = checkFeatureAccess(feature, client);

  if (typeof limit === 'number') {
    if (limit === -1) return true; // Unlimited
    return currentUsage < limit;
  }

  return Boolean(limit);
};

/**
 * Get upgrade prompt for a specific feature
 * @param {string} feature - The feature that requires upgrade
 * @returns {object} - Upgrade prompt information
 */
export const getUpgradePrompt = (feature) => {
  const prompts = {
    [FEATURES.MAX_PROJECTS]: {
      title: 'Upgrade to Pro',
      message: 'You\'ve reached the 5-project limit. Upgrade to Pro for unlimited projects.',
      cta: 'Upgrade Now'
    },
    [FEATURES.ADVANCED_CUSTOMIZATION]: {
      title: 'Advanced Customization',
      message: 'Advanced map customization is available with Pro plan.',
      cta: 'Upgrade to Pro'
    },
    [FEATURES.EXPORT_DATA]: {
      title: 'Data Export',
      message: 'Export your project data with Pro plan.',
      cta: 'Upgrade to Pro'
    },
    [FEATURES.CUSTOM_BRANDING]: {
      title: 'Custom Branding',
      message: 'Add your logo and branding with Pro plan.',
      cta: 'Upgrade to Pro'
    }
  };

  return prompts[feature] || {
    title: 'Pro Feature',
    message: 'This feature requires a Pro subscription.',
    cta: 'Upgrade Now'
  };
};

/**
 * Get usage statistics for a client
 * @param {object} client - The client object
 * @returns {object} - Usage statistics
 */
export const getUsageStats = async (client) => {
  if (!client?.id) return {};

  try {
    // This would typically fetch from your API
    // For now, return mock data
    return {
      projects: 0,
      publishedProjects: 0,
      monthlyViews: 0,
      storageUsed: 0
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {};
  }
};