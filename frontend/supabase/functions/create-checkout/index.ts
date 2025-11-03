// Create checkout session endpoint
// Deploy as Supabase Edge Function

import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

export async function handler(req) {
  console.log('Create checkout function called');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Parsing request body...');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { clientId, planId, billingInterval = 'monthly' } = body;

    if (!clientId) {
      console.log('Client ID is required');
      return new Response(JSON.stringify({ error: 'Client ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    console.log('Environment check:', {
      hasStripeKey: !!stripeKey
    });

    if (!stripeKey) {
      console.log('Missing STRIPE_SECRET_KEY');
      return new Response(JSON.stringify({ error: 'Stripe configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the origin from request headers to create proper redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3010';
    console.log('Origin determined:', origin);

    console.log('Creating Stripe checkout session...');
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

    console.log('Checkout session created:', session.id);
    const response = { url: session.url };
    console.log('Returning response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}