const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://fvrueabzpinhlzyrnhne.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

async function updateSubscriptionPlans() {
  try {
    // First, let's see what plans exist
    const { data: existingPlans, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (fetchError) {
      console.error('Error fetching plans:', fetchError);
      return;
    }

    console.log('Existing plans:', existingPlans);

    if (!existingPlans || existingPlans.length === 0) {
      console.log('No plans found, inserting default plans...');

      // Insert the plans from the schema
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([
          {
            id: 'free',
            name: 'Free',
            description: 'Basic features for getting started',
            price_monthly: 0,
            features: {
              max_projects: 5,
              basic_customization: true,
              standard_support: true
            },
            stripe_price_id_monthly: null
          },
          {
            id: 'pro',
            name: 'Pro',
            description: 'Full access to all features',
            price_monthly: 29.99,
            features: {
              max_projects: -1,
              advanced_customization: true,
              priority_support: true,
              export_data: true,
              custom_branding: true
            },
            stripe_price_id_monthly: 'price_1SNCw4J17KVc8UXY74qnJ02sj0NToQH5NKIAXgDpe9oiWV3Hl4Ce32K3KlIPdpbUxytkiwmF0dOHGdEcy6gsUeDR00qgHUlK3q' // This is a placeholder - needs to be updated with real price ID
          }
        ]);

      if (error) {
        console.error('Error inserting plans:', error);
      } else {
        console.log('Plans inserted successfully:', data);
      }
    } else {
      console.log('Plans already exist, updating Pro plan price ID...');

      // Update the Pro plan with a placeholder price ID (user needs to replace with real one)
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          stripe_price_id_monthly: 'price_1SNCw4J17KVc8UXY74qnJ02sj0NToQH5NKIAXgDpe9oiWV3Hl4Ce32K3KlIPdpbUxytkiwmF0dOHGdEcy6gsUeDR00qgHUlK3q' // Placeholder
        })
        .eq('id', 'pro');

      if (error) {
        console.error('Error updating Pro plan:', error);
      } else {
        console.log('Pro plan updated successfully:', data);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

updateSubscriptionPlans();