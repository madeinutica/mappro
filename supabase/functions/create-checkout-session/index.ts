// Create Stripe checkout session
// Deploy as Supabase Edge Function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

export async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const { clientId, planId, billingInterval = 'monthly' } = await req.json();

    if (!clientId || !planId) {
      return new Response(JSON.stringify({ error: 'Missing clientId or planId' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get the origin from request headers to create proper redirect URLs
    const origin = req.headers.get('origin') || 'https://your-domain.com'; // Replace with your actual domain
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: billingInterval === 'yearly' 
          ? Deno.env.get('STRIPE_PRICE_ID_YEARLY') || 'price_1SOObWJ17KVc8UXY0ODncfph'
          : Deno.env.get('STRIPE_PRICE_ID_MONTHLY') || 'price_1SOObWJ17KVc8UXY0ODncfph',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}&client_id=${clientId}&plan_id=${planId}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        client_id: clientId,
        plan_id: planId
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}