// Create checkout session endpoint
// Deploy as Supabase Edge Function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

export async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { clientId, planId, billingInterval = 'monthly' } = await req.json();

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Client ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the origin from request headers to create proper redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3010';

    // For demo purposes, create a simple checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: billingInterval === 'yearly' ? 'price_1SOObWJ17KVc8UXY0ODncfph' : 'price_1SOObWJ17KVc8UXY0ODncfph', // Use the same price for demo
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/admin?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/admin?canceled=true`,
      metadata: {
        client_id: clientId,
        plan_id: planId
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}