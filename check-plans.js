const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://fvrueabzpinhlzyrnhne.supabase.co',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

async function checkSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*');

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return;
    }

    console.log('Current subscription plans:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkSubscriptionPlans();